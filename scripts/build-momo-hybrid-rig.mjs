// Kept as the existing npm entry point. The web renderer now uses the original
// artwork directly; this command validates its contract instead of cutting holes.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { createMomoSimulation } from '../src/lib/momoRig.js'

const root = resolve(import.meta.dirname, '..')
const source = 'public/images/momo-moon-rabbit-hero-v2.webp'
const bytes = await readFile(resolve(root, source))
const info = await sharp(bytes).metadata()
const rig = createMomoSimulation()
if (info.width !== rig.textureSize.width || info.height !== rig.textureSize.height || !info.hasAlpha) {
  throw new Error('Momo source must be a transparent 1024x1536 image')
}
const surface = rig.buildContinuousMesh(undefined, 64, 96)
rig.updateVertices(surface, 0, true)
if (!surface.positions.every((value, i) => value === surface.rest[i])) {
  throw new Error('Neutral pose must exactly preserve the original texture')
}
const report = {
  renderer: 'shared-surface-v7',
  source,
  sourceSha256: createHash('sha256').update(bytes).digest('hex'),
  canvas: rig.textureSize,
  vertices: surface.rest.length / 2,
  triangles: surface.indices.length / 3,
  pins: rig.pins.length + rig.hair.pins.length + rig.accessories.pins.length,
  accessoryZones: rig.accessories.pins.length,
  hairPins: rig.hair.pins.length,
  hairZones: rig.hair.chains.length,
  texturePasses: 1,
  generatedTextureLayers: 0,
}
await mkdir(resolve(root, 'artifacts/momo-rig-qa'), { recursive: true })
await writeFile(resolve(root, 'artifacts/momo-rig-qa/surface-report.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
