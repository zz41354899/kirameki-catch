import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import { readPsd, writePsdBuffer } from 'ag-psd'

const root = resolve(import.meta.dirname, '..')
const sourcePath = join(root, 'public/images/momo-moon-rabbit-hero-v2.webp')
const rigPath = join(root, 'public/images/hero-rig')
const outputPath = join(root, 'artifacts/momo-live2d-source/Momo_Live2D_Source_v1.psd')
const previewPath = join(root, 'artifacts/momo-live2d-source/Momo_Live2D_Source_v1-preview.png')
const reportPath = join(root, 'artifacts/momo-live2d-source/coverage-report.json')

const parts = [
  { name: 'HAIR_BACK_CURRENT__ParamHair', file: 'momo-hero-hair.svg', group: '10_HEAD', z: 20 },
  { name: 'EAR_L__ParamEarL', file: 'momo-hero-ear-left.svg', group: '10_HEAD', z: 30 },
  { name: 'EAR_R__ParamEarR', file: 'momo-hero-ear-right.svg', group: '10_HEAD', z: 30 },
  { name: 'FACE_AND_FRONT_HAIR__NEEDS_MANUAL_SPLIT', file: 'momo-hero-face.svg', group: '10_HEAD', z: 40 },
  { name: 'EYE_L_OPEN__ParamEyeLOpen', file: 'momo-hero-eye-open.svg', group: '10_HEAD', z: 90 },
  { name: 'EYE_R_WINK__ParamEyeROpen', file: 'momo-hero-eye-wink.svg', group: '10_HEAD', z: 90 },
  { name: 'BODY_SLEEVES_ARMS__NEEDS_MANUAL_SPLIT', file: 'momo-hero-body.svg', group: '20_BODY_ARMS', z: 10 },
  { name: 'HAND_L_FRONT__ParamArmLA', file: 'momo-hero-hand-front.svg', group: '20_BODY_ARMS', z: 80 },
  { name: 'HAND_R_SIDE__ParamArmRA', file: 'momo-hero-hand-side.svg', group: '20_BODY_ARMS', z: 80 },
  { name: 'SHOE_RAISED', file: 'momo-hero-shoe-raised.svg', group: '20_BODY_ARMS', z: 70 },
  { name: 'SHOE_STANDING', file: 'momo-hero-shoe-standing.svg', group: '20_BODY_ARMS', z: 70 },
  { name: 'BOWS__ParamBow', file: 'momo-hero-bows.svg', group: '30_ACCESSORIES', z: 100 },
  { name: 'BELLS__ParamBell', file: 'momo-hero-bells.svg', group: '30_ACCESSORIES', z: 120 },
  { name: 'POMPOMS__ParamPom', file: 'momo-hero-pompoms.svg', group: '30_ACCESSORIES', z: 110 },
]

function imageData(width, height, data) {
  return { width, height, data: new Uint8ClampedArray(data) }
}

async function loadRgba(path) {
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { width: info.width, height: info.height, data }
}

async function maskedLayer(source, maskPath) {
  const { data: mask, info } = await sharp(maskPath)
    .resize(source.width, source.height, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  if (info.width !== source.width || info.height !== source.height) {
    throw new Error(`Mask size mismatch: ${maskPath}`)
  }

  const pixels = Buffer.from(source.data)
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 3] = Math.round((pixels[i + 3] * mask[i + 3]) / 255)
  }
  return pixels
}

function groupLayers(layers) {
  const byGroup = new Map()
  for (const layer of layers) {
    const group = byGroup.get(layer.group) ?? []
    group.push({ name: layer.name, imageData: layer.imageData })
    byGroup.set(layer.group, group)
  }

  // PSD children are kept in top-to-bottom visual order.
  return [
    { name: '30_ACCESSORIES', opened: true, children: byGroup.get('30_ACCESSORIES') },
    { name: '10_HEAD', opened: true, children: byGroup.get('10_HEAD') },
    { name: '20_BODY_ARMS', opened: true, children: byGroup.get('20_BODY_ARMS') },
  ]
}

function coverageReport(source, layers) {
  const pixelCount = source.width * source.height
  let subjectPixels = 0
  let uncoveredPixels = 0
  let overlapPixels = 0
  let maximumCoverage = 0

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const alphaIndex = pixel * 4 + 3
    if (source.data[alphaIndex] === 0) continue
    subjectPixels += 1
    let coverage = 0
    for (const layer of layers) {
      if (layer.pixels[alphaIndex] > 0) coverage += 1
    }
    if (coverage === 0) uncoveredPixels += 1
    if (coverage > 1) overlapPixels += 1
    maximumCoverage = Math.max(maximumCoverage, coverage)
  }

  return {
    canvas: { width: source.width, height: source.height },
    source: 'public/images/momo-moon-rabbit-hero-v2.webp',
    generatedAt: new Date().toISOString(),
    subjectPixels,
    uncoveredPixels,
    uncoveredPercent: Number(((uncoveredPixels / subjectPixels) * 100).toFixed(3)),
    overlapPixels,
    overlapPercent: Number(((overlapPixels / subjectPixels) * 100).toFixed(3)),
    maximumCoverage,
    note: 'This measures the current front-view masks only. It does not prove that hidden pixels needed for head turns or arm swings exist.',
  }
}

function removeVisibleOverlap(layers, width, height) {
  const claimed = new Uint8Array(width * height)
  const ordered = [...layers].sort((a, b) => b.z - a.z)
  for (const layer of ordered) {
    for (let pixel = 0; pixel < claimed.length; pixel += 1) {
      const alphaIndex = pixel * 4 + 3
      if (layer.pixels[alphaIndex] === 0) continue
      if (claimed[pixel]) {
        layer.pixels[alphaIndex] = 0
      } else {
        claimed[pixel] = 1
      }
    }
    layer.imageData = imageData(width, height, layer.pixels)
  }
}

async function main() {
  const source = await loadRgba(sourcePath)
  if (source.width !== 1024 || source.height !== 1536) {
    throw new Error(`Unexpected Momo source size: ${source.width}x${source.height}`)
  }

  const rasterLayers = []
  for (const part of parts) {
    const pixels = await maskedLayer(source, join(rigPath, part.file))
    rasterLayers.push({
      ...part,
      pixels,
      imageData: imageData(source.width, source.height, pixels),
    })
  }

  // Neutral-pose layers must not duplicate visible pixels. Safety overlap belongs
  // in separately repainted under-layers, which this flattened source cannot infer.
  removeVisibleOverlap(rasterLayers, source.width, source.height)

  const report = coverageReport(source, rasterLayers)
  const psd = {
    width: source.width,
    height: source.height,
    colorMode: 3,
    imageData: imageData(source.width, source.height, source.data),
    children: [
      ...groupLayers(rasterLayers),
      {
        name: '90_REPAINT_REQUIRED__DO_NOT_RIG_YET',
        opened: true,
        hidden: true,
        children: [
          { name: 'ADD_FRONT_HAIR_AND_FACE_AS_SEPARATE_RGBA_LAYERS' },
          { name: 'ADD_BACK_HEAD_AND_SIDE_FACE_OVERDRAW_FOR_ANGLE_X' },
          { name: 'SPLIT_EACH_ARM_INTO_UPPER_FOREARM_HAND' },
          { name: 'SPLIT_EACH_SLEEVE_INTO_FRONT_BACK_AND_INNER' },
          { name: 'SPLIT_LONG_HAIR_INTO_ROOT_MIDDLE_TIP_CHAINS' },
          { name: 'ADD_MOUTH_SHAPES_AND_BOTH_EYE_CLOSED_LAYERS' },
        ],
      },
      {
        name: '99_REFERENCE__KEEP_HIDDEN',
        hidden: true,
        children: [
          {
            name: 'ORIGINAL_MOMO_1024x1536__ALIGNMENT_REFERENCE',
            imageData: imageData(source.width, source.height, source.data),
          },
        ],
      },
    ],
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, writePsdBuffer(psd, {
    compress: true,
    generateThumbnail: false,
    trimImageData: false,
    noBackground: true,
  }))
  await sharp(source.data, {
    raw: { width: source.width, height: source.height, channels: 4 },
  }).png().toFile(previewPath)
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)

  // Re-open the file structurally so CI catches invalid PSD output.
  const saved = await readFile(outputPath)
  const verified = readPsd(saved, {
    skipLayerImageData: true,
    skipCompositeImageData: true,
    skipThumbnail: true,
  })
  if (verified.width !== source.width || verified.height !== source.height) {
    throw new Error('PSD verification failed: canvas size changed')
  }

  console.log(`Wrote ${outputPath}`)
  console.log(`Wrote ${previewPath}`)
  console.log(`Wrote ${reportPath}`)
  console.log(`Coverage: ${report.uncoveredPercent}% uncovered, ${report.overlapPercent}% overlapping`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
