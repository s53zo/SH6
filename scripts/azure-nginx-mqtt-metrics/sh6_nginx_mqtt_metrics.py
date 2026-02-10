#!/usr/bin/env python3
"""SH6 Azure nginx access log (journald) -> 60s aggregates -> MQTT JSON.

- Expects nginx access_log lines to be valid JSON (see nginx log_format in install docs).
- Aggregates with bounded dimensions (route_group, endpoint_family, status_bucket).
- Publishes once per interval (default 60s).

Design goals:
- Low cardinality (no callsign/IP/UA/querystring in tags).
- Works without Python deps by using mosquitto_pub if paho-mqtt isn't available.
"""

from __future__ import annotations

import json
import os
import select
import shlex
import subprocess
import sys
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, str(default)).strip())
    except Exception:
        return default


def _env_str(name: str, default: str) -> str:
    v = os.environ.get(name)
    if v is None:
        return default
    v = v.strip()
    return v if v else default


@dataclass
class MetricAgg:
    count: int = 0
    bytes_out: int = 0
    items: int = 0
    rt_sum_ms: float = 0.0
    rt_samples_ms: List[float] = None  # small bounded reservoir

    def __post_init__(self) -> None:
        if self.rt_samples_ms is None:
            self.rt_samples_ms = []


def _status_bucket(code: int) -> str:
    if code == 429:
        return "429"
    if 200 <= code <= 299:
        return "2xx"
    if 300 <= code <= 399:
        return "3xx"
    if 400 <= code <= 499:
        return "4xx"
    if 500 <= code <= 599:
        return "5xx"
    return "other"


def _route_group_and_family(uri: str) -> Tuple[str, str]:
    # Keep these stable and bounded.
    u = uri or ""

    if u.startswith("/cors/rbn"):
        return ("rbn", "rbn")

    if u.startswith("/cors/cqapi/"):
        rest = u[len("/cors/cqapi/") :]
        # Examples:
        # - cqwpx/raw/cw/callsign/S53M
        # - cqwpx/score/cw/callsign/S53M
        # - cqwpx/record/cw/callsign/S53M
        # - cqwpx/geolist
        # - cqwpx/catlist
        parts = [p for p in rest.split("/") if p]
        family = "cqapi_other"
        if len(parts) >= 2:
            if parts[1] in ("raw", "score", "record"):
                family = f"cqapi_{parts[1]}"
        if len(parts) >= 1 and parts[0] in ("cqwpx", "cqww"):
            # Keep contest name out of tags to reduce cardinality.
            pass
        if parts and parts[-1] in ("geolist", "catlist"):
            family = f"cqapi_{parts[-1]}"
        return ("cqapi", family)

    if u.startswith("/cors/qrz"):
        return ("lookup", "qrz")

    if u.startswith("/sh6/lookup") or u.startswith("/lookup"):
        return ("lookup", "sh6_lookup")

    if u == "/cors/cty.dat":
        return ("static", "cty")

    if u == "/cors/MASTER.DTA":
        return ("static", "master")

    if u.startswith("/spots/"):
        return ("spots", "spots_file")

    if u == "/livescore":
        return ("livescore", "livescore")

    if u == "/livescore-pilot":
        return ("livescore", "livescore_pilot")

    if u.startswith("/reports/"):
        return ("reports", "reports")

    if u.startswith("/SH6/") or u == "/" or u.startswith("/assets/"):
        return ("static", "site")

    if u.startswith("/cors/"):
        return ("cors_other", "cors_other")

    return ("other", "other")


def _quantile(values: List[float], q: float) -> Optional[float]:
    if not values:
        return None
    vs = sorted(values)
    if len(vs) == 1:
        return vs[0]
    idx = int(round((len(vs) - 1) * q))
    idx = max(0, min(len(vs) - 1, idx))
    return vs[idx]


class MqttPublisher:
    def __init__(self) -> None:
        self.host = _env_str("MQTT_HOST", "localhost")
        self.port = _env_int("MQTT_PORT", 1883)
        self.user = _env_str("MQTT_USER", "")
        self.password = _env_str("MQTT_PASS", "")
        self.topic = _env_str("MQTT_TOPIC", "SH6/nginx/1m")
        self.qos = _env_int("MQTT_QOS", 1)

        self._paho = None
        if _env_int("MQTT_FORCE_MOSQUITTO_PUB", 0) != 1:
            try:
                import paho.mqtt.client as mqtt  # type: ignore

                self._paho = mqtt
            except Exception:
                self._paho = None

    def publish(self, payload: Dict[str, Any]) -> None:
        data = json.dumps(payload, separators=(",", ":"), ensure_ascii=True)
        if self._paho is not None:
            self._publish_paho(data)
            return
        self._publish_mosquitto_pub(data)

    def _publish_paho(self, data: str) -> None:
        mqtt = self._paho
        assert mqtt is not None

        client = mqtt.Client(protocol=mqtt.MQTTv311)
        if self.user:
            client.username_pw_set(self.user, self.password)

        # One-shot connect/publish/disconnect is simple and robust at 60s cadence.
        client.connect(self.host, self.port, keepalive=30)
        client.loop_start()
        info = client.publish(self.topic, payload=data, qos=self.qos, retain=False)
        info.wait_for_publish(timeout=10)
        client.loop_stop()
        client.disconnect()

    def _publish_mosquitto_pub(self, data: str) -> None:
        cmd = [
            "mosquitto_pub",
            "-h",
            self.host,
            "-p",
            str(self.port),
            "-t",
            self.topic,
            "-q",
            str(self.qos),
            "-m",
            data,
        ]
        if self.user:
            cmd += ["-u", self.user, "-P", self.password]

        # Don't spam stderr on transient broker issues; systemd will capture logs.
        subprocess.run(cmd, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def _bucket_start(now_s: float, interval_s: int) -> float:
    return now_s - (now_s % interval_s)


def main() -> int:
    interval_s = _env_int("PUBLISH_INTERVAL_S", 60)
    host_tag = _env_str("HOST_TAG", "azure.s53m.com")
    reservoir_max = _env_int("RT_RESERVOIR_MAX", 3000)

    pub = MqttPublisher()

    # Follow nginx systemd unit logs (nginx is podman container; access log is stdout).
    cmd = [
        "journalctl",
        "-u",
        "nginx.service",
        "-f",
        "-o",
        "cat",
        "--no-pager",
    ]

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
    assert proc.stdout is not None

    agg: Dict[Tuple[str, str, str], MetricAgg] = {}
    dropped = 0

    now = time.time()
    bucket0 = _bucket_start(now, interval_s)
    next_flush = bucket0 + interval_s

    def flush(ts_end_s: float) -> None:
        nonlocal agg, dropped

        ts_start_s = ts_end_s - interval_s

        metrics = []
        total = 0
        for (route_group, endpoint_family, status), m in sorted(agg.items()):
            total += m.count
            rt_avg_ms = (m.rt_sum_ms / m.count) if m.count else 0.0
            rt_p95_ms = _quantile(m.rt_samples_ms, 0.95)
            item = {
                "route_group": route_group,
                "endpoint_family": endpoint_family,
                "status": status,
                "count": m.count,
                "bytes_out": m.bytes_out,
                "items": m.items,
                "rt_avg_ms": round(rt_avg_ms, 2),
            }
            if rt_p95_ms is not None:
                item["rt_p95_ms"] = round(rt_p95_ms, 2)
            metrics.append(item)

        payload = {
            "schema": 1,
            "bucket": f"{interval_s}s",
            "host": host_tag,
            "ts_start_ms": int(ts_start_s * 1000),
            "ts_end_ms": int(ts_end_s * 1000),
            "total_requests": total,
            "dropped_lines": dropped,
            "metrics": metrics,
        }

        pub.publish(payload)
        agg = {}
        dropped = 0

    while True:
        try:
            now = time.time()
            timeout = max(0.1, min(1.0, next_flush - now))

            rlist, _, _ = select.select([proc.stdout], [], [], timeout)
            if rlist:
                line = proc.stdout.readline()
                if not line:
                    # process ended
                    break
                line = line.strip()
                if not line:
                    continue
                if not line.startswith("{"):
                    continue
                try:
                    ev = json.loads(line)
                except Exception:
                    dropped += 1
                    continue

                # Expected keys from nginx log_format.
                uri = str(ev.get("uri") or "")
                status_raw = ev.get("status")
                bytes_raw = ev.get("bytes")
                rt_raw = ev.get("rt")
                items_raw = ev.get("items")

                try:
                    status = int(status_raw)
                    bytes_out = int(bytes_raw)
                    rt_s = float(rt_raw)
                except Exception:
                    dropped += 1
                    continue

                # Upstream can optionally send X-SH6-Items (captured into the log as "items").
                items = 0
                try:
                    if items_raw is not None:
                        s = str(items_raw).strip()
                        if s and s != "-":
                            items = int(float(s))
                except Exception:
                    items = 0

                route_group, endpoint_family = _route_group_and_family(uri)
                sb = _status_bucket(status)

                key = (route_group, endpoint_family, sb)
                m = agg.get(key)
                if m is None:
                    m = MetricAgg()
                    agg[key] = m

                m.count += 1
                m.bytes_out += max(0, bytes_out)
                m.items += max(0, items)

                rt_ms = max(0.0, rt_s * 1000.0)
                m.rt_sum_ms += rt_ms

                # Reservoir: keep up to N samples.
                if reservoir_max > 0:
                    if len(m.rt_samples_ms) < reservoir_max:
                        m.rt_samples_ms.append(rt_ms)
                    else:
                        # Replace a random-ish element without importing random.
                        # This is not perfect reservoir sampling; good enough for rough p95.
                        idx = m.count % reservoir_max
                        m.rt_samples_ms[idx] = rt_ms

            now = time.time()
            if now >= next_flush:
                flush(next_flush)
                next_flush = _bucket_start(now, interval_s) + interval_s

        except KeyboardInterrupt:
            break
        except Exception:
            # Avoid dying on parsing glitches.
            time.sleep(0.2)

    try:
        proc.terminate()
    except Exception:
        pass

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
