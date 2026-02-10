# SH6 Azure nginx -> MQTT metrics (60s)

This is meant to run on `azure.s53m.com`.

## What it does
- Reads nginx access log lines from `journald` (`journalctl -u nginx.service -f`).
- Aggregates every `PUBLISH_INTERVAL_S` (default `60`) by:
  - `route_group`
  - `endpoint_family`
  - `status` bucket (`2xx`, `3xx`, `4xx`, `429`, `5xx`)
- Publishes one JSON payload per interval to MQTT.

## MQTT payload schema
Topic (default): `SH6/nginx/1m`

Payload:
```json
{
  "schema": 1,
  "bucket": "60s",
  "host": "azure.s53m.com",
  "ts_start_ms": 1700000000000,
  "ts_end_ms": 1700000060000,
  "total_requests": 123,
  "dropped_lines": 0,
  "metrics": [
    {
      "route_group": "rbn",
      "endpoint_family": "rbn",
      "status": "2xx",
      "count": 87,
      "bytes_out": 123456,
      "rt_avg_ms": 28.4,
      "rt_p95_ms": 62.1
    }
  ]
}
```

## Nginx JSON access log requirement
nginx needs to emit JSON access lines that look like:

```json
{"ts":"2026-02-10T22:40:12+00:00","method":"GET","uri":"/cors/rbn","status":200,"bytes":1234,"rt":0.042,"host":"azure.s53m.com"}
```

Recommended snippet (place in the `http {}` block):

```nginx
log_format sh6_json escape=json '{'
  '"ts":"$time_iso8601",'
  '"method":"$request_method",'
  '"uri":"$uri",'
  '"status":$status,'
  '"bytes":$body_bytes_sent,'
  '"rt":$request_time,'
  '"host":"$host"'
'}';
```

And use it:

```nginx
access_log /dev/stdout sh6_json;
```

## Install on Azure (manual)
- Copy files to `/opt/SH6/nginx-mqtt-metrics/`
- Create `/etc/sh6-nginx-mqtt-metrics.env` (chmod 600) with:

```bash
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USER=REDACTED
MQTT_PASS=REDACTED
MQTT_TOPIC=SH6/nginx/1m
MQTT_QOS=1
PUBLISH_INTERVAL_S=60
HOST_TAG=azure.s53m.com
```

- Install systemd unit:

```bash
sudo cp sh6-nginx-mqtt-metrics.service /etc/systemd/system/sh6-nginx-mqtt-metrics.service
sudo systemctl daemon-reload
sudo systemctl enable --now sh6-nginx-mqtt-metrics.service
```

## Node-RED -> Influx mapping (function node)
Subscribe to `SH6/#`, parse JSON, and emit one Influx point per `metrics[]` item.

Example function (InfluxDB v1 node-red-contrib-influxdb):

```js
// msg.payload is the JSON object
const p = msg.payload;
const points = [];
for (const m of (p.metrics || [])) {
  points.push({
    measurement: 'sh6_api_usage_1m',
    tags: {
      host: p.host,
      route_group: m.route_group,
      endpoint_family: m.endpoint_family,
      status: m.status,
    },
    fields: {
      count: Number(m.count || 0),
      bytes_out: Number(m.bytes_out || 0),
      rt_avg_ms: Number(m.rt_avg_ms || 0),
      rt_p95_ms: Number(m.rt_p95_ms || 0),
      dropped_lines: Number(p.dropped_lines || 0),
    },
    timestamp: new Date(p.ts_end_ms || Date.now()),
  });
}
msg.payload = points;
return msg;
```
