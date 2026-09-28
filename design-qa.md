# Mobile wardrobe QA

## Comparison target

- Source visual truth: `/var/folders/fp/bv98vn2s2v9dchl651zpsvn00000gn/T/TemporaryItems/NSIRD_screencaptureui_cNEJiT/截圖 2026-09-28 下午5.26.52.png`
- Implementation: browser-rendered `http://127.0.0.1:4179/__qa_wardrobe.html` capture.
- Viewport: 390 × 844 CSS px, device scale factor 1.
- State: mobile wardrobe open, default hair/outfit selected, alternate rewards still locked.

## Comparison history

- [P1] The supplied capture exposed an abrupt switch from the deep wardrobe surface to the pale paper background during the hair card. The cause was a viewport-sized dark pseudo-layer while the scrollable dialog continued below it.
- Fix: the dialog now applies an opaque plum layer across its complete scrollable background; the pseudo-layer now adds only a soft top glow rather than a full-height dark overlay.
- Post-fix evidence: browser capture at 390 × 844 was scrolled from the character preview through both hair and outfit cards. The entire surface remained deep plum; no pale strip, horizontal overflow, or console error was present.

## Fidelity surfaces

- Typography and copy: existing Traditional-Chinese labels, weights, and hierarchy are unchanged.
- Spacing and layout rhythm: the one-column mobile wardrobe keeps the existing preview-to-options spacing and full-width cards.
- Colors and tokens: selected cards retain yellow emphasis; locked cards remain muted against a continuous deep-plum stage surface.
- Image quality: the 3:4 Momo sprite remains fully visible without crop.
- Accessibility: locked items remain disabled controls and selected items retain their pressed state.

## Checks

- `npm test`: 10 passing.
- `npm run build`: passing.
- `git diff --check`: passing.
- Browser console: no warnings or errors.

## Close action redesign

- Target: the mobile wardrobe control needs the same dependable close affordance as the card book, rather than a control embedded in its scrolling content.
- Fix: the control is now an independent circular `×`, outside the scrolling wardrobe panel and aligned to the top-right safe area. Its 52 × 52 CSS-px mobile target is available at all scroll positions. `pointerup` closes immediately for touch input; the normal click handler remains for keyboard activation.
- Browser proof: at 390 × 844 CSS px, the control stays separate from the wardrobe scroll surface and the heading. Opening it from the actual `RhythmGameModal` and activating the close button returned focus to the still-visible in-game `衣櫥` trigger; the wardrobe dialog was no longer present.
- Desktop RWD check: at 1440 × 900 CSS px, the compact circular control remains in the panel's top-right corner without competing with the title or the option grid.
- Accessibility: the target remains a semantic button with the `關閉 Momo 舞台衣櫥` accessible name.

## Landscape wardrobe Easter egg card

- Source visual truth: `/var/folders/fp/bv98vn2s2v9dchl651zpsvn00000gn/T/TemporaryItems/NSIRD_screencaptureui_TWWabb/截圖 2026-09-28 下午6.17.13.png`, which identifies the sixth card as the rare wardrobe Easter egg; the final illustration was newly generated for the requested wardrobe-only costume and 3:2 card ratio.
- Implementation: `public/images/momo-moon-rabbit-wardrobe-card-v1.webp`, rendered in the in-app browser from `http://127.0.0.1:4182/__qa-card`.
- Viewports: 1297 × 916 and 390 × 844 CSS px, device scale factor 1. The image is 1536 × 1024 px (exact 3:2).
- State: the sixth `月光衣櫥` collection item unlocked and selected.
- [P1] Earlier implementation forced a portrait wardrobe image into a horizontal card with `object-fit: cover`, visibly cropping the character and making the secret card look like an ordinary scene card.
- Fix: replaced the exact `momo-moon-rabbit-wardrobe-card-v1.webp` asset with an original 3:2 illustration: a full-body Momo in a moonlit lavender/pearl wardrobe-exclusive costume inside an enchanted wardrobe room. The selected preset now opens as landscape by default, while the preview and canvas export preserve the original landscape composition.
- Post-fix evidence: desktop preview measured 440 × 297 px and mobile preview 343 × 229 px; both retain the whole horizontal scene without overflow. Console contained no warnings or errors.
- Fidelity surfaces: the existing card typography and editable wish remain unchanged; the dark-left text area keeps contrast, violet/gold wardrobe lighting distinguishes the rare reward, full figure/costume and wardrobe are visible, and `月光衣櫥` remains subject to its existing two-reward lock.

final result: passed
