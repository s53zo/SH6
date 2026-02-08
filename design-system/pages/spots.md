# Spots Page Override

Page: Spots + RBN spots
Inherits: `design-system/MASTER.md`

## Purpose
Enable fast analysis of spots and quick drilldown to actionable subsets.

## Layout overrides
- Keep "Spots of you by band/hour" table in first position.
- Maintain compare-panel alignment for sections up to and excluding "All spots of you" block.
- Drilldown panel should appear directly after heat table area for locality.

## Data table overrides
- Heatmap value cells must read as interactive buttons:
  - visible hover/focus
  - clear active selection state
- Drilldown rows should keep compact width but preserve readability in call/frequency/time columns.

## Filter overrides
- Continent, CQ zone, ITU zone filters should use chip-style controls.
- Active filter chips must be unmistakable.
- Include one clear "All" chip per filter type.

## Compare behavior overrides
- Keep top analytic sections height-aligned for side-by-side comparison.
- Stop forced alignment at large raw listing sections.

## QA focus
- User can click any band/hour cell and immediately understand selected context.
- Keyboard user can navigate to heat cells and filter chips.
