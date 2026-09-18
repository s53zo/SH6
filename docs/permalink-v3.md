# SH6 `v3` permalink format

SH6 6.3.31 adds a shorter, synchronous, offline permalink encoding while retaining the public `state` query parameter. A generated link compares the existing `v2` representation with `v3` and uses `v3` only when it is shorter.

```text
v3.<unpadded-base64url(raw-deflate(utf8(positional-json)))>
```

The prefix and positional payload both carry a version. Existing non-prefixed JSON links and `v2.` compact-object links remain supported indefinitely. An unknown versioned prefix is rejected rather than being interpreted as legacy Base64URL.

## Top-level positional schema

The root is an array. Index 0 is the integer schema version `3`; indexes 1–23 map explicitly to the existing compact `v2` state. Property iteration order is never used.

| Index | Compact key | Meaning |
| ---: | --- | --- |
| 0 | — | Positional schema version (`3`) |
| 1 | `am` | Analysis mode |
| 2 | `c` | Compare count |
| 3 | `cs` | Compare score mode |
| 4 | `mv` | Multiplier overview tuple |
| 5 | `mo` | Multiplier Opportunities tuple |
| 6 | `sy` | Synchronized scrolling |
| 7 | `sk` | Sticky compare headings |
| 8 | `tr` | Synchronized time range `[start, end]` |
| 9 | `f` | Compare-focus tuple |
| 10 | `g` | Global band filter |
| 11 | `gr` | Global Radio filter |
| 12 | `rh` | Radio heatmap tuple |
| 13 | `b` | Break threshold |
| 14 | `p` | Passed-QSO window |
| 15 | `z` | Log page size |
| 16 | `n` | Log page |
| 17 | `w` | Compare Log window start |
| 18 | `x` | Compare Log window size |
| 19 | `wp` | WPX column mode |
| 20 | `py` | Selected years |
| 21 | `pm` | Selected months |
| 22 | `l` | Log-filter tuple |
| 23 | `s` | Slot tuples |

Optional trailing positions are removed. A JSON `null` position means “omitted.” In nullable multiplier scalar positions, an empty tuple `[]` is the explicit-null marker, so legitimate `null`, zero, `false`, and an empty string remain distinguishable. A decoder may ignore up to eight validated future top-level positions. New fields must only be appended; changing the meaning of an existing position requires a new schema/prefix version.

Known fields and nested tuple lengths are type-checked before restoration. The encoder also fails closed if a compact object contains an unknown top-level or nested key, causing normal permalink generation to retain the lossless `v2` representation until the `v3` schema is deliberately extended. Raw slot keys are the sole intentional exception because they are explicitly forbidden from permalink state.

## Nested tuples

Fields appear in the listed order. Nested tuples also omit trailing absent positions.

- Slot: `i, k, n, z, o, p, q, t, s, r` (ID, skipped flag, filename, size, source, archive path, rule override, source type, spot settings, RBN settings).
- Spot settings: `w, b`; RBN settings: `w, b, d`.
- Multiplier overview: `view, cumulativeBy, windowMinutes, mode, group, yScale, tradeoffBySlot`. The final legacy-compatible field uses fixed A/B/C/D positions.
- Legacy multiplier slot settings: `at, lookbackMinutes, targetGroup, targetBand, targetMode, targetScope, targetWeight, averagePoints, horizonMinutes, scenarios`. Scenarios use fixed RUN/S&P/hunt positions and the recognized fields from `modules/multipliers/settings.js`.
- Multiplier Opportunities: `r, w, s, p, g, b, m, c, e, t`.
- Compare focus: `c, r, m, o, p, q, u, v, s, w, t`, matching the documented compact keys in the session codec.
- Radio heatmap: `m, a, b`.
- Log filters: `s, f, b, m, j, o, l, t, c, k, q, i, v, r, rd, y, h, u, d`; operating style `v` is `[band, role]` and ranges retain their existing two-number form.

The encoder omits slot values already derived by the existing `v2` inflater: an archive filename identical to the path basename, the default `Archive`/`Local` source label, and the redundant `a`/`l` source-type flag. This preserves the normalized session while reducing the supplied mixed four-log example to 181 characters.

Raw uploaded log text and raw bytes have no positions in the schema and therefore cannot enter a normal `v3` permalink.

## Compression and dependency

`vendor/fflate-raw.js` is a tree-shaken ESM bundle containing only `deflateSync` and streaming `Inflate` from [fflate 0.8.3](https://github.com/101arrowz/fflate), licensed under MIT. The vendored production file is approximately 8.9 KB uncompressed / 4.4 KB gzip; the license is retained in `vendor/fflate-LICENSE.txt`. No CDN, network request, worker, or asynchronous startup change is required.

The npm tarball integrity is `sha512-tbZNuJrLwGUp3zshBtdy4W+ORxZuIh8a5ilyIEQDC5rY1f3U20JMry0Ll3WBzU58EZKsEuJFXhb5gwv8CsPvgA==`. The vendored module SHA-256 is `3641cce13c82df9ce4d91c8d8d2add2609c6c1c84f89a6f56021d79d85b20010`. It was produced with esbuild 0.25.9 from this one-line entry:

```js
export { deflateSync, Inflate } from './package/esm/browser.js';
```

using `esbuild entry.js --bundle --format=esm --minify --legal-comments=inline` plus the license/source banner present at the top of the vendored file.

Encoding uses fflate level 9 with fixed options. Identical input produces identical output in the vendored implementation. Tests assert deterministic round trips rather than pinning compressed bytes.

## Safety limits

| Limit | Value |
| --- | ---: |
| Base64URL body | 32,768 characters |
| Compressed bytes | 24,576 bytes |
| Decompressed UTF-8 JSON | 131,072 bytes |
| Nesting depth | 12 |
| Values/nodes | 4,096 |
| Any array | 64 entries |
| Any string | 4,096 UTF-16 code units |
| Slots | 4, with unique IDs A–D |
| Inflate input chunk | 256 bytes |

Inflation is streamed in small input chunks and stopped as soon as output crosses the cap, preventing a small URL from expanding without bound. Base64URL must be unpadded, canonical, and use only the URL-safe alphabet. UTF-8 decoding is fatal. Positional JSON may contain only arrays and scalar JSON values—never arbitrary objects—then passes through the existing compact-session normalization.

fflate's streaming raw inflater does not expose an exact consumed-byte offset. Truncated and corrupt streams fail, but bytes appended after a complete raw-DEFLATE member may be ignored by the dependency. The codec therefore cannot independently prove that a stream had no inert trailing compressed bytes. This is the only known trailing-data limitation.

## Why not plain CBOR or MessagePack?

The evaluated plain binary encodings remove JSON property names but do not exploit repeated archive paths and settings as effectively as raw DEFLATE. Compressed positional JSON produced the shortest tested URLs while keeping the pre-compression form human-inspectable, versionable, and dependency-light. Compressing CBOR or MessagePack as well would add another codec and schema surface for little or no URL benefit.

## Representative results

Run `node scripts/run-permalink-size-diagnostics.mjs` for current measurements. On the deterministic fixtures used for 6.3.31:

| Session | `v2` chars | `v3` chars | Reduction |
| --- | ---: | ---: | ---: |
| Minimal one-log | 95 | 54 | 43.2% |
| Supplied two-log | 255 | 115 | 54.9% |
| Supplied mixed four-log | 505 | 181 | 64.2% |
| Feature-rich four-log | 1,473 | 478 | 67.5% |
| Worst-case legitimate fixture | 28,753 | 20,865 | 27.4% |

Encoding and decoding the ordinary fixtures take well under a millisecond on the test machine; the intentionally large worst case remains a few milliseconds.
