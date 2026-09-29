# Momo Live2D source package

`Momo_Live2D_Source_v1.psd` is the raster, fixed-canvas replacement for the
earlier SVG-mask experiment. Every populated layer contains RGBA pixels on the
same 1024 x 1536 canvas as `momo-moon-rabbit-hero-v2.webp`, so Cubism imports all
parts at one shared origin.

The PSD itself contains no SVG/vector layers. The old SVG files are retained
only as legacy cutting guides for rebuilding this artifact; they are not the
Cubism input and are not used as movable website parts.

The generated neutral-pose layers are mutually exclusive: no visible pixel is
duplicated by two parts. When repainting hidden coverage, put the 20-40 px safety
extension only on the rear/under layer so it stays invisible at the default pose.

## What is ready

- rear/long hair region
- left and right ears
- current face region and both visible eye regions
- current body region
- both hands and both shoes
- bows, bells, and pompoms

## What is deliberately marked incomplete

The source illustration is one flattened front-view image. The PSD therefore
labels the combined face/front-hair and body/sleeve/arm layers instead of
pretending those hidden pixels already exist. Before making the `.cmo3`, repaint
and split the placeholders in `90_REPAINT_REQUIRED__DO_NOT_RIG_YET`:

1. Separate face skin, front hair, and rear head; extend every seam 20-40 px
   beneath its neighbour.
2. Draw left/right side-face and back-head coverage for `ParamAngleX`.
3. Split each arm into upper arm, forearm, and hand.
4. Split each sleeve into front, rear, and inner layers; restore the shoulder.
5. Split each long-hair side into root, middle, and tip chains.
6. Add both closed-eye layers and mouth A/I/U/E/O shapes.

The existing repair sheets in `public/images/hero-rig/` are visual references,
not aligned PSD layers. Place and repaint from them inside an image editor before
rigging; do not import those sheets into Cubism as-is.

## PSD to `.cmo3`

1. Open the PSD in Live2D Cubism Editor. Do not merge layers.
2. Generate ArtMeshes, then create rotation deformers from parent to child.
3. Build `ParamAngleX/Y/Z`, eye, mouth, body, and arm parameters.
4. Add physics groups only after the seams remain covered at parameter extremes.
5. Save the editable project as `.cmo3`.
6. Export the web runtime files to `public/live2d/momo/` following
   `artifacts/LIVE2D-MOMO-EXPORT.md`.

Rebuild and verify the PSD with:

```sh
npm run build:momo-psd
```
