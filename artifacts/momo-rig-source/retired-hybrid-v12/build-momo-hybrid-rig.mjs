import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '..')
const sourcePath = join(root, 'public/images/momo-moon-rabbit-hero-v2.webp')
const repairPath = join(root, 'artifacts/momo-rig-source/momo-underpaint-generated-v1.png')
const maskRoot = join(root, 'public/images/hero-rig')
const outputRoot = join(root, 'public/images/momo-rig-hybrid')
const canvas = { width: 1024, height: 1536 }
const overlapPixels = 32
const masterInteriorInset = 14

const parts = [
  { id: 'ear-left', mask: 'momo-hero-ear-left.svg', group: 'ear-left', root: [.39, .14], tip: [.27, .04] },
  { id: 'ear-right', mask: 'momo-hero-ear-right.svg', group: 'ear-right', root: [.62, .13], tip: [.71, .04] },
  { id: 'hair-left-outermost', mask: 'momo-hero-hair.svg', group: 'hair-left-outermost', region: [0, 0, 105, 1536], root: [.37, .25], tip: [.05, .58], sway: 1.25, phase: .2 },
  { id: 'hair-left-outer', mask: 'momo-hero-hair.svg', group: 'hair-left-outer', region: [105, 0, 95, 1536], root: [.37, .25], tip: [.15, .61], sway: 1.10, phase: 1.1 },
  { id: 'hair-left-middle', mask: 'momo-hero-hair.svg', group: 'hair-left-middle', region: [200, 0, 90, 1536], root: [.38, .25], tip: [.24, .63], sway: .93, phase: 2.0 },
  { id: 'hair-left-inner', mask: 'momo-hero-hair.svg', group: 'hair-left-inner', region: [290, 0, 180, 1536], root: [.40, .25], tip: [.34, .60], sway: .74, phase: 2.9 },
  { id: 'hair-right-inner', mask: 'momo-hero-hair.svg', group: 'hair-right-inner', region: [560, 0, 185, 1536], root: [.62, .24], tip: [.68, .60], sway: .74, phase: 3.5 },
  { id: 'hair-right-middle', mask: 'momo-hero-hair.svg', group: 'hair-right-middle', region: [745, 0, 90, 1536], root: [.64, .24], tip: [.76, .63], sway: .93, phase: 4.4 },
  { id: 'hair-right-outer', mask: 'momo-hero-hair.svg', group: 'hair-right-outer', region: [835, 0, 90, 1536], root: [.65, .24], tip: [.86, .61], sway: 1.10, phase: 5.3 },
  { id: 'hair-right-outermost', mask: 'momo-hero-hair.svg', group: 'hair-right-outermost', region: [925, 0, 99, 1536], root: [.65, .24], tip: [.96, .58], sway: 1.25, phase: 6.2 },
  { id: 'hand-front', mask: 'momo-hero-hand-front.svg', group: 'hand-front', root: [.39, .35], tip: [.20, .30] },
  { id: 'hand-side', mask: 'momo-hero-hand-side.svg', group: 'hand-side', root: [.79, .36], tip: [.95, .36] },
  { id: 'bells', mask: 'momo-hero-bells.svg', group: 'bells', roots: [[.36, .12], [.70, .10], [.73, .14], [.57, .36], [.57, .33], [.19, .44], [.86, .48], [.33, .62], [.47, .82]] },
  { id: 'pompoms', mask: 'momo-hero-pompoms.svg', group: 'pompoms', roots: [[.46, .32], [.62, .34], [.57, .39], [.38, .39], [.70, .41], [.15, .45], [.17, .66], [.87, .50], [.85, .69], [.36, .66], [.50, .89]] },
]

const gapGuards = [
  { mask: 'momo-hero-bows.svg', radius: 28, padding: 20 },
  { mask: 'momo-hero-hair.svg', radius: 16, padding: 10 },
]

async function loadRgba(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  if (info.width !== canvas.width || info.height !== canvas.height) throw new Error(`Unexpected image size: ${path}`)
  return Buffer.from(data)
}

async function loadMask(part) {
  const { data } = await sharp(join(maskRoot, part.mask))
    .resize(canvas.width, canvas.height, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const alpha = new Uint8Array(canvas.width * canvas.height)
  const [regionX = 0, regionY = 0, regionWidth = canvas.width, regionHeight = canvas.height] = part.region ?? []
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (x < regionX || y < regionY || x >= regionX + regionWidth || y >= regionY + regionHeight) continue
      const pixel = y * canvas.width + x
      alpha[pixel] = data[pixel * 4 + 3]
    }
  }
  return alpha
}

function maskedPixels(source, mask) {
  const pixels = Buffer.from(source)
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    const offset = pixel * 4
    pixels[offset + 3] = Math.round((pixels[offset + 3] * mask[pixel]) / 255)
  }
  return pixels
}

function jointZone(part) {
  const zone = new Uint8Array(canvas.width * canvas.height)
  const roots = part.roots ?? (part.root ? [part.root] : [])
  const radius = overlapPixels + 20
  for (const [normalizedX, normalizedY] of roots) {
    const centerX = Math.round(normalizedX * canvas.width)
    const centerY = Math.round(normalizedY * canvas.height)
    const left = Math.max(0, centerX - radius)
    const right = Math.min(canvas.width - 1, centerX + radius)
    const top = Math.max(0, centerY - radius)
    const bottom = Math.min(canvas.height - 1, centerY + radius)
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const dx = x - centerX
        const dy = (y - centerY) * .8
        if (dx ** 2 + dy ** 2 <= radius ** 2) zone[y * canvas.width + x] = 1
      }
    }
  }
  return zone
}

function buildOwnColorUnderlay(visible, allowedAlpha, allowedZone) {
  const underlay = Buffer.from(visible)
  let active = new Uint8Array(canvas.width * canvas.height)
  for (let pixel = 0; pixel < active.length; pixel += 1) active[pixel] = underlay[pixel * 4 + 3] > 0 ? 1 : 0

  for (let pass = 0; pass < overlapPixels; pass += 1) {
    const next = active.slice()
    for (let y = 1; y < canvas.height - 1; y += 1) {
      for (let x = 1; x < canvas.width - 1; x += 1) {
        const pixel = y * canvas.width + x
        if (active[pixel] || !allowedZone[pixel] || allowedAlpha[pixel] < 224) continue
        const neighbors = [pixel - 1, pixel + 1, pixel - canvas.width, pixel + canvas.width]
        const sourcePixel = neighbors.find((neighbor) => active[neighbor])
        if (sourcePixel === undefined) continue
        const sourceOffset = sourcePixel * 4
        const offset = pixel * 4
        underlay[offset] = underlay[sourceOffset]
        underlay[offset + 1] = underlay[sourceOffset + 1]
        underlay[offset + 2] = underlay[sourceOffset + 2]
        underlay[offset + 3] = 255
        next[pixel] = 1
      }
    }
    active = next
  }
  return underlay
}

function erodeOpaqueAlpha(alpha, passes) {
  let active = alpha.map((value) => value >= 224 ? 1 : 0)
  for (let pass = 0; pass < passes; pass += 1) {
    const next = active.slice()
    for (let y = 1; y < canvas.height - 1; y += 1) {
      for (let x = 1; x < canvas.width - 1; x += 1) {
        const pixel = y * canvas.width + x
        if (!active[pixel]) continue
        if (!active[pixel - 1] || !active[pixel + 1] || !active[pixel - canvas.width] || !active[pixel + canvas.width]) {
          next[pixel] = 0
        }
      }
    }
    active = next
  }
  return active
}

function expandMask(mask, passes) {
  let active = mask.map((value) => value >= 128 ? 1 : 0)
  for (let pass = 0; pass < passes; pass += 1) {
    const next = active.slice()
    for (let y = 1; y < canvas.height - 1; y += 1) {
      for (let x = 1; x < canvas.width - 1; x += 1) {
        const pixel = y * canvas.width + x
        if (active[pixel]) continue
        if (active[pixel - 1] || active[pixel + 1] || active[pixel - canvas.width] || active[pixel + canvas.width]) next[pixel] = 1
      }
    }
    active = next
  }
  return active.map((value) => value ? 255 : 0)
}

function closeNarrowGaps(source, mask, passes) {
  let active = new Uint8Array(canvas.width * canvas.height)
  for (let pixel = 0; pixel < active.length; pixel += 1) {
    active[pixel] = mask[pixel] >= 128 && source[pixel * 4 + 3] >= 64 ? 1 : 0
  }

  for (let pass = 0; pass < passes; pass += 1) {
    const next = active.slice()
    for (let y = 1; y < canvas.height - 1; y += 1) {
      for (let x = 1; x < canvas.width - 1; x += 1) {
        const pixel = y * canvas.width + x
        if (!mask[pixel] || active[pixel]) continue
        if (active[pixel - 1] || active[pixel + 1] || active[pixel - canvas.width] || active[pixel + canvas.width]) next[pixel] = 1
      }
    }
    active = next
  }

  for (let pass = 0; pass < passes; pass += 1) {
    const next = active.slice()
    for (let y = 1; y < canvas.height - 1; y += 1) {
      for (let x = 1; x < canvas.width - 1; x += 1) {
        const pixel = y * canvas.width + x
        if (!active[pixel]) continue
        if (!mask[pixel] || !active[pixel - 1] || !active[pixel + 1] || !active[pixel - canvas.width] || !active[pixel + canvas.width]) next[pixel] = 0
      }
    }
    active = next
  }

  const colors = Buffer.from(source)
  let known = new Uint8Array(active.length)
  for (let pixel = 0; pixel < known.length; pixel += 1) {
    known[pixel] = active[pixel] && source[pixel * 4 + 3] >= 64 ? 1 : 0
  }
  for (let pass = 0; pass < passes * 2 + 4; pass += 1) {
    const next = known.slice()
    for (let y = 1; y < canvas.height - 1; y += 1) {
      for (let x = 1; x < canvas.width - 1; x += 1) {
        const pixel = y * canvas.width + x
        if (!active[pixel] || known[pixel]) continue
        const sourcePixel = [pixel - 1, pixel + 1, pixel - canvas.width, pixel + canvas.width].find((neighbor) => known[neighbor])
        if (sourcePixel === undefined) continue
        const offset = pixel * 4
        const sourceOffset = sourcePixel * 4
        colors[offset] = colors[sourceOffset]
        colors[offset + 1] = colors[sourceOffset + 1]
        colors[offset + 2] = colors[sourceOffset + 2]
        colors[offset + 3] = 255
        next[pixel] = 1
      }
    }
    known = next
  }

  const guard = Buffer.alloc(source.length)
  let filledPixels = 0
  for (let pixel = 0; pixel < active.length; pixel += 1) {
    if (!active[pixel] || source[pixel * 4 + 3] >= 224 || !known[pixel]) continue
    const offset = pixel * 4
    guard[offset] = colors[offset]
    guard[offset + 1] = colors[offset + 1]
    guard[offset + 2] = colors[offset + 2]
    guard[offset + 3] = 255
    filledPixels += 1
  }
  return { guard, filledPixels }
}

function compositeBehind(foreground, background) {
  const output = Buffer.from(foreground)
  for (let pixel = 0; pixel < canvas.width * canvas.height; pixel += 1) {
    const offset = pixel * 4
    const foregroundAlpha = foreground[offset + 3] / 255
    const backgroundAlpha = background[offset + 3] / 255
    const outputAlpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha)
    if (!outputAlpha || !backgroundAlpha) continue
    for (let channel = 0; channel < 3; channel += 1) {
      output[offset + channel] = Math.round((foreground[offset + channel] * foregroundAlpha + background[offset + channel] * backgroundAlpha * (1 - foregroundAlpha)) / outputAlpha)
    }
    output[offset + 3] = Math.round(outputAlpha * 255)
  }
  return output
}

function softenRibbonSeams(image) {
  const output = Buffer.from(image)
  const zones = [
    { left: 138, right: 208, top: 780, bottom: 990 },
    { left: 820, right: 905, top: 820, bottom: 1100 },
  ]
  let softenedPixels = 0
  for (const zone of zones) {
    for (let y = zone.top; y <= zone.bottom; y += 1) {
      for (let x = zone.left; x <= zone.right; x += 1) {
        const offset = (y * canvas.width + x) * 4
        const red = output[offset]
        const green = output[offset + 1]
        const blue = output[offset + 2]
        const alpha = output[offset + 3]
        const luminance = red * .2126 + green * .7152 + blue * .0722
        if (alpha < 128 || red > 178 || green > 72 || blue > 104 || luminance > 92) continue
        output[offset] = Math.round(red * .18 + 190 * .82)
        output[offset + 1] = Math.round(green * .18 + 24 * .82)
        output[offset + 2] = Math.round(blue * .18 + 58 * .82)
        softenedPixels += 1
      }
    }
  }
  return { image: output, softenedPixels }
}

function retainLargestComponent(alpha) {
  const visited = new Uint8Array(alpha.length)
  let largest = []
  for (let start = 0; start < alpha.length; start += 1) {
    if (!alpha[start] || visited[start]) continue
    const component = []
    const queue = [start]
    visited[start] = 1
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const pixel = queue[cursor]
      component.push(pixel)
      const x = pixel % canvas.width
      const neighbors = [pixel - canvas.width, pixel + canvas.width]
      if (x > 0) neighbors.push(pixel - 1)
      if (x < canvas.width - 1) neighbors.push(pixel + 1)
      for (const neighbor of neighbors) {
        if (neighbor < 0 || neighbor >= alpha.length || !alpha[neighbor] || visited[neighbor]) continue
        visited[neighbor] = 1
        queue.push(neighbor)
      }
    }
    if (component.length > largest.length) largest = component
  }
  const output = new Uint8Array(alpha.length)
  for (const pixel of largest) output[pixel] = 1
  return output
}

function compositeMaster(source, repair, fallback, detachedMask, interiorAlpha) {
  const output = Buffer.from(source)
  for (let pixel = 0; pixel < detachedMask.length; pixel += 1) {
    const mix = detachedMask[pixel] / 255
    if (!mix) continue
    const offset = pixel * 4
    const hasRepair = repair[offset + 3] >= 224
    const hasInteriorFallback = !hasRepair && interiorAlpha[pixel]
    const replacement = hasRepair ? repair : fallback
    const replacementAlpha = hasRepair
      ? repair[offset + 3]
      : hasInteriorFallback
        ? source[offset + 3]
        : 0
    for (let channel = 0; channel < 3; channel += 1) {
      output[offset + channel] = Math.round(source[offset + channel] * (1 - mix) + replacement[offset + channel] * mix)
    }
    output[offset + 3] = Math.round(source[offset + 3] * (1 - mix) + replacementAlpha * mix)
  }
  return output
}

function bounds(pixels) {
  let left = canvas.width
  let top = canvas.height
  let right = -1
  let bottom = -1
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (!pixels[(y * canvas.width + x) * 4 + 3]) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < left) throw new Error('Empty hybrid rig layer')
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 }
}

async function saveCropped(name, pixels, crop) {
  await sharp(pixels, { raw: { ...canvas, channels: 4 } })
    .extract({ left: crop.x, top: crop.y, width: crop.width, height: crop.height })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(join(outputRoot, name))
}

async function main() {
  const source = await loadRgba(sourcePath)
  const repair = await loadRgba(repairPath)
  const sourceAlpha = new Uint8Array(canvas.width * canvas.height)
  const repairAlpha = new Uint8Array(canvas.width * canvas.height)
  for (let pixel = 0; pixel < sourceAlpha.length; pixel += 1) {
    sourceAlpha[pixel] = source[pixel * 4 + 3]
    repairAlpha[pixel] = repair[pixel * 4 + 3]
  }
  const { data: fallbackData } = await sharp(source, { raw: { ...canvas, channels: 4 } })
    .blur(18)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const fallback = Buffer.from(fallbackData)
  const interiorAlpha = retainLargestComponent(erodeOpaqueAlpha(sourceAlpha, masterInteriorInset))
  const allowedAlpha = sourceAlpha.map((value, pixel) => Math.max(value, repairAlpha[pixel]))
  const detachedMask = new Uint8Array(canvas.width * canvas.height)
  const resolvedParts = []

  for (const part of parts) {
    const mask = await loadMask(part)
    for (let pixel = 0; pixel < mask.length; pixel += 1) detachedMask[pixel] = Math.max(detachedMask[pixel], mask[pixel])
    resolvedParts.push({ ...part, mask })
  }

  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })
  let master = compositeMaster(source, repair, fallback, detachedMask, interiorAlpha)
  let gapGuardPixels = 0
  for (const gapGuard of gapGuards) {
    const mask = expandMask(await loadMask(gapGuard), gapGuard.padding)
    const result = closeNarrowGaps(source, mask, gapGuard.radius)
    master = compositeBehind(master, result.guard)
    gapGuardPixels += result.filledPixels
  }
  const softenedRibbons = softenRibbonSeams(master)
  master = softenedRibbons.image
  let uncoveredInteriorPixels = 0
  for (let pixel = 0; pixel < detachedMask.length; pixel += 1) {
    if (detachedMask[pixel] && interiorAlpha[pixel] && master[pixel * 4 + 3] < 224) uncoveredInteriorPixels += 1
  }
  if (uncoveredInteriorPixels) {
    throw new Error(`Hybrid master still contains ${uncoveredInteriorPixels} uncovered interior pixels`)
  }
  await sharp(master, { raw: { ...canvas, channels: 4 } }).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(join(outputRoot, 'master.png'))

  const manifest = {
    version: 12,
    canvas,
    source: '/images/momo-moon-rabbit-hero-v2.webp',
    master: '/images/momo-rig-hybrid/master.png',
    jointOverlapPixels: overlapPixels,
    masterInteriorInset,
    gapGuardPixels,
    softenedRibbonPixels: softenedRibbons.softenedPixels,
    parts: [],
  }

  for (const part of resolvedParts) {
    const visible = maskedPixels(source, part.mask)
    const underlay = buildOwnColorUnderlay(visible, allowedAlpha, jointZone(part))
    const crop = bounds(underlay)
    const visibleName = `${part.id}.png`
    const underlayName = `${part.id}-underlay.png`
    await saveCropped(visibleName, visible, crop)
    await saveCropped(underlayName, underlay, crop)
    manifest.parts.push({
      id: part.id,
      group: part.group,
      visible: `/images/momo-rig-hybrid/${visibleName}`,
      underlay: `/images/momo-rig-hybrid/${underlayName}`,
      root: part.root,
      tip: part.tip,
      sway: part.sway,
      phase: part.phase,
      ...crop,
    })
  }

  await writeFile(join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Wrote hybrid master and ${manifest.parts.length} independent parts to ${outputRoot}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
