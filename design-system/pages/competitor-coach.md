# Competitor Coach Override

Page: Competitor coach
Inherits: `design-system/MASTER.md`

## Purpose
Help user find nearby competitors and load their logs into compare slots with minimal confusion.

## Control model
- Scope and Category must be directly visible as segmented choices (no hidden dropdown dependence).
- Remove secondary/duplicated controls that can desync user intent.
- Keep selected scope/category obvious even after data refresh.

## Table and action model
- Competitor table should prioritize:
  - rank
  - callsign
  - score and gap
  - multiplier and QSO deltas
- Row actions should explicitly indicate destination slot.
- If one-step load actions exist, action labels must include slot target text.

## Feedback model
- Replace technical implementation details with user-facing status language.
- Do not expose raw API source URLs in main coach view.
- When no cohort rows match, give practical next action suggestions.

## Visual hierarchy
- Keep summary metrics in a compact card above table.
- Keep coaching hints short and ranked by impact.
- Selected/current row highlighting should be distinct but subtle.

## QA focus
- User can identify cohort and load target log without reading long instructions.
- Empty state suggests at least one alternative filter path.
