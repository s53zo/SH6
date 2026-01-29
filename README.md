 # SH6 Contest Report (client-side)

  Use it online: https://s53zo.github.io/SH6/

  Static HTML/JS app that parses contest logs in your browser, fetches `cty.dat` and `MASTER.DTA` at runtime, and renders SH6-style reports. No server-side code.

  ## Quick start
  - Open the web app: https://s53zo.github.io/SH6/
  - Load a log:
    - Upload (or drag & drop) a file, or
    - Load from the public archive, or
    - Use the built-in “Demo log”
  - Optional: switch to Compare mode to load Log A + Log B side-by-side.

  ## Supported formats
  - Cabrillo: `.log`, `.cbr`
  - ADIF: `.adi`, `.adif`

  ## Features / status
  - Single + Compare mode (many reports render side-by-side)
  - Archive search: load logs from the public contest log archive (GitHub)
  - Reports include: Main, Summary, Log, Raw log, Operators, Dupes, Countries/Continents, CQ/ITU zones, rates/graphs, prefixes, callsign analysis, distance/heading, breaks, possible errors, comments, charts,
  fields map
  - Map view (Leaflet/OpenStreetMap) and KMZ downloads
  - Export: standalone HTML and PDF via browser print dialog (maps excluded)

  ## Running locally
  - Serve or open `index.html` via HTTP/HTTPS.

  ## Privacy / network
  Logs are processed locally in your browser (not uploaded).
  The app may fetch `cty.dat`, `MASTER.DTA`, and optional remote data when you use archive loading / lookups.