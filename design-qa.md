# Rhythm Game Mobile Design QA

## Comparison target

- Source visual truth: user-supplied screenshot captured on 2026-09-26 at 21:28:42.
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

---

# Lunar Pop 斜角選單 Design QA

## Comparison target

- Source visual truth: user-supplied screenshot captured on 2026-09-28 at 00:50:30.
- Source pixels / CSS viewport: 868 × 545 at 1×.
- Implementation evidence: Codex in-app Browser tab 5, local `http://127.0.0.1:4176/`, captured at 868 × 545 and 390 × 844 CSS pixels at 1×.
- State: menu open; second scene keyboard-focused to expose the yellow fill and pink slanted end-cap.

## Full-view comparison evidence

The supplied target calls for an angled scene selector rather than a plain list. The implementation keeps the requested dark plum, cream, yellow, and pink palette while reducing the treatment to a clear pair of matching parallelograms: the focused row fills from left to right as a yellow parallelogram and ends in a pink action panel using the same angle. Numeric and line decorations are intentionally removed.

## Focused region comparison evidence

- Desktop at 868 × 545: the scene list remains inside the right panel with no clipping; the selected end-cap keeps its arrow legible.
- Mobile at 390 × 844: all three 72px rows remain fully tappable, with the parallelogram contained inside each row.
- Interaction: keyboard focus triggers the same yellow fill and pink end-cap as hover. Browser console reported no warnings or errors.

## Required fidelity surfaces

- Fonts and typography: existing project DM Sans/CJK hierarchy is retained; titles and their smaller descriptive line form the only vertical type hierarchy.
- Spacing and layout rhythm: the second row is offset farther right and the third row returns partway left, creating an intentional stagger while their right edges remain aligned.
- Colors and visual tokens: cream-on-plum defaults, yellow selected fill, and pink angular accents map directly to the current Lunar Pop tokens.
- Image quality and asset fidelity: existing Momo stage imagery is unchanged and stays isolated to the visual panel.
- Copy and content: original Lunar Pop labels, destinations, and accessible button names remain intact. `SELECT YOUR MOON` is decorative scene framing.

## Findings

No actionable P0, P1, or P2 differences remain for the requested matching yellow and pink parallelograms.

## Implementation checklist

- [x] Add a single selected-state parallelogram without pointer-driven work.
- [x] Stagger the three scene rows while preserving their right edge.
- [x] Remove numeric and line decorations.
- [x] Add selected-row pink slanted end-cap.
- [x] Verify desktop reference-sized and 390px mobile layouts.
- [x] Verify keyboard selection and console cleanliness.

## Follow-up polish

No blocking polish remains.

final result: passed

---

# Lunar Pop 月兔背景 Design QA

## Comparison target

- Theme direction: Lunar Pop Club 月兔限定舞台；保留遊戲既有舞台與互動。
- Source assets: `public/images/lunar-pop-stage-bg-v1.webp`, `public/images/lunar-rabbit-star-map-bg-v1.webp`, `public/images/lunar-rabbit-lantern-garden-bg-v1.webp`, and `public/images/lunar-rabbit-night-sky-footer-v1.webp`.
- Implementation evidence: Codex in-app Browser desktop capture at 1350px wide, and mobile capture at 390 × 844.

## Verified surfaces

- Hero: retains the neon moon concert as the opening visual.
- Story: uses the celestial rabbit constellation map as a distinct quiet backdrop.
- Invitation: uses the rabbit lantern garden, with the CTA copy remaining legible at desktop and 390px widths.
- Footer: uses the minimal moon-lake night scene.
- Game boundary: `.rhythm-stage-bg` continues to use `momo-moon-rabbit-stage-v2.webp`; the Lunar Pop background overrides do not affect its game logic.
- Browser console: no warnings or errors in the checked page state.

## Findings

No actionable visual or responsive issues found in the updated non-game surfaces.

final result: passed
