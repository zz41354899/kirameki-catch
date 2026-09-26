# Hero Design QA

## Evidence

- Source visual truth: `/var/folders/fp/bv98vn2s2v9dchl651zpsvn00000gn/T/TemporaryItems/NSIRD_screencaptureui_CygUbB/截圖 2026-09-26 晚上8.43.34.png`
- Implementation screenshot: `/Users/zz41354899/Desktop/kirameki-catch/design-qa-hero-desktop.png`
- Combined comparison: `/Users/zz41354899/Desktop/kirameki-catch/design-qa-comparison.png`
- Desktop implementation viewport: 1270 x 710 CSS px, device scale factor 1, default state after the opening animation.
- Source pixels: 559 x 591. The source is a cropped detail rather than a complete viewport, so it is used to judge the title lockup and local spacing, not full-frame proportions.
- Implementation pixels: 1270 x 710. For the combined comparison it was proportionally normalized to 1057 x 591 and placed beside the unchanged 559 x 591 source crop.
- Responsive evidence: the same route was also inspected in the in-app browser at 390 x 844 CSS px.
- Primary interactions tested: opening animation completion and menu open/close.
- Browser console: no warnings or errors.

## Full-view comparison

The revised desktop composition preserves the existing character, background, color system, and copy while giving the headline a stepped reading order. The title no longer forms one dense vertical block, the description has a stable left edge, and the character and headline retain separate visual territories.

## Focused-region comparison

The source crop and implementation were compared together in `design-qa-comparison.png`. This focused comparison was required because the user's reference isolates the headline region. It confirms that the revised headline uses a smaller optical size, increased line rhythm, and a deliberate rightward offset for `接住。` without changing the content.

## Findings

- No actionable P0, P1, or P2 findings remain.
- Fonts and typography: existing brand typefaces and weights are preserved. Display size, line height, tracking, and line offsets now create a clear lead/main/tail hierarchy without clipping or unintended wrapping.
- Spacing and layout rhythm: kicker, headline, and description share a coherent vertical rhythm. Desktop and 390 px mobile layouts retain safe margins and do not collide with the character.
- Colors and visual tokens: the existing plum, pink, cream, and yellow tokens remain unchanged and preserve contrast.
- Image quality and asset fidelity: the supplied `momo-hero-reach.png` asset is unchanged, remains sharp, and is not replaced or approximated.
- Copy and content: all user-facing copy is unchanged.

## Comparison history

1. Initial P2: the three headline lines competed on nearly the same left edge, with an oversized display scale and tight line height that made the crop feel like a dense text wall.
2. Fix: reduced the display scale, increased line rhythm, moved the title block slightly right, aligned the kicker and description, and offset `接住。` to form a stepped lockup.
3. Post-fix evidence: `design-qa-comparison.png` shows clearer hierarchy and separation; the 390 x 844 in-app browser check shows the full headline and character without overflow.

## Implementation checklist

- [x] Preserve supplied character and background assets.
- [x] Preserve copy and brand colors.
- [x] Improve desktop headline hierarchy and local spacing.
- [x] Verify the 390 px responsive composition.
- [x] Verify menu interaction and console output.

## Follow-up polish

- No blocking follow-up. Minor optical nudges can be made later if a different display font is introduced.

final result: passed
