use lazy_static::lazy_static;
use std::collections::HashMap;
use std::fs::{self, OpenOptions};
use std::io::{self, BufRead, BufReader, Read, Seek, SeekFrom, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

const CACHE_DIR: &str = "/tmp/rbn_cache_rs";
const LIVE_DIR: &str = "/tmp/rbn_live_rs";
const BASE_URL: &str = "https://data.reversebeacon.net/rbn_history";
const MAX_DAYS: usize = 2;
const TIMEOUT_SECS: u64 = 90;
const MAX_CACHE_BYTES: u64 = 3 * 1024 * 1024 * 1024;
const MAX_CACHE_AGE_SECONDS: u64 = 60 * 60;
const MAX_SPOTS_PER_SIDE: usize = 100_000;

const TELNET_HOST: &str = "telnet.reversebeacon.net";
const TELNET_PORT: u16 = 7000;
const TELNET_LOGIN: &str = "S53M-17";
const TELNET_RECONNECT_SECS: u64 = 5;
const LIVE_FINALIZE_CHECK_SECS: u64 = 300;
const DEFAULT_LIVE_LIMIT: usize = 1_000;
const MAX_LIVE_LIMIT: usize = 5_000;
const DEFAULT_LIVE_LOOKBACK_SECONDS: u64 = 900;
const MAX_LIVE_LOOKBACK_SECONDS: u64 = 3_600;

lazy_static! {
    static ref SCAN_LOCK: Mutex<()> = Mutex::new(());
    static ref LIVE_LOCK: Mutex<()> = Mutex::new(());
}

#[derive(Clone)]
struct Spot {
    spotter: String,
    spotterRaw: String,
    dxCall: String,
    freqKHz: Option<f64>,
    band: String,
    mode: String,
    snr: Option<f64>,
    speed: Option<f64>,
    txMode: String,
    ts: Option<i64>,
}

struct DayError {
    day: String,
    error: String,
}

struct LiveBatch {
    day: String,
    next_offset: u64,
    spots: Vec<Spot>,
    has_more: bool,
    malformed: usize,
}

fn base_call(call: &str) -> String {
    let mut normalized = call.trim().to_uppercase();
    if normalized.is_empty() {
        return String::new();
    }
    if let Some(idx) = normalized.find('-') {
        normalized.truncate(idx);
    }
    let parts: Vec<&str> = normalized.split('/').collect();
    if parts.len() == 1 {
        return parts[0].to_string();
    }
    let mut best = "";
    for part in &parts {
        if part.is_empty() {
            continue;
        }
        if part.chars().any(|ch| ch.is_ascii_digit()) && part.len() > best.len() {
            best = part;
        }
    }
    if !best.is_empty() {
        return best.to_string();
    }
    parts[0].to_string()
}

fn is_valid_call(call: &str) -> bool {
    let len = call.len();
    if len < 3 || len > 20 {
        return false;
    }
    call.chars()
        .all(|ch| ch.is_ascii_uppercase() || ch.is_ascii_digit() || ch == '/' || ch == '-')
}

fn json_escape(value: &str) -> String {
    let mut out = String::with_capacity(value.len() + 8);
    for ch in value.chars() {
        match ch {
            '\\' => out.push_str("\\\\"),
            '"' => out.push_str("\\\""),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if c.is_control() => out.push_str(&format!("\\u{:04x}", c as u32)),
            _ => out.push(ch),
        }
    }
    out
}

fn json_string(value: &str) -> String {
    format!("\"{}\"", json_escape(value))
}

fn json_opt_f64(value: Option<f64>) -> String {
    match value {
        Some(num) => num.to_string(),
        None => "null".to_string(),
    }
}

fn json_opt_i64(value: Option<i64>) -> String {
    match value {
        Some(num) => num.to_string(),
        None => "null".to_string(),
    }
}

fn spot_to_json(spot: &Spot) -> String {
    let mut out = String::from("{");
    out.push_str("\"spotter\":");
    out.push_str(&json_string(&spot.spotter));
    out.push_str(",\"spotterRaw\":");
    out.push_str(&json_string(&spot.spotterRaw));
    out.push_str(",\"dxCall\":");
    out.push_str(&json_string(&spot.dxCall));
    out.push_str(",\"freqKHz\":");
    out.push_str(&json_opt_f64(spot.freqKHz));
    out.push_str(",\"band\":");
    out.push_str(&json_string(&spot.band));
    out.push_str(",\"mode\":");
    out.push_str(&json_string(&spot.mode));
    out.push_str(",\"snr\":");
    out.push_str(&json_opt_f64(spot.snr));
    out.push_str(",\"speed\":");
    out.push_str(&json_opt_f64(spot.speed));
    out.push_str(",\"txMode\":");
    out.push_str(&json_string(&spot.txMode));
    out.push_str(",\"ts\":");
    out.push_str(&json_opt_i64(spot.ts));
    out.push('}');
    out
}

fn spots_to_json(spots: &[Spot]) -> String {
    let mut out = String::from("[");
    for (idx, spot) in spots.iter().enumerate() {
        if idx > 0 {
            out.push(',');
        }
        out.push_str(&spot_to_json(spot));
    }
    out.push(']');
    out
}

fn errors_to_json(errors: &[DayError]) -> String {
    let mut out = String::from("[");
    for (idx, err) in errors.iter().enumerate() {
        if idx > 0 {
            out.push(',');
        }
        out.push_str("{\"day\":");
        out.push_str(&json_string(&err.day));
        out.push_str(",\"error\":");
        out.push_str(&json_string(&err.error));
        out.push('}');
    }
    out.push(']');
    out
}

fn ensure_cache_dir() -> io::Result<()> {
    fs::create_dir_all(CACHE_DIR)
}

fn ensure_live_dir() -> io::Result<()> {
    fs::create_dir_all(LIVE_DIR)
}

fn prune_cache(keep: Option<&Path>) {
    if ensure_cache_dir().is_err() {
        return;
    }
    let mut entries: Vec<(SystemTime, PathBuf, u64)> = Vec::new();
    let mut total: u64 = 0;
    let now = SystemTime::now();
    let keep_path = keep.and_then(|p| fs::canonicalize(p).ok());

    let dir = match fs::read_dir(CACHE_DIR) {
        Ok(dir) => dir,
        Err(_) => return,
    };
    for entry in dir.flatten() {
        let path = entry.path();
        if path.extension().and_then(|s| s.to_str()) != Some("zip") {
            continue;
        }
        let meta = match fs::metadata(&path) {
            Ok(meta) => meta,
            Err(_) => continue,
        };
        let modified = meta.modified().unwrap_or(now);
        let age = now.duration_since(modified).unwrap_or(Duration::from_secs(0));
        let canonical = fs::canonicalize(&path).ok();
        if age.as_secs() > MAX_CACHE_AGE_SECONDS && canonical != keep_path {
            let _ = fs::remove_file(&path);
            continue;
        }
        total += meta.len();
        entries.push((modified, path, meta.len()));
    }
    if total <= MAX_CACHE_BYTES {
        return;
    }
    entries.sort_by_key(|(modified, _, _)| *modified);
    for (_, path, size) in entries {
        if total <= MAX_CACHE_BYTES {
            break;
        }
        let canonical = fs::canonicalize(&path).ok();
        if canonical == keep_path {
            continue;
        }
        if fs::remove_file(&path).is_ok() {
            total = total.saturating_sub(size);
        }
    }
}

fn fetch_zip(day: &str) -> Result<PathBuf, String> {
    ensure_cache_dir().map_err(|e| e.to_string())?;
    let path = PathBuf::from(CACHE_DIR).join(format!("{}.zip", day));
    prune_cache(Some(&path));
    if path.exists() {
        if let Ok(meta) = fs::metadata(&path) {
            if meta.len() > 0 {
                return Ok(path);
            }
        }
    }
    let url = format!("{}/{}.zip", BASE_URL, day);
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_nanos();
    let tmp_path = PathBuf::from(CACHE_DIR).join(format!("{}.{}.part", day, nanos));
    let timeout_str = TIMEOUT_SECS.to_string();
    let status = Command::new("curl")
        .args(&[
            "-fL",
            "-sS",
            "--connect-timeout",
            "30",
            "--max-time",
            &timeout_str,
            "-o",
            tmp_path.to_str().unwrap_or(""),
            &url,
        ])
        .status()
        .map_err(|e| e.to_string())?;
    if !status.success() {
        let _ = fs::remove_file(&tmp_path);
        return Err("Fetch failed".to_string());
    }
    fs::rename(&tmp_path, &path).map_err(|e| e.to_string())?;
    prune_cache(Some(&path));
    Ok(path)
}

fn is_leap(year: i32) -> bool {
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}

fn days_in_month(year: i32, month: i32) -> i32 {
    match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 => {
            if is_leap(year) {
                29
            } else {
                28
            }
        }
        _ => 0,
    }
}

fn days_since_epoch(year: i32, month: i32, day: i32) -> Option<i64> {
    if year < 1970 || month < 1 || month > 12 || day < 1 || day > 31 {
        return None;
    }
    let mut days: i64 = 0;
    for y in 1970..year {
        days += if is_leap(y) { 366 } else { 365 };
    }
    for m in 1..month {
        days += i64::from(days_in_month(year, m));
    }
    days += i64::from(day - 1);
    Some(days)
}

fn ymd_from_days_since_epoch(mut days: i64) -> Option<(i32, i32, i32)> {
    if days < 0 {
        return None;
    }
    let mut year: i32 = 1970;
    loop {
        let year_days = if is_leap(year) { 366 } else { 365 };
        if days >= i64::from(year_days) {
            days -= i64::from(year_days);
            year += 1;
            continue;
        }
        break;
    }

    let mut month: i32 = 1;
    loop {
        let dim = days_in_month(year, month);
        if dim <= 0 {
            return None;
        }
        if days >= i64::from(dim) {
            days -= i64::from(dim);
            month += 1;
            continue;
        }
        break;
    }

    let day = (days + 1) as i32;
    Some((year, month, day))
}

fn ts_millis_now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_millis() as i64
}

fn utc_day_from_ts_ms(ts_ms: i64) -> Option<String> {
    let total_seconds = ts_ms.div_euclid(1000);
    let days = total_seconds.div_euclid(86_400);
    let (year, month, day) = ymd_from_days_since_epoch(days)?;
    Some(format!("{:04}{:02}{:02}", year, month, day))
}

fn current_utc_day() -> String {
    utc_day_from_ts_ms(ts_millis_now()).unwrap_or_else(|| "19700101".to_string())
}

fn yesterday_utc_day() -> String {
    let yesterday_ts = ts_millis_now().saturating_sub(86_400_000);
    utc_day_from_ts_ms(yesterday_ts).unwrap_or_else(|| "19700101".to_string())
}

fn parse_ts(date_str: &str) -> Option<i64> {
    let mut parts = date_str.split_whitespace();
    let date_part = parts.next()?;
    let time_part = parts.next()?;
    let date_bits: Vec<&str> = date_part.split('-').collect();
    let time_bits: Vec<&str> = time_part.split(':').collect();
    if date_bits.len() != 3 || time_bits.len() != 3 {
        return None;
    }
    let year: i32 = date_bits[0].parse().ok()?;
    let month: i32 = date_bits[1].parse().ok()?;
    let day: i32 = date_bits[2].parse().ok()?;
    let hour: i32 = time_bits[0].parse().ok()?;
    let minute: i32 = time_bits[1].parse().ok()?;
    let second: i32 = time_bits[2].parse().ok()?;
    if hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59 {
        return None;
    }
    let days = days_since_epoch(year, month, day)?;
    let total_seconds = days * 86_400 + i64::from(hour * 3600 + minute * 60 + second);
    Some(total_seconds * 1000)
}

fn parse_float(value: &str) -> Option<f64> {
    value.trim().parse::<f64>().ok()
}

fn regex_escape(value: &str) -> String {
    let mut out = String::with_capacity(value.len() * 2);
    for ch in value.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch);
        } else {
            out.push('\\');
            out.push(ch);
        }
    }
    out
}

fn band_from_freq_khz(freq_khz: f64) -> String {
    if !freq_khz.is_finite() || freq_khz <= 0.0 {
        return String::new();
    }
    let mhz = freq_khz / 1000.0;
    if mhz >= 0.1357 && mhz < 0.1378 {
        return "2190M".to_string();
    }
    if mhz >= 0.472 && mhz < 0.479 {
        return "630M".to_string();
    }
    if mhz >= 0.5 && mhz < 0.51 {
        return "560M".to_string();
    }
    if mhz >= 1.8 && mhz < 2.0 {
        return "160M".to_string();
    }
    if mhz >= 3.4 && mhz < 4.0 {
        return "80M".to_string();
    }
    if mhz >= 5.0 && mhz < 5.5 {
        return "60M".to_string();
    }
    if mhz >= 6.9 && mhz < 7.5 {
        return "40M".to_string();
    }
    if mhz >= 10.0 && mhz < 10.2 {
        return "30M".to_string();
    }
    if mhz >= 13.9 && mhz < 15.0 {
        return "20M".to_string();
    }
    if mhz >= 18.0 && mhz < 18.2 {
        return "17M".to_string();
    }
    if mhz >= 20.8 && mhz < 22.0 {
        return "15M".to_string();
    }
    if mhz >= 24.8 && mhz < 25.0 {
        return "12M".to_string();
    }
    if mhz >= 27.9 && mhz < 29.8 {
        return "10M".to_string();
    }
    if mhz >= 50.0 && mhz < 54.0 {
        return "6M".to_string();
    }
    if mhz >= 70.0 && mhz < 71.0 {
        return "4M".to_string();
    }
    if mhz >= 144.0 && mhz < 148.0 {
        return "2M".to_string();
    }
    if mhz >= 222.0 && mhz < 225.0 {
        return "1.25M".to_string();
    }
    if mhz >= 420.0 && mhz < 450.0 {
        return "70CM".to_string();
    }
    if mhz >= 902.0 && mhz < 928.0 {
        return "33CM".to_string();
    }
    if mhz >= 1240.0 && mhz < 1300.0 {
        return "23CM".to_string();
    }
    if mhz >= 2300.0 && mhz < 2450.0 {
        return "13CM".to_string();
    }
    if mhz >= 3300.0 && mhz < 3500.0 {
        return "9CM".to_string();
    }
    if mhz >= 5650.0 && mhz < 5925.0 {
        return "6CM".to_string();
    }
    if mhz >= 10_000.0 && mhz < 10_500.0 {
        return "3CM".to_string();
    }
    if mhz >= 24_000.0 && mhz < 24_250.0 {
        return "1.25CM".to_string();
    }
    if mhz >= 47_000.0 && mhz < 47_200.0 {
        return "6MM".to_string();
    }
    if mhz >= 75_500.0 && mhz < 81_000.0 {
        return "4MM".to_string();
    }
    if mhz >= 122_000.0 && mhz < 123_000.0 {
        return "2.5MM".to_string();
    }
    if mhz >= 134_000.0 && mhz < 141_000.0 {
        return "2MM".to_string();
    }
    if mhz >= 241_000.0 && mhz < 250_000.0 {
        return "1MM".to_string();
    }
    String::new()
}

fn scan_day(
    day: &str,
    call: &str,
    cap_of_us: usize,
    cap_by_us: usize,
) -> Result<(Vec<Spot>, Vec<Spot>, usize, usize, usize, bool, bool), String> {
    let zip_path = fetch_zip(day)?;
    let name = format!("{}.csv", day);
    let escaped = regex_escape(&call.to_uppercase());
    let pattern = format!(r"(^|,)(?:[A-Z0-9-]+/)?{}(?:/[A-Z0-9-]+)?(,|$)", escaped);
    let mut unzip_child = Command::new("unzip")
        .args(&["-p", zip_path.to_str().unwrap_or(""), &name])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| e.to_string())?;
    let unzip_stdout = unzip_child
        .stdout
        .take()
        .ok_or_else(|| "Missing unzip stdout".to_string())?;
    let mut rg_child = Command::new("rg")
        .args(&["--no-messages", "-e", &pattern])
        .stdin(unzip_stdout)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| e.to_string())?;
    let rg_stdout = rg_child
        .stdout
        .take()
        .ok_or_else(|| "Missing rg stdout".to_string())?;
    let reader = BufReader::new(rg_stdout);

    let mut of_us: Vec<Spot> = Vec::new();
    let mut by_us: Vec<Spot> = Vec::new();
    let mut total_matches = 0usize;
    let mut total_of_us = 0usize;
    let mut total_by_us = 0usize;
    let mut truncated_of_us = false;
    let mut truncated_by_us = false;
    let call_upper = call.to_uppercase();

    for line_result in reader.lines() {
        let line = match line_result {
            Ok(line) => line,
            Err(_) => continue,
        };
        if line.starts_with("callsign,") {
            continue;
        }
        let mut iter = line.splitn(7, ',');
        let spotter_raw = iter.next().unwrap_or("").trim();
        let _ = iter.next();
        let _ = iter.next();
        let _ = iter.next();
        let _ = iter.next();
        let dx_call_raw = iter.next().unwrap_or("").trim();
        if spotter_raw.is_empty() || dx_call_raw.is_empty() {
            continue;
        }
        let spotter_base = base_call(spotter_raw);
        let dx_call = dx_call_raw.to_uppercase();
        let match_of_us = dx_call == call_upper;
        let match_by_us = spotter_base == call_upper;
        if !match_of_us && !match_by_us {
            continue;
        }
        total_matches += 1;
        if match_of_us {
            total_of_us += 1;
        }
        if match_by_us {
            total_by_us += 1;
        }

        let cols: Vec<&str> = line.split(',').collect();
        if cols.len() < 12 {
            continue;
        }
        let freq = cols.get(3).unwrap_or(&"").trim();
        let band = cols.get(4).unwrap_or(&"").trim().to_string();
        let mode = cols.get(8).unwrap_or(&"").trim().to_string();
        let snr = cols.get(9).unwrap_or(&"").trim();
        let date = cols.get(10).unwrap_or(&"").trim();
        let speed = cols.get(11).unwrap_or(&"").trim();
        let tx_mode = cols.get(12).unwrap_or(&"").trim().to_string();
        let spot = Spot {
            spotter: spotter_base.clone(),
            spotterRaw: spotter_raw.to_string(),
            dxCall: dx_call.clone(),
            freqKHz: parse_float(freq),
            band,
            mode,
            snr: parse_float(snr),
            speed: parse_float(speed),
            txMode: tx_mode,
            ts: if date.is_empty() { None } else { parse_ts(date) },
        };
        if match_of_us {
            if of_us.len() < cap_of_us {
                of_us.push(spot.clone());
            } else {
                truncated_of_us = true;
            }
        }
        if match_by_us {
            if by_us.len() < cap_by_us {
                by_us.push(spot);
            } else {
                truncated_by_us = true;
            }
        }
    }
    let rg_status = rg_child.wait().map_err(|e| e.to_string())?;
    let unzip_status = unzip_child.wait().map_err(|e| e.to_string())?;
    if !unzip_status.success() {
        return Err(format!("Unzip failed for {}", day));
    }
    if !rg_status.success() && rg_status.code() != Some(1) {
        return Err(format!("rg failed for {}", day));
    }
    Ok((
        of_us,
        by_us,
        total_matches,
        total_of_us,
        total_by_us,
        truncated_of_us,
        truncated_by_us,
    ))
}

fn live_day_path(day: &str) -> PathBuf {
    PathBuf::from(LIVE_DIR).join(format!("{}.psv", day))
}

fn sanitize_live_field(value: &str) -> String {
    value
        .replace('|', "/")
        .replace('\n', " ")
        .replace('\r', " ")
        .trim()
        .to_string()
}

fn append_live_spot(spot: &Spot) -> Result<(), String> {
    let _guard = LIVE_LOCK.lock().map_err(|_| "Live shard lock poisoned".to_string())?;
    ensure_live_dir().map_err(|e| e.to_string())?;
    let ts = match spot.ts {
        Some(ts) => ts,
        None => return Ok(()),
    };
    let day = utc_day_from_ts_ms(ts).ok_or_else(|| "Invalid UTC day".to_string())?;
    let path = live_day_path(&day);
    let needs_header = match fs::metadata(&path) {
        Ok(meta) => meta.len() == 0,
        Err(_) => true,
    };

    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;

    if needs_header {
        writeln!(file, "ts|spotterRaw|dxCall|freqKHz|band|mode|snr").map_err(|e| e.to_string())?;
    }

    let freq = spot.freqKHz.map(|v| v.to_string()).unwrap_or_default();
    let snr = spot.snr.map(|v| v.to_string()).unwrap_or_default();
    writeln!(
        file,
        "{}|{}|{}|{}|{}|{}|{}",
        ts,
        sanitize_live_field(&spot.spotterRaw),
        sanitize_live_field(&spot.dxCall),
        sanitize_live_field(&freq),
        sanitize_live_field(&spot.band),
        sanitize_live_field(&spot.mode),
        sanitize_live_field(&snr),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn parse_live_record(line: &str) -> Option<Spot> {
    if line.is_empty() || line.starts_with("ts|") {
        return None;
    }
    let cols: Vec<&str> = line.trim_end().split('|').collect();
    if cols.len() < 7 {
        return None;
    }

    let ts = cols[0].trim().parse::<i64>().ok()?;
    let spotter_raw = cols[1].trim().to_string();
    let dx_call = cols[2].trim().to_uppercase();
    let freq_khz = parse_float(cols[3]);
    let mut band = cols[4].trim().to_uppercase();
    let mode = cols[5].trim().to_uppercase();
    let snr = parse_float(cols[6]);

    if spotter_raw.is_empty() || dx_call.is_empty() {
        return None;
    }
    let spotter = base_call(&spotter_raw);
    if spotter.is_empty() {
        return None;
    }
    if band.is_empty() {
        if let Some(freq) = freq_khz {
            band = band_from_freq_khz(freq);
        }
    }

    Some(Spot {
        spotter,
        spotterRaw: spotter_raw,
        dxCall: dx_call,
        freqKHz: freq_khz,
        band,
        mode: mode.clone(),
        snr,
        speed: None,
        txMode: mode,
        ts: Some(ts),
    })
}

fn parse_live_cursor(value: &str) -> Option<(String, u64)> {
    let mut parts = value.splitn(2, ':');
    let day = parts.next()?.trim();
    let offset = parts.next()?.trim().parse::<u64>().ok()?;
    if day.len() != 8 || !day.chars().all(|ch| ch.is_ascii_digit()) {
        return None;
    }
    Some((day.to_string(), offset))
}

fn scan_live_cursor(
    path: &Path,
    day: &str,
    offset: u64,
    since_ms: Option<i64>,
    band_filter: Option<&str>,
    limit: usize,
) -> Result<LiveBatch, String> {
    let _guard = LIVE_LOCK.lock().map_err(|_| "Live shard lock poisoned".to_string())?;
    if !path.exists() {
        return Ok(LiveBatch {
            day: day.to_string(),
            next_offset: 0,
            spots: Vec::new(),
            has_more: false,
            malformed: 0,
        });
    }

    let file = fs::File::open(path).map_err(|e| e.to_string())?;
    let file_len = file.metadata().map_err(|e| e.to_string())?.len();
    if offset > file_len {
        return Err("Cursor offset exceeds live shard size".to_string());
    }
    let mut reader = BufReader::new(file);
    reader
        .seek(SeekFrom::Start(offset))
        .map_err(|e| e.to_string())?;

    let normalized_band = band_filter.map(|value| value.trim().to_uppercase());
    let mut spots = Vec::new();
    let mut malformed = 0usize;
    let mut line = String::new();
    let mut next_offset = offset;

    while spots.len() < limit {
        line.clear();
        let read = reader.read_line(&mut line).map_err(|e| e.to_string())?;
        if read == 0 {
            break;
        }
        next_offset = reader.stream_position().map_err(|e| e.to_string())?;
        if line.starts_with("ts|") || line.trim().is_empty() {
            continue;
        }
        let spot = match parse_live_record(&line) {
            Some(spot) => spot,
            None => {
                malformed += 1;
                continue;
            }
        };
        if let Some(cutoff) = since_ms {
            if spot.ts.unwrap_or(0) < cutoff {
                continue;
            }
        }
        if let Some(ref wanted_band) = normalized_band {
            if !wanted_band.is_empty() && spot.band != *wanted_band {
                continue;
            }
        }
        spots.push(spot);
    }

    Ok(LiveBatch {
        day: day.to_string(),
        next_offset,
        spots,
        has_more: next_offset < file_len,
        malformed,
    })
}

fn live_batch_to_json(batch: &LiveBatch, reset: bool) -> String {
    let cursor = format!("{}:{}", batch.day, batch.next_offset);
    let mut out = String::from("{");
    out.push_str("\"cursor\":");
    out.push_str(&json_string(&cursor));
    out.push_str(",\"reset\":");
    out.push_str(if reset { "true" } else { "false" });
    out.push_str(",\"hasMore\":");
    out.push_str(if batch.has_more { "true" } else { "false" });
    out.push_str(",\"malformed\":");
    out.push_str(&batch.malformed.to_string());
    out.push_str(",\"spots\":");
    out.push_str(&spots_to_json(&batch.spots));
    out.push('}');
    out
}

fn scan_live_day(
    day: &str,
    call: &str,
    cap_of_us: usize,
    cap_by_us: usize,
) -> Result<(Vec<Spot>, Vec<Spot>, usize, usize, usize, bool, bool), String> {
    let path = live_day_path(day);
    if !path.exists() {
        return Ok((Vec::new(), Vec::new(), 0, 0, 0, false, false));
    }

    let file = fs::File::open(&path).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);

    let mut of_us: Vec<Spot> = Vec::new();
    let mut by_us: Vec<Spot> = Vec::new();
    let mut total_matches = 0usize;
    let mut total_of_us = 0usize;
    let mut total_by_us = 0usize;
    let mut truncated_of_us = false;
    let mut truncated_by_us = false;
    let call_upper = call.to_uppercase();

    for line_result in reader.lines() {
        let line = match line_result {
            Ok(line) => line,
            Err(_) => continue,
        };
        if line.is_empty() || line.starts_with("ts|") {
            continue;
        }

        let cols: Vec<&str> = line.split('|').collect();
        if cols.len() < 7 {
            continue;
        }

        let ts = cols[0].trim().parse::<i64>().ok();
        let spotter_raw = cols[1].trim().to_string();
        let dx_call = cols[2].trim().to_uppercase();
        let freq_khz = parse_float(cols[3]);
        let band = cols[4].trim().to_string();
        let mode = cols[5].trim().to_string();
        let snr = parse_float(cols[6]);

        if spotter_raw.is_empty() || dx_call.is_empty() {
            continue;
        }

        let spotter_base = base_call(&spotter_raw);
        if spotter_base.is_empty() {
            continue;
        }

        let match_of_us = dx_call == call_upper;
        let match_by_us = spotter_base == call_upper;
        if !match_of_us && !match_by_us {
            continue;
        }

        total_matches += 1;
        if match_of_us {
            total_of_us += 1;
        }
        if match_by_us {
            total_by_us += 1;
        }

        let mut spot_band = band;
        if spot_band.is_empty() {
            if let Some(fk) = freq_khz {
                spot_band = band_from_freq_khz(fk);
            }
        }

        let tx_mode = mode.clone();
        let spot = Spot {
            spotter: spotter_base,
            spotterRaw: spotter_raw,
            dxCall: dx_call,
            freqKHz: freq_khz,
            band: spot_band,
            mode,
            snr,
            speed: None,
            txMode: tx_mode,
            ts,
        };

        if match_of_us {
            if of_us.len() < cap_of_us {
                of_us.push(spot.clone());
            } else {
                truncated_of_us = true;
            }
        }
        if match_by_us {
            if by_us.len() < cap_by_us {
                by_us.push(spot);
            } else {
                truncated_by_us = true;
            }
        }
    }

    Ok((
        of_us,
        by_us,
        total_matches,
        total_of_us,
        total_by_us,
        truncated_of_us,
        truncated_by_us,
    ))
}

fn parse_telnet_spot_line(line: &str, ts_ms: i64) -> Option<Spot> {
    let trimmed = line.trim();
    if !trimmed.starts_with("DX de ") {
        return None;
    }

    let parts: Vec<&str> = trimmed.split_whitespace().collect();
    if parts.len() < 8 || parts[0] != "DX" || parts[1] != "de" {
        return None;
    }

    let spotter_raw = parts[2].trim_end_matches(':').trim();
    let spotter = base_call(spotter_raw);
    if spotter.is_empty() {
        return None;
    }

    let freq_khz = parts[3].trim().parse::<f64>().ok()?;
    let dx_call = parts[4].trim().to_uppercase();
    if dx_call.is_empty() {
        return None;
    }

    let mode = parts[5].trim().to_uppercase();
    let snr = parts[6].trim().parse::<f64>().ok();
    let band = band_from_freq_khz(freq_khz);

    Some(Spot {
        spotter,
        spotterRaw: spotter_raw.to_string(),
        dxCall: dx_call,
        freqKHz: Some(freq_khz),
        band,
        mode: mode.clone(),
        snr,
        speed: None,
        txMode: mode,
        ts: Some(ts_ms),
    })
}

fn send_telnet_login(writer: &mut TcpStream) -> Result<(), String> {
    let mut login = String::from(TELNET_LOGIN);
    login.push('\n');
    writer
        .write_all(login.as_bytes())
        .and_then(|_| writer.flush())
        .map_err(|e| e.to_string())
}

fn run_telnet_ingest_session() -> Result<(), String> {
    ensure_live_dir().map_err(|e| e.to_string())?;
    let addr = format!("{}:{}", TELNET_HOST, TELNET_PORT);
    let stream = TcpStream::connect(&addr).map_err(|e| e.to_string())?;
    let _ = stream.set_read_timeout(Some(Duration::from_secs(300)));
    let _ = stream.set_write_timeout(Some(Duration::from_secs(30)));

    let mut writer = stream.try_clone().map_err(|e| e.to_string())?;
    send_telnet_login(&mut writer)?;

    let mut reader = BufReader::new(stream);
    let mut line = String::new();

    loop {
        line.clear();
        let read = reader.read_line(&mut line).map_err(|e| e.to_string())?;
        if read == 0 {
            return Err("telnet stream closed".to_string());
        }

        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        if trimmed.contains("Please enter your call") {
            let _ = send_telnet_login(&mut writer);
            continue;
        }

        if let Some(spot) = parse_telnet_spot_line(trimmed, ts_millis_now()) {
            if let Err(err) = append_live_spot(&spot) {
                eprintln!("rbn-live append error: {}", err);
            }
        }
    }
}

fn start_telnet_ingest_thread() {
    thread::spawn(|| loop {
        if let Err(err) = run_telnet_ingest_session() {
            eprintln!("rbn-live ingest disconnected: {}", err);
        }
        thread::sleep(Duration::from_secs(TELNET_RECONNECT_SECS));
    });
}

fn validate_zip_contains_day_csv(zip_path: &Path, day: &str) -> bool {
    let output = match Command::new("unzip")
        .args(&["-Z1", zip_path.to_str().unwrap_or("")])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
    {
        Ok(output) => output,
        Err(_) => return false,
    };

    if !output.status.success() {
        return false;
    }

    let member = format!("{}.csv", day);
    let listing = String::from_utf8_lossy(&output.stdout);
    listing.lines().any(|line| line.trim() == member)
}

fn maybe_finalize_yesterday_live() {
    let day = yesterday_utc_day();
    let live_path = live_day_path(&day);
    if !live_path.exists() {
        return;
    }

    let zip_path = match fetch_zip(&day) {
        Ok(path) => path,
        Err(_) => return,
    };

    if !validate_zip_contains_day_csv(&zip_path, &day) {
        return;
    }

    if let Err(err) = fs::remove_file(&live_path) {
        eprintln!("rbn-live finalize remove failed for {}: {}", day, err);
    } else {
        eprintln!("rbn-live finalized {} and removed live shard", day);
    }
}

fn start_live_finalize_thread() {
    thread::spawn(|| loop {
        maybe_finalize_yesterday_live();
        thread::sleep(Duration::from_secs(LIVE_FINALIZE_CHECK_SECS));
    });
}

fn percent_decode(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'%' if i + 2 < bytes.len() => {
                let hex = &value[i + 1..i + 3];
                if let Ok(num) = u8::from_str_radix(hex, 16) {
                    out.push(num);
                    i += 3;
                    continue;
                }
                out.push(bytes[i]);
            }
            b'+' => out.push(b' '),
            _ => out.push(bytes[i]),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn parse_query(url: &str) -> (String, HashMap<String, String>) {
    let mut parts = url.splitn(2, '?');
    let path = parts.next().unwrap_or("").to_string();
    let query = parts.next().unwrap_or("");
    let mut params = HashMap::new();
    for pair in query.split('&') {
        if pair.is_empty() {
            continue;
        }
        let mut kv = pair.splitn(2, '=');
        let key = kv.next().unwrap_or("").to_string();
        let value = kv.next().unwrap_or("");
        if key.is_empty() {
            continue;
        }
        params.entry(key).or_insert_with(|| percent_decode(value));
    }
    (path, params)
}

fn send_response(
    stream: &mut TcpStream,
    status: u16,
    reason: &str,
    content_type: &str,
    body: &str,
    items: Option<usize>,
) {
    let body_bytes = body.as_bytes();
    let mut header = format!(
        "HTTP/1.1 {} {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nConnection: close\r\n",
        status,
        reason,
        content_type,
        body_bytes.len()
    );
    if let Some(n) = items {
        header.push_str(&format!("X-SH6-Items: {}\r\n", n));
    }
    header.push_str("\r\n");
    let _ = stream.write_all(header.as_bytes());
    let _ = stream.write_all(body_bytes);
}

fn respond_json(stream: &mut TcpStream, status: u16, reason: &str, body: &str) {
    send_response(stream, status, reason, "application/json", body, None);
}

fn respond_json_items(stream: &mut TcpStream, status: u16, reason: &str, body: &str, items: usize) {
    send_response(stream, status, reason, "application/json", body, Some(items));
}

fn respond_text(stream: &mut TcpStream, status: u16, reason: &str, body: &str) {
    send_response(stream, status, reason, "text/plain", body, None);
}

fn parse_live_number(
    params: &HashMap<String, String>,
    name: &str,
    default: u64,
    maximum: u64,
) -> Result<u64, String> {
    let value = match params.get(name) {
        Some(value) if !value.trim().is_empty() => value,
        _ => return Ok(default),
    };
    let parsed = value
        .trim()
        .parse::<u64>()
        .map_err(|_| format!("Invalid {}", name))?;
    if parsed > maximum {
        return Err(format!("{} exceeds maximum {}", name, maximum));
    }
    Ok(parsed)
}

fn handle_live_request(params: &HashMap<String, String>, stream: &mut TcpStream) {
    let limit = match parse_live_number(
        params,
        "limit",
        DEFAULT_LIVE_LIMIT as u64,
        MAX_LIVE_LIMIT as u64,
    ) {
        Ok(0) => {
            respond_json(stream, 400, "Bad Request", r#"{"error":"limit must be positive"}"#);
            return;
        }
        Ok(value) => value as usize,
        Err(error) => {
            respond_json(
                stream,
                400,
                "Bad Request",
                &format!(r#"{{"error":{}}}"#, json_string(&error)),
            );
            return;
        }
    };
    let lookback_seconds = match parse_live_number(
        params,
        "lookbackSeconds",
        DEFAULT_LIVE_LOOKBACK_SECONDS,
        MAX_LIVE_LOOKBACK_SECONDS,
    ) {
        Ok(value) => value,
        Err(error) => {
            respond_json(
                stream,
                400,
                "Bad Request",
                &format!(r#"{{"error":{}}}"#, json_string(&error)),
            );
            return;
        }
    };
    let band = params.get("band").map(|value| value.trim().to_uppercase());
    if let Some(ref value) = band {
        if value.len() > 8 || !value.chars().all(|ch| ch.is_ascii_alphanumeric()) {
            respond_json(stream, 400, "Bad Request", r#"{"error":"Invalid band"}"#);
            return;
        }
    }

    let now_ms = ts_millis_now();
    let today = current_utc_day();
    let cursor_param = params.get("cursor").map(|value| value.trim()).filter(|value| !value.is_empty());
    let mut reset = false;
    let (mut day, mut offset, mut since_ms) = match cursor_param {
        Some(value) => match parse_live_cursor(value) {
            Some((day, offset)) => (day, offset, None),
            None => {
                respond_json(stream, 400, "Bad Request", r#"{"error":"Invalid cursor"}"#);
                return;
            }
        },
        None => (
            today.clone(),
            0,
            Some(now_ms.saturating_sub((lookback_seconds as i64).saturating_mul(1000))),
        ),
    };

    let requested_path = live_day_path(&day);
    if day != today && !requested_path.exists() {
        day = today.clone();
        offset = 0;
        since_ms = Some(now_ms.saturating_sub((lookback_seconds as i64).saturating_mul(1000)));
        reset = true;
    }

    let mut batch = match scan_live_cursor(
        &live_day_path(&day),
        &day,
        offset,
        since_ms,
        band.as_deref(),
        limit,
    ) {
        Ok(batch) => batch,
        Err(_) if cursor_param.is_some() => {
            day = today.clone();
            reset = true;
            match scan_live_cursor(
                &live_day_path(&day),
                &day,
                0,
                Some(now_ms.saturating_sub((lookback_seconds as i64).saturating_mul(1000))),
                band.as_deref(),
                limit,
            ) {
                Ok(batch) => batch,
                Err(error) => {
                    respond_json(
                        stream,
                        503,
                        "Service Unavailable",
                        &format!(r#"{{"error":{}}}"#, json_string(&error)),
                    );
                    return;
                }
            }
        }
        Err(error) => {
            respond_json(
                stream,
                503,
                "Service Unavailable",
                &format!(r#"{{"error":{}}}"#, json_string(&error)),
            );
            return;
        }
    };

    if batch.day != today && !batch.has_more {
        batch.day = today;
        batch.next_offset = 0;
        batch.has_more = true;
    }
    let body = live_batch_to_json(&batch, reset);
    respond_json_items(stream, 200, "OK", &body, batch.spots.len());
}

fn handle_request(method: &str, url: &str, stream: &mut TcpStream) {
    if method != "GET" {
        respond_text(stream, 405, "Method Not Allowed", "method not allowed");
        return;
    }
    let (path, params) = parse_query(url);
    if path == "/health" {
        respond_text(stream, 200, "OK", "ok");
        return;
    }
    if path == "/rbn/live" {
        handle_live_request(&params, stream);
        return;
    }
    if path != "/rbn" {
        respond_text(stream, 404, "Not Found", "not found");
        return;
    }

    if params.contains_key("calls") {
        handle_batch_request(&params, stream);
        return;
    }

    let call_raw = params
        .get("call")
        .cloned()
        .unwrap_or_default()
        .trim()
        .to_uppercase();
    if call_raw.is_empty() || !is_valid_call(&call_raw) {
        respond_json(stream, 400, "Bad Request", r#"{"error":"Invalid call"}"#);
        return;
    }

    let call = base_call(&call_raw);
    if call.is_empty() {
        respond_json(stream, 400, "Bad Request", r#"{"error":"Invalid call"}"#);
        return;
    }

    let days_param = params.get("days").cloned().unwrap_or_default();
    let date_param = params.get("date").cloned().unwrap_or_default();
    let mut days: Vec<String> = Vec::new();

    if !days_param.is_empty() {
        days = days_param
            .split(',')
            .map(|d| d.trim().to_string())
            .filter(|d| d.len() == 8 && d.chars().all(|c| c.is_ascii_digit()))
            .collect();
    } else if !date_param.is_empty() {
        if date_param.len() == 8 && date_param.chars().all(|c| c.is_ascii_digit()) {
            days.push(date_param);
        }
    }

    if days.is_empty() {
        respond_json(stream, 400, "Bad Request", r#"{"error":"Missing call or days"}"#);
        return;
    }

    if days.len() > MAX_DAYS {
        respond_json(
            stream,
            400,
            "Bad Request",
            &format!(r#"{{"error":"Too many days (max {})"}}"#, MAX_DAYS),
        );
        return;
    }

    let mut of_us: Vec<Spot> = Vec::new();
    let mut by_us: Vec<Spot> = Vec::new();
    let mut total = 0usize;
    let mut total_of_us = 0usize;
    let mut total_by_us = 0usize;
    let mut truncated_of_us = false;
    let mut truncated_by_us = false;
    let mut errors: Vec<DayError> = Vec::new();

    let today_utc = current_utc_day();

    let _guard = SCAN_LOCK.lock().unwrap();
    for day in &days {
        let cap_of_us = MAX_SPOTS_PER_SIDE.saturating_sub(of_us.len());
        let cap_by_us = MAX_SPOTS_PER_SIDE.saturating_sub(by_us.len());

        let result = if day == &today_utc {
            scan_live_day(day, &call, cap_of_us, cap_by_us)
        } else {
            scan_day(day, &call, cap_of_us, cap_by_us)
        };

        match result {
            Ok((day_of_us, day_by_us, day_total, day_total_of_us, day_total_by_us, trunc_of, trunc_by)) => {
                of_us.extend(day_of_us);
                by_us.extend(day_by_us);
                total += day_total;
                total_of_us += day_total_of_us;
                total_by_us += day_total_by_us;
                truncated_of_us = truncated_of_us || trunc_of;
                truncated_by_us = truncated_by_us || trunc_by;
            }
            Err(err) => {
                errors.push(DayError {
                    day: day.to_string(),
                    error: err,
                });
            }
        }
    }

    let mut body = String::from("{");
    body.push_str("\"call\":");
    body.push_str(&json_string(&call));
    body.push_str(",\"days\":[");
    for (idx, day) in days.iter().enumerate() {
        if idx > 0 {
            body.push(',');
        }
        body.push_str(&json_string(day));
    }
    body.push_str("],\"total\":");
    body.push_str(&total.to_string());
    body.push_str(",\"totalOfUs\":");
    body.push_str(&total_of_us.to_string());
    body.push_str(",\"totalByUs\":");
    body.push_str(&total_by_us.to_string());
    body.push_str(",\"capPerSide\":");
    body.push_str(&MAX_SPOTS_PER_SIDE.to_string());
    body.push_str(",\"truncatedOfUs\":");
    body.push_str(if truncated_of_us { "true" } else { "false" });
    body.push_str(",\"truncatedByUs\":");
    body.push_str(if truncated_by_us { "true" } else { "false" });
    body.push_str(",\"ofUsSpots\":");
    body.push_str(&spots_to_json(&of_us));
    body.push_str(",\"byUsSpots\":");
    body.push_str(&spots_to_json(&by_us));
    body.push_str(",\"errors\":");
    body.push_str(&errors_to_json(&errors));
    body.push('}');
    respond_json_items(stream, 200, "OK", &body, of_us.len() + by_us.len());
}


const MAX_BATCH_CALLS: usize = 32;
const MAX_BATCH_SPOTS: usize = 100_000;

#[derive(Default)]
struct BatchCall {
    of_us: Vec<Spot>, by_us: Vec<Spot>, total: usize,
    total_of: usize, total_by: usize, trunc_of: bool, trunc_by: bool,
}

fn record_batch_spot(results: &mut HashMap<String, BatchCall>, spot: Spot, stored: &mut usize) {
    let dx = spot.dxCall.clone();
    let rx = spot.spotter.clone();
    if let Some(result) = results.get_mut(&dx) {
        result.total += 1;
        result.total_of += 1;
        if *stored < MAX_BATCH_SPOTS { result.of_us.push(spot.clone()); *stored += 1; }
        else { result.trunc_of = true; }
    }
    if let Some(result) = results.get_mut(&rx) {
        if rx != dx { result.total += 1; }
        result.total_by += 1;
        if *stored < MAX_BATCH_SPOTS { result.by_us.push(spot); *stored += 1; }
        else { result.trunc_by = true; }
    }
}

fn collect_batch_csv<R: BufRead>(reader: R, results: &mut HashMap<String, BatchCall>, stored: &mut usize) -> Result<(), String> {
    for line in reader.lines() {
        let line = line.map_err(|e| e.to_string())?;
        let cols: Vec<&str> = line.split(',').collect();
        if cols.len() < 12 || line.starts_with("callsign,") { continue; }
        let rx = base_call(cols[0]);
        let dx = cols[5].trim().to_uppercase();
        if !results.contains_key(&rx) && !results.contains_key(&dx) { continue; }
        let spot = Spot {
            spotter: rx, spotterRaw: cols[0].trim().to_string(), dxCall: dx,
            freqKHz: parse_float(cols[3]), band: cols[4].trim().to_string(),
            mode: cols[8].trim().to_string(), snr: parse_float(cols[9]),
            speed: parse_float(cols[11]), txMode: cols.get(12).unwrap_or(&"").trim().to_string(),
            ts: parse_ts(cols[10].trim()),
        };
        record_batch_spot(results, spot, stored);
    }
    Ok(())
}

fn scan_batch_day(day: &str, results: &mut HashMap<String, BatchCall>, stored: &mut usize) -> Result<(), String> {
    if day == current_utc_day() {
        let path = live_day_path(day);
        if !path.exists() { return Ok(()); }
        let reader = BufReader::new(fs::File::open(path).map_err(|e| e.to_string())?);
        for line in reader.lines() {
            if let Some(spot) = parse_live_record(&line.map_err(|e| e.to_string())?) {
                record_batch_spot(results, spot, stored);
            }
        }
        return Ok(());
    }
    let zip_path = fetch_zip(day)?;
    let pattern = format!(r"(^|,)(?:[A-Z0-9-]+/)?(?:{})(?:/[A-Z0-9-]+)?(,|$)",
        results.keys().map(|c| regex_escape(c)).collect::<Vec<_>>().join("|"));
    let mut unzip = Command::new("unzip").args(&["-p", zip_path.to_str().unwrap_or(""), &format!("{}.csv",day)])
        .stdout(Stdio::piped()).stderr(Stdio::null()).spawn().map_err(|e|e.to_string())?;
    let stdout = unzip.stdout.take().ok_or("Missing unzip stdout")?;
    let mut rg = match Command::new("rg").args(&["--no-messages","-e",&pattern])
        .stdin(stdout).stdout(Stdio::piped()).stderr(Stdio::null()).spawn() {
        Ok(child) => child,
        Err(error) => { let _=unzip.kill(); let _=unzip.wait(); return Err(error.to_string()); }
    };
    let result = collect_batch_csv(BufReader::new(rg.stdout.take().ok_or("Missing rg stdout")?),results,stored);
    if result.is_err() { let _=rg.kill(); let _=unzip.kill(); }
    let rg_status=rg.wait().map_err(|e|e.to_string())?;
    let unzip_status=unzip.wait().map_err(|e|e.to_string())?;
    result?;
    if !unzip_status.success() { return Err(format!("Unzip failed for {}",day)); }
    if !rg_status.success() && rg_status.code()!=Some(1) { return Err(format!("rg failed for {}",day)); }
    Ok(())
}

fn parse_batch_calls(value: &str) -> Result<Vec<String>, String> {
    let mut calls = Vec::new();
    for raw in value.split(',') {
        let call=raw.trim().to_uppercase();
        if !is_valid_call(&call) || base_call(&call).is_empty() { return Err("Invalid callsign in calls".to_string()); }
        if !calls.contains(&call) { calls.push(call); }
        if calls.len()>MAX_BATCH_CALLS { return Err(format!("Too many calls (max {})",MAX_BATCH_CALLS)); }
    }
    Ok(calls)
}

fn batch_call_json(call: &str, days: &[String], result: &BatchCall, errors: &[DayError], remaining: &mut usize) -> String {
    // Portable aliases may share a base-call accumulator; bound serialized output too.
    let of_len=result.of_us.len().min(*remaining); *remaining-=of_len;
    let by_len=result.by_us.len().min(*remaining); *remaining-=by_len;
    format!(r#"{{"call":{},"baseCall":{},"days":[{}],"total":{},"totalOfUs":{},"totalByUs":{},"capPerSide":{},"truncatedOfUs":{},"truncatedByUs":{},"ofUsSpots":{},"byUsSpots":{},"errors":{}}}"#,
        json_string(call),json_string(&base_call(call)),days.iter().map(|d|json_string(d)).collect::<Vec<_>>().join(","),
        result.total,result.total_of,result.total_by,MAX_BATCH_SPOTS,result.trunc_of || of_len<result.of_us.len(),result.trunc_by || by_len<result.by_us.len(),
        spots_to_json(&result.of_us[..of_len]),spots_to_json(&result.by_us[..by_len]),errors_to_json(errors))
}

fn handle_batch_request(params: &HashMap<String,String>, stream: &mut TcpStream) {
    let calls = match parse_batch_calls(params.get("calls").map(String::as_str).unwrap_or("")) {
        Ok(calls)=>calls, Err(error)=>{respond_json(stream,400,"Bad Request",&format!(r#"{{"error":{}}}"#,json_string(&error)));return;}
    };
    let mut days=Vec::new();
    for day in params.get("days").or_else(||params.get("date")).map(String::as_str).unwrap_or("").split(',') {
        if day.len()!=8 || !day.bytes().all(|c|c.is_ascii_digit()) {
            respond_json(stream,400,"Bad Request",r#"{"error":"Invalid days"}"#);return;
        }
        let year=day[..4].parse::<i32>().unwrap_or(0);
        let month=day[4..6].parse::<i32>().unwrap_or(0);
        let date=day[6..].parse::<i32>().unwrap_or(0);
        if year<1970 || date<1 || date>days_in_month(year,month) {
            respond_json(stream,400,"Bad Request",r#"{"error":"Invalid date"}"#);return;
        }
        if !days.contains(&day.to_string()) {days.push(day.to_string());}
    }
    if days.len()>MAX_DAYS {respond_json(stream,400,"Bad Request",r#"{"error":"Too many days (max 2)"}"#);return;}
    let mut results:HashMap<String,BatchCall>=calls.iter().map(|call|(base_call(call),BatchCall::default())).collect();
    let mut errors=Vec::new(); let mut stored=0;
    let _guard=SCAN_LOCK.lock().unwrap();
    for day in &days {
        if let Err(error)=scan_batch_day(day,&mut results,&mut stored) {errors.push(DayError{day:day.clone(),error});}
    }
    let mut output_remaining=MAX_BATCH_SPOTS;
    let body=format!(r#"{{"batchVersion":1,"maxCalls":{},"maxDays":{},"maxSpots":{},"results":[{}]}}"#,
        MAX_BATCH_CALLS,MAX_DAYS,MAX_BATCH_SPOTS,calls.iter().map(|call|batch_call_json(call,&days,&results[&base_call(call)],&errors,&mut output_remaining)).collect::<Vec<_>>().join(","));
    respond_json_items(stream,200,"OK",&body,stored);
}

fn read_request_line(stream: &mut TcpStream) -> Option<(String, String)> {
    let mut buffer = [0u8; 4096];
    let mut data: Vec<u8> = Vec::new();
    loop {
        let read = stream.read(&mut buffer).ok()?;
        if read == 0 {
            break;
        }
        data.extend_from_slice(&buffer[..read]);
        if data.windows(4).any(|w| w == b"\r\n\r\n") || data.len() > 16_384 {
            break;
        }
    }
    if data.is_empty() {
        return None;
    }
    let request_text = String::from_utf8_lossy(&data);
    let mut lines = request_text.split("\r\n");
    let request_line = lines.next().unwrap_or("");
    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("").to_string();
    let url = parts.next().unwrap_or("").to_string();
    if method.is_empty() || url.is_empty() {
        return None;
    }
    Some((method, url))
}

fn handle_connection(mut stream: TcpStream) {
    if let Some((method, url)) = read_request_line(&mut stream) {
        handle_request(&method, &url, &mut stream);
    } else {
        respond_text(&mut stream, 400, "Bad Request", "bad request");
    }
}

fn main() {
    ensure_cache_dir().ok();
    ensure_live_dir().ok();
    if std::env::var("RBN_PROXY_DISABLE_INGEST").ok().as_deref() != Some("1") {
        start_telnet_ingest_thread();
        start_live_finalize_thread();
    }

    let listen_address = std::env::var("RBN_PROXY_LISTEN")
        .unwrap_or_else(|_| "127.0.0.1:8095".to_string());
    let listener = TcpListener::bind(&listen_address)
        .unwrap_or_else(|_| panic!("Failed to bind {}", listen_address));
    for stream in listener.incoming() {
        if let Ok(stream) = stream {
            thread::spawn(move || {
                handle_connection(stream);
            });
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU64, Ordering};

    static FIXTURE_SEQUENCE: AtomicU64 = AtomicU64::new(0);

    fn live_fixture(contents: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "rbn-proxy-live-test-{}-{}.psv",
            std::process::id(),
            FIXTURE_SEQUENCE.fetch_add(1, Ordering::Relaxed)
        ));
        fs::write(&path, contents).expect("write live fixture");
        path
    }

    #[test]
    fn live_cursor_is_strict() {
        assert_eq!(
            parse_live_cursor("20260807:123"),
            Some(("20260807".to_string(), 123))
        );
        assert!(parse_live_cursor("2026-08-07:123").is_none());
        assert!(parse_live_cursor("20260807:-1").is_none());
        assert!(parse_live_cursor("20260807").is_none());
    }

    #[test]
    fn cursor_scan_resumes_without_duplicates_and_honors_filters() {
        let path = live_fixture(concat!(
            "ts|spotterRaw|dxCall|freqKHz|band|mode|snr\n",
            "1000|RX1-#|DX1AA|14025.0|20M|CW|10\n",
            "2000|RX2-#|DX2BB|14026.0|20M|CW|15\n",
            "3000|RX3-#|DX3CC|7025.0|40M|CW|20\n",
            "4000|RX4-#|DX4DD|14027.0|20M|CW|25\n",
        ));

        let first = scan_live_cursor(&path, "20260807", 0, Some(1500), Some("20m"), 1)
            .expect("first batch");
        assert_eq!(first.spots.len(), 1);
        assert_eq!(first.spots[0].dxCall, "DX2BB");
        assert!(first.has_more);

        let second = scan_live_cursor(
            &path,
            "20260807",
            first.next_offset,
            None,
            Some("20M"),
            10,
        )
        .expect("second batch");
        assert_eq!(second.spots.len(), 1);
        assert_eq!(second.spots[0].dxCall, "DX4DD");
        assert!(!second.has_more);

        fs::remove_file(path).expect("remove live fixture");
    }

    #[test]
    fn cursor_scan_rejects_offsets_beyond_file() {
        let path = live_fixture("ts|spotterRaw|dxCall|freqKHz|band|mode|snr\n");
        let file_len = fs::metadata(&path).expect("fixture metadata").len();
        let error = scan_live_cursor(&path, "20260807", file_len + 1, None, None, 10)
            .err()
            .expect("offset error");
        assert!(error.contains("exceeds"));
        fs::remove_file(path).expect("remove live fixture");
    }
}

#[cfg(test)]
mod batch_tests {
 use super::*;
 #[test] fn calls_are_bounded_and_validated() {
  assert_eq!(parse_batch_calls("dl1aa,DL1AA,s53m").unwrap(),vec!["DL1AA","S53M"]);
  assert!(parse_batch_calls("DL1AA,$(evil)").is_err());
  assert!(parse_batch_calls("").is_err());assert!(parse_batch_calls("///").is_err());
  assert!(parse_batch_calls(&(0..33).map(|i|format!("K{}AA",i)).collect::<Vec<_>>().join(",")).is_err());
 }
 #[test] fn one_csv_pass_partitions_calls_and_both_directions() {
  let mut results:HashMap<String,BatchCall>=["DL1AA","S53M"].iter().map(|c|(c.to_string(),BatchCall::default())).collect();
  let csv="RX1-#,x,x,14020,20m,DL1AA,x,x,CW,10,2025-11-29 00:00:00,30,CW\nS53M-#,x,x,7020,40m,DL1AA,x,x,CW,20,2025-11-29 00:01:00,32,CW\nRX2-#,x,x,14020,20m,NO1AA,x,x,CW,10,2025-11-29 00:02:00,30,CW\n";
  let mut count=0;collect_batch_csv(BufReader::new(csv.as_bytes()),&mut results,&mut count).unwrap();
  let mut remaining=1;
  let limited=batch_call_json("DL1AA",&["20251129".into()],&results["DL1AA"],&[],&mut remaining);
  assert_eq!(remaining,0);assert!(limited.contains("\"truncatedOfUs\":true"));
  let alias=batch_call_json("EA8/DL1AA",&["20251129".into()],&results["DL1AA"],&[],&mut remaining);
  assert!(alias.contains("\"ofUsSpots\":[]"));
  assert_eq!(results["DL1AA"].of_us.len(),2);assert_eq!(results["S53M"].by_us.len(),1);assert_eq!(count,3);
  let mut count=MAX_BATCH_SPOTS;collect_batch_csv(BufReader::new(csv.as_bytes()),&mut results,&mut count).unwrap();
  assert!(results["DL1AA"].trunc_of);assert!(results["S53M"].trunc_by);assert_eq!(count,MAX_BATCH_SPOTS);
 }
}
