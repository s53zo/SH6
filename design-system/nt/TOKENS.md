# SH6 NT Tokens

Updated: 2026-02-08
Scope: NT redesign token layer (used when `body.ui-theme-nt` is active).

## Color Tokens
- `--nt-bg-app`: `#f0f4fa`
- `--nt-bg-shell`: `#f8fbff`
- `--nt-bg-surface`: `#fcfdff`
- `--nt-bg-surface-alt`: `#f4f8ff`
- `--nt-bg-active`: `#d5e4ff`

- `--nt-text-primary`: `#122743`
- `--nt-text-secondary`: `#38557e`
- `--nt-text-muted`: `#5f7696`

- `--nt-border`: `#c7d4ea`
- `--nt-border-strong`: `#9eb9ea`

- `--nt-accent-1`: `#2c64bc`
- `--nt-accent-2`: `#3f74bc`
- `--nt-accent-3`: `#163a66`

## Typography
- Primary family remains Verdana/Arial/Tahoma for continuity.
- Header hierarchy in NT:
  - Shell title band: 10pt-12pt
  - Report section heading: 11pt
  - Dense table text: 8pt-9pt

## Elevation and Surfaces
- Shell cards: subtle, cool-toned shadow only.
- Major surfaces are rounded (10-14px).
- Dense data regions keep restrained styling to preserve readability.

## Interaction
- Focus ring remains shared SH6 token.
- Active state uses high-contrast accent background with clear text.
- Hover is non-jumping and non-transforming in dense tables.

## Motion
- Retain minimal motion; reduced-motion support remains mandatory.
