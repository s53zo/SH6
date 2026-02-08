# SH6 NT Shell Contract

Updated: 2026-02-08

## Layout
- Top bar is a high-contrast, branded strip.
- Left rail is a persistent command/navigation panel.
- Main report surface is card-like with strong separation from shell background.

## Components

### 1) Top Bar
- Contains brand + subtitle and Prev/Next controls.
- Must remain compact and visible without stealing report space.

### 2) Navigation Rail
- Contains:
  - report quick-find input
  - grouped report navigation
  - app/version metadata
  - data health/status block
  - theme toggle (Classic/NT)
- Active report must remain highly visible.

### 3) Report Stage
- Contains:
  - optional band ribbon
  - report title band
  - report container
- Report stage must be consistent regardless of menu depth.

## Responsiveness
- <=768px: nav becomes stacked above report stage.
- 768-1024px: narrower nav rail but full function parity.
- >=1024px: fixed command rail and dense report stage.

## Compatibility Requirements
- Existing report IDs and routing must not change.
- Scoring/API outputs and behavior remain unchanged.
- Classic theme remains available as fallback.
