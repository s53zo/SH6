# Plan: Azure Nginx API Usage Metrics via MQTT -> Node-RED -> InfluxDB

**Generated**: 2026-02-10
**Estimated Complexity**: Medium

## Overview
Publish aggregated SH6 Azure API usage metrics derived from nginx access logs to an MQTT topic. Node-RED (running near InfluxDB) subscribes to MQTT, transforms messages into Influx line protocol (or InfluxDB node payload), and writes into a local InfluxDB. Grafana queries InfluxDB to visualize usage, latency, and 429 rate limiting trends.

Key design choices:
- Measure at the edge (nginx) so all clients are covered, not just the browser UI.
- Publish aggregates (per 10s/60s) to keep volume low and avoid high-cardinality metrics.
- Keep a stable schema (small, bounded tag set) so InfluxDB remains fast.

## Prerequisites
- SSH access to `azure.s53m.com` and ability to edit `/opt/nginx-certbot/default.conf` + reload nginx container.
- An MQTT broker reachable by Node-RED.
  - Option A (recommended): reuse existing `mosquitto-*` on `azure.s53m.com` and allow Node-RED to connect to it (directly or via bridge).
  - Option B: local broker near Node-RED, and bridge from Azure -> local.
- Node-RED has an MQTT in node and an InfluxDB out node configured for your local InfluxDB.
- Decide retention policy / bucket (InfluxDB v1 vs v2).

## Open Questions (to finalize decisions)
1. Where should the MQTT broker live (Azure existing mosquitto vs local near Influx), and can Node-RED reach it over the network?
2. Do we require TLS + username/password (recommended), or is this in a private network?
3. Desired publish interval: `10s` for near-realtime vs `60s` for lower load?
4. What dimensions do you need in Grafana:
   - Route group only (`rbn`, `cqapi`, `lookup`, `spots`, `static`)?
   - Or also endpoint family (`/cors/cqapi/*` subkeys) with a bounded list?
5. Do you want per-IP visibility (usually no; too high-cardinality), or only global totals?

## Sprint 1: Define Schema + Node-RED Ingest (No Azure Changes Yet)
**Goal**: Node-RED can ingest test MQTT messages and write them to InfluxDB with a stable measurement/tag layout.
**Demo/Validation**:
- Publish a test message with `mosquitto_pub` and verify a new point in InfluxDB.
- Grafana can plot request counts over time for a single route group.

### Task 1.1: Define MQTT topic + payload schema
- **Location**: `azure-nginx-mqtt-influx-plan.md` (this doc)
- **Description**:
  - Topic: `sh6/azure/nginx/metrics/1m` (or `.../10s`).
  - Payload JSON (example):
    - `ts` (UTC ms or RFC3339)
    - `host` (e.g. `azure.s53m.com`)
    - `route_group` (one of: `rbn`, `cqapi`, `lookup`, `spots`, `static`, `other`)
    - `status` (one of: `2xx`, `3xx`, `4xx`, `429`, `5xx`)
    - `count`
    - `bytes_out`
    - `rt_avg_ms`
    - `rt_p95_ms` (optional in Sprint 2/3)
- **Acceptance Criteria**:
  - Route groups and status buckets are bounded enumerations.
  - No callsign/IP/user-agent in tags.

### Task 1.2: Build Node-RED flow: MQTT -> InfluxDB
- **Location**: Node-RED (flow export saved if desired)
- **Description**:
  - MQTT-in subscribes to `sh6/azure/nginx/metrics/#`.
  - JSON parse node.
  - Function node maps payload to InfluxDB measurement:
    - Measurement: `sh6_api_usage`
    - Tags: `host`, `route_group`, `status`
    - Fields: `count`, `bytes_out`, `rt_avg_ms`, `rt_p95_ms`
    - Timestamp: `ts`
- **Acceptance Criteria**:
  - One published test message results in one row/point in InfluxDB.

### Task 1.3: Grafana smoke dashboard
- **Location**: Grafana
- **Description**:
  - Panels:
    - Requests/min by `route_group`
    - 429 rate by `route_group`
    - Latency avg (and p95 if available) by `route_group`
- **Acceptance Criteria**:
  - Panels show data for test messages.

## Sprint 2: Emit Structured Nginx Access Logs (Azure)
**Goal**: nginx emits access logs with fields needed for aggregation (route group, status, bytes, request time) in a parseable format.
**Demo/Validation**:
- Hit a few endpoints and confirm log lines contain the required JSON keys.

### Task 2.1: Add a JSON log_format in nginx
- **Location**: `/opt/nginx-certbot/default.conf` on `azure.s53m.com`
- **Description**:
  - Define `log_format sh6_json escape=json '{...}'` including:
    - `$time_iso8601`, `$request_method`, `$uri`, `$status`, `$body_bytes_sent`, `$request_time`
  - Use it for the SH6 server `access_log /dev/stdout sh6_json;`
- **Acceptance Criteria**:
  - Log lines are JSON and include request time + status + URI.
- **Validation**:
  - `sudo podman exec <nginx> nginx -t` then reload.

### Task 2.2: Route grouping logic definition
- **Location**: aggregator (Sprint 3) but specify now
- **Description**:
  - `rbn`: `/cors/rbn`
  - `cqapi`: `/cors/cqapi/`
  - `lookup`: `/sh6/lookup`
  - `spots`: `/spots/`
  - `static`: `/cors/cty.dat`, `/cors/MASTER.DTA`
  - `other`: everything else
- **Acceptance Criteria**:
  - Stable grouping without unbounded values.

## Sprint 3: Azure Aggregator -> MQTT Publisher
**Goal**: A small daemon tails nginx JSON access logs, aggregates metrics per interval, publishes to MQTT.
**Demo/Validation**:
- With real traffic, MQTT messages appear each interval, Node-RED writes them to InfluxDB, Grafana shows live graphs.

### Task 3.1: Implement aggregator daemon
- **Location**: New directory on Azure, e.g. `/opt/SH6/nginx-mqtt-metrics/`
- **Description**:
  - Input: `journalctl -u nginx.service -f` (or container logs) and parse JSON access entries.
  - Aggregate in memory per bucket:
    - key = `(route_group, status_bucket)`
    - values = `count`, `bytes_out_sum`, `rt_sum_ms`, plus optional p95 via reservoir/histogram.
  - Publish once per interval to MQTT topic.
- **Acceptance Criteria**:
  - Publishes even if there are no requests (optional: publish zeros or skip).
  - Handles MQTT disconnects (retry with backoff).
  - Does not publish per-request (only aggregates).

### Task 3.2: systemd unit for aggregator
- **Location**: `/etc/systemd/system/sh6-nginx-mqtt-metrics.service`
- **Description**:
  - Auto-restart on failure
  - Logs to journald
- **Acceptance Criteria**:
  - `systemctl status` shows healthy, auto-starts on boot.

### Task 3.3: MQTT auth and ACLs
- **Location**: mosquitto config (wherever broker runs)
- **Description**:
  - Create a dedicated user for publishing (`sh6_publisher`)
  - ACL allow publish only to `sh6/azure/nginx/metrics/#`
  - Node-RED user allowed subscribe to same topic(s)
- **Acceptance Criteria**:
  - Unauthorized clients cannot publish/subscribe broadly.

## Sprint 4: Hardening + Alerts
**Goal**: Metrics are reliable, secure, and actionable.
**Demo/Validation**:
- Simulate rate limiting and confirm 429 panel + alert triggers.

### Task 4.1: Latency percentiles
- **Description**:
  - Add p50/p95 from histogram buckets or streaming quantiles.
- **Acceptance Criteria**:
  - Grafana can plot p95 latency for `rbn` and `cqapi`.

### Task 4.2: Alerts
- **Description**:
  - Alerts on:
    - sustained 429s/min above threshold
    - 5xx spikes
    - latency p95 above threshold
- **Acceptance Criteria**:
  - Alerts fire on test conditions.

## Testing Strategy
- Unit-ish: feed sample nginx JSON log lines into aggregator and verify outputs.
- Integration:
  - Publish test MQTT messages and validate Influx write.
  - End-to-end: hit `/cors/rbn` and verify metrics increments in Grafana.

## Potential Risks & Gotchas
- Nginx log format changes must not break other consumers; keep it scoped and tested (`nginx -t`).
- High-cardinality tags (endpoint, callsign, IP) will hurt Influx performance; avoid.
- MQTT connectivity between Azure and Node-RED may require firewall changes or broker bridging.
- Node-RED function node should validate schema (drop malformed messages).

## Rollback Plan
- On Azure:
  - Stop/disable aggregator systemd service.
  - Revert nginx `log_format/access_log` change and reload nginx.
- On Node-RED:
  - Disable the flow or unsubscribe from the topic.
