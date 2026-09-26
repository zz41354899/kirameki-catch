# Rhythm Game Mobile Design QA

## Comparison target

- Source visual truth: `/private/var/folders/fp/bv98vn2s2v9dchl651zpsvn00000gn/T/TemporaryItems/NSIRD_screencaptureui_P6beEF/截圖 2026-09-26 晚上9.28.42.png`
- Source pixels: 533 × 959.
- Implementation evidence: Codex in-app Browser capture `iab/tab-10/rhythm-game-mobile-604x903` plus pause-state capture `iab/tab-9/rhythm-game-mobile-pause-390x844`.
- Implementation pixels / CSS viewport: 604 × 903 at device scale 1; pause state 390 × 844 at device scale 1.
- State: active rhythm game and paused rhythm game.
- Responsive intent: the source is the previous mobile layout and issue evidence. The final layout intentionally changes composition according to the latest brief: full-screen playfield, character as background art, centered COMBO, simplified floating controls, and no desktop redesign.

## Full-view comparison evidence

The previous 533 × 959 reference used a 111px desktop-like header, a narrow left character column, and a right-weighted playfield. The verified 604 × 903 implementation fills the viewport, keeps the four lanes centered across 92% of the screen, and places the 3:4 character behind them. At 390 × 844 the same character is naturally cropped at the sides without distortion. The desktop check at 1280 × 720 retains the original split performer/playfield composition and complete HUD.

## Focused region comparison evidence

- Character: rendered bounds were 544 × 726 at 390px and 570 × 760 at 604px; both measured exactly 0.75 width/height, matching the 3:4 source art.
- Floating controls: pause measured 56 × 56; sound and close measured 48 × 48. All remained inside safe viewport bounds.
- COMBO: center X measured 195/195 at 390px and 302/302 at 604px.
- Pause sheet: measured 320 × 249 at 390px; its two actions stack vertically and each provides a 48px touch target.
- Playfield: no horizontal overflow at either mobile viewport; lane controls remained fully visible above the lower safe-area edge.

## Required fidelity surfaces

- Fonts and typography: existing DM Sans and CJK project typography remain unchanged. Mobile hierarchy is reduced to stage, score, centered COMBO, judgment, and lane labels.
- Spacing and layout rhythm: full-screen crop, centered playfield, safe-area-aware top controls, bottom lane controls, and thumb-reachable pause FAB are consistent at both verified widths.
- Colors and visual tokens: existing plum, pink, cream, and yellow tokens are preserved; translucent overlays keep notes legible without hiding the character.
- Image quality and asset fidelity: the supplied sprite atlas and high-resolution crying PNG are used directly. Neither is stretched; both retain 3:4 proportions and are treated as background-stage art on mobile.
- Copy and content: game copy, score, stage, difficulty, COMBO, judgments, and pause actions are preserved. The mobile close control intentionally shows only an accessible X.

## Comparison history

1. Baseline P1: mobile character behaved like a small left-column desktop asset and the header consumed too much vertical space. Fixed by making the mobile dialog truly full-screen, promoting the character to a centered background layer, and simplifying the HUD.
2. Baseline P1: pause was not a reliable mobile-sized control. Fixed with a persistent 56px FAB and a centered pause sheet with stacked 48px actions.
3. Implementation P2: moving COMBO outside the performer column initially changed its desktop horizontal position. Fixed by restoring the desktop offset to 2.2% of the full shell while retaining 50% centering below 680px. Post-fix desktop evidence shows the readout 27px from the shell edge and the original split composition intact.

## Findings

No actionable P0, P1, or P2 visual differences remain against the latest requested direction.

## Open questions

None.

## Implementation checklist

- [x] Full-screen mobile game shell.
- [x] 3:4 character background treatment without stretching.
- [x] Centered COMBO readout.
- [x] 56px pause FAB and 48px X close FAB.
- [x] Vertical pause actions.
- [x] Desktop layout preserved.
- [x] 390px, 604px, and desktop browser checks.

## Follow-up polish

No blocking polish remains.

final result: passed
