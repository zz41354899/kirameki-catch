# Momo moving seams: 2026-09-29

The v12 layered renderer did not reproduce the source artwork even at rest.
CPU source-over compositing of the actual runtime layer order (all underlays,
master, all visible parts) at the original crop offsets gave:

| Region | Source alpha < .05, composite alpha > .5 | Source alpha > .95, composite alpha < .9 | Opaque pixels with RGB difference > 20 |
| --- | ---: | ---: | ---: |
| Whole character | 14379 | 548 | 4820 |
| Left ribbon (70,760,200,390) | 3106 | 196 | 1513 |
| Right hand/hair (850,490,174,310) | 827 | 59 | 81 |

The original art does contain transparent negative spaces, but that does not
explain the added pixels, loss of coverage, or animated layer misregistration.
The preceding color-fill explanation was insufficient.

The v12 pipeline also applied an extra independent rotation to eight rectangular
hair crops but not the master, and used different triangulations for master and
parts. A shared analytic base transform alone cannot weld independently sampled
and independently rotated surfaces. Root overlap only masks some poses.

## Current implementation

- MomoPuppet draws the original WebP once on a 64 x 96 connected indexed grid.
- Eight blended hair influence zones and the existing 33 pins move shared vertices.
- There are no generated repair images, per-part masks, alpha fills, or ribbon
  recoloring in the runtime; original transparency and RGB are preserved.
- A per-triangle displacement-gradient bound prevents mesh folding. It scales
  the whole displacement field together when necessary, not individual parts.
- Fine hair motion is now shared-surface deformation, not independently
  occluding painted hair strands. It cannot reveal a newly painted side face or
  hidden sleeve interior, and does not provide genuine 3D +/-30-degree turns.
- Retired images and generator are recoverable in
  artifacts/momo-rig-source/retired-hybrid-v12/ and are no longer served in public/.

## Verification

The tests execute the same simulation module imported by the Vue renderer.
The neutral pose has bit-identical vertex/UV coordinates and no open interior
edges. A 600-frame reversal/wave/stalled-frame test checked 12288 triangles every
frame: minimum area ratio 0.829169, maximum sampled hair travel 22.3115 source px.
An adversarial folded mesh and NaN coordinate recover safely.

Development-only visual controls: ?rigInspect=rest freezes the neutral surface;
?rigInspect=stress continuously sweeps pointer and wave extremes. The canvas
data attributes report the active renderer and gradient/limiter state.
These controls are excluded from production behavior.

Browser checks cover desktop and 800px width, the neutral pose, automatic
stress poses, and normal pointer interaction. Static artwork gaps remain part
of the artwork; this patch targets additional gaps, duplicate edges and tears
caused by the animation pipeline.

## Hair subdivision v2

The shared surface now has 17 local hair chains (one ahoge, eight left ponytail
locks, eight right ponytail locks). Each has root, mid and tip pins: 51 local
hair pins in addition to the 33 existing whole-character pins. Local roots have
zero offset relative to the deformed surface; mids and tips have separate
spring states and per-lock phases. Sparse vertex bindings are computed once.
The face center is outside these local influence regions.

The 600-frame stress run with v2 had minimum triangle area ratio 0.464911 and
18.1259 source-pixel movement at the sampled left-hair vertex. All 17 chains
individually influence mesh vertices; face isolation, anchored roots and
distinct mid/tip motion have explicit tests. The original artwork is unchanged.

## Bangs and flowing motion v3

Seven front-hair chains bring the hair total to 24 chains / 72 pins. Front-hair
influences fade away around the two eyes and lower face, including after weight
smoothing on the actual render grid. Ponytails use a slower tip spring with
longer settling time; front hair has a smaller displacement limit.

A repeatable 360-frame horizontal sweep showed a cause of rigid motion in v2:
214 frames triggered the global fold limiter (mean motion scale 0.7892).
Nearest-segment weight selection and narrow support produced steep local
gradients. V3 blends both segments of each lock, expands support, and smooths
the skinning weights once at initialization. The same sweep now has zero
limited frames and mean motion scale 1. The safety bound remains .65.
The 600-frame stress test has minimum area ratio 0.753094 and sampled left-hair
travel 24.0884 source pixels. Source texture and alpha remain unchanged.

## Accessory follow-through v4

Nine additional local bend controls cover both ears, both long ribbons with
their end pompoms, both center-bow tails, the center bell and both sleeves.
These are deformation zones, not independent image layers. Attachment planes
have zero local weight; smooth longitudinal and transverse falloffs keep the
original connected surface. Each control has its own spring state, with slower
ribbons, faster bell settling, staggered breeze and pointer-velocity response.
Sleeve amplitudes are deliberately smaller. No art was generated or recut.

All 20 tests pass, including independent tip response, anchored attachments,
face exclusion, follow-through after release and bounded stalled-frame updates.
The 600-frame reversal/wave/stall run has minimum triangle area ratio 0.648359;
the regular 360-frame sweep still has zero limited frames. Production build
and diff whitespace checks pass (existing Nuxt sourcemap warning remains).
Browser pointer reversal checks loaded shared-surface-v4 / 9 accessory zones
with no captured warning/error logs. Proof: flowing-accessories-v4.png.

## Touch gestures

Hero input previously rejected every pointer type except mouse. Touch/pen now
use the same absolute position mapping as mouse, starting on first contact.
A 9px intent threshold controls capture/click suppression only. Vertical intent is
locked to browser scrolling; pan-y and pinch-zoom remain enabled on the parent
and hotspot buttons. Capture begins only for horizontal drag. Release/cancel
resets the rig target for spring settling. Drag-generated clicks are suppressed
in capture phase; a new tap and keyboard activation retain existing reactions.
Touch-capable devices show a gesture hint in place of mouse instructions.

All 22 tests and the production build pass. Gesture tests cover touch-to-rig
motion and settling, vertical intent, cancellation, pen, multiple pointers,
synthetic-click suppression, fresh taps and keyboard activation. Mobile browser
preview was attempted but debugger/viewport operations timed out, including
viewport reset; no mobile screenshot or physical-device touch verification is
claimed for this change.
The follow-up absolute-position tests also verify mouse/touch coordinate parity
on initial contact, small movement and horizontal dragging.

## Canvas clipping / buffer resize correction

A 360-frame two-axis pointer sweep sampled original alpha >=128 at render-grid
vertices. 238 frames had opaque samples outside the original [0,1] framebuffer:
x min -0.028149, x max 1.015402, y min -0.013897. This is raster clipping, not
an open mesh edge; triangle-fold tests alone did not detect it.

The canvas now has 12% transparent overscan on each side. Vertex projection
and CSS offset/extent cancel exactly, preserving source size and hit targets.
The 600-frame rapid-reversal/wave/stall regression checks ALL mesh vertices
remain within that padded viewport, in addition to positive triangle areas.
This does not change texture pixels, pin amplitudes or the fold safety bound.

Previously getBoundingClientRect() ran every animation frame and measured GSAP
scales, causing buffer reallocations as breathing changed the apparent size.
ResizeObserver could also clear the canvas between render frames. Buffer sizes
now use untransformed layout dimensions, with observer-driven invalidation;
allocation occurs immediately before drawing. The initial frame is drawn before
hiding the fallback. 23 tests, production build and diff checks pass.
Chrome stress and manual pointer-reversal checks loaded 0.12 padding with no
captured warning/error logs. Screenshot: overscan-v5.png. This confirms the
reproduced canvas-boundary issue, not every possible intermittent artifact.

## Remaining CSS clip: verified root cause of ineffective overscan

The overscan correction was incomplete: a more specific legacy rule in
momo-official.css still applied overflow:hidden to
`.hero-character.is-rig-ready .hero-character-rig` after initialization.
Live Chrome computed styles confirmed the expanded canvas was 691x1040 CSS px
while its 557x839 parent clipped it back to the old image rectangle. The fallback
image had opacity 0; there was only one visible character texture. Thus passing
WebGL bounds tests did not establish that the DOM allowed those pixels to show.

Removed the ready-only clip. All four local wrappers now have computed
overflow-x/y:visible. The section/page boundary is intentionally unchanged.
Verified ready-state styles at desktop, 800x900 and 390x844 while stress motion
was active; returned to normal pointer mode and reset the viewport afterward.
A CSS regression test covers base, ready and responsive wrapper selectors and
rejects overflow clipping or paint containment. All 24 tests, production build
and whitespace checks pass. Visual proof: unclipped-v6.png.
