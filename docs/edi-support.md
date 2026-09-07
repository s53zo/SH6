# Region 1 EDI support

SH6 accepts the Vienna 1998 Region 1 EDI format used by VHF and above contests. EDI files are recognized by the `.edi` extension or the `[REG1TEST;version]` signature.

The parser keeps the original header, remarks, declared record count, all 15 QSO fields, mode code, transmit/receive mode, serials, received exchange, locator, logged points, new multiplier flags, duplicate flag, and line-numbered warnings. The original text remains available to session save/load and raw-log views; locally uploaded files retain their original bytes through saved sessions and durable autosave metadata for faithful original-log export.

EDI `PBand` is a band designation, not an exact operating frequency. SH6 normalizes known designations such as `144 MHz` and decimal-comma `1,3 GHz` to its band labels while leaving `freq` unavailable. Frequency-dependent reports therefore remain unavailable unless individual EDI records provide frequency data.

EDI does not define one universal scoring formula. SH6 shows logged QSO points and claimed totals with their provenance unless the contest can be matched safely to an existing scoring rule. Source duplicate flags are retained separately from SH6 duplicate detection. `ERROR` records remain in raw/audit data but are excluded from derived contact totals.

Malformed rows, unsupported versions, unknown mode codes, invalid dates/times/points, missing signatures, declared-record mismatches, and records beyond a declared count appear as warnings with source line numbers. Files without valid `TDate` use the documented 1970/2000 two-digit-year fallback and report that fallback. Browser uploads above 100 MB are rejected before decoding.
