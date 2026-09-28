# Design QA — Wardrobe chapter card

Date: 2026-09-28

## Verified states

- Desktop 1440 × 900: the collection shows six cards in one row. Chapter 06 is disabled and displays wardrobe progress while either reward is missing.
- Desktop 1440 × 900: after both `crescentPony` and `practice` are unlocked, Chapter 06 becomes selectable and switches the preview to the moonlit wardrobe scene.
- Mobile 390 × 844: the collection becomes a two-column grid with no horizontal overflow; all six cards remain reachable.
- Mobile 390 × 844: the selected Chapter 06 preview retains the full 3:4 artwork and the close button no longer overlaps the heading.
- Wardrobe desktop and mobile: the Momo preview uses its native 3:4 ratio with complete ears, hair, hands, legs, and shoes visible.
- Accessibility: the locked card is a disabled button with an explicit `0 / 2`, `1 / 2`, or `2 / 2` wardrobe-condition label.
- Browser console: no warnings or errors in the tested card and wardrobe states.

## Automated checks

- `npm test`: 10 / 10 passing.
- `npm run build`: passing.
- `git diff --check`: passing.
