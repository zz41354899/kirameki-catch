// Local secondary motion on the same connected surface: no extra image layers.
// Each attachment is stationary in local space; only its free end can bend.
export const ACCESSORY_CHAINS = [
  { id: 'ear-left', root: [.44, .084], tip: [.25, .125], radius: .10, angle: .070, stiffness: .033, damping: .93, phase: .2 },
  { id: 'ear-right', root: [.57, .066], tip: [.73, .061], radius: .10, angle: .075, stiffness: .030, damping: .94, phase: 1.1 },
  { id: 'ribbon-left', root: [.19, .481], tip: [.175, .711], radius: .12, angle: .060, stiffness: .021, damping: .95, phase: .7 },
  { id: 'ribbon-right', root: [.872, .569], tip: [.854, .767], radius: .12, angle: .065, stiffness: .019, damping: .95, phase: 1.7 },
  { id: 'bow-left-tail', root: [.595, .356], tip: [.494, .414], radius: .075, angle: .050, stiffness: .035, damping: .92, phase: 1.4 },
  { id: 'bow-right-tail', root: [.609, .356], tip: [.685, .419], radius: .075, angle: .055, stiffness: .032, damping: .93, phase: 2.4 },
  { id: 'bell', root: [.605, .402], tip: [.614, .450], radius: .047, angle: .13, stiffness: .080, damping: .86, phase: 2.0 },
  { id: 'sleeve-left', root: [.405, .282], tip: [.223, .440], radius: .09, angle: .023, stiffness: .042, damping: .91, phase: .9 },
  { id: 'sleeve-right', root: [.711, .342], tip: [.855, .521], radius: .10, angle: .026, stiffness: .038, damping: .92, phase: 2.2 },
]

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }

export function createAccessoryDynamics() {
  const pins = ACCESSORY_CHAINS.map((chain) => ({ ...chain, rotation: 0, velocity: 0 }))

  function update(time, deltaTime, lookVelocity, wave) {
    // Fixed substeps keep springs stable even after a stalled/background frame.
    const duration = clamp(deltaTime / 16.67, 0, 2)
    const steps = Math.max(1, Math.ceil(duration / .5)), dt = duration / steps
    for (const pin of pins) {
      const breeze = Math.sin(time * .0008 + pin.phase) * .28 + Math.sin(time * .0013 + pin.phase * 2) * .10
      const waveForce = pin.id === 'sleeve-right' || pin.id === 'ribbon-right'
        ? Math.sin(wave * Math.PI) * Math.sin(wave * Math.PI * 6) * .32 : 0
      const target = pin.angle * Math.tanh(-lookVelocity / 2.4 * 1.8 + breeze + waveForce)
      for (let step = 0; step < steps; step += 1) {
        pin.velocity = (pin.velocity + (target - pin.rotation) * pin.stiffness * dt) * Math.pow(pin.damping, dt)
        const next = pin.rotation + pin.velocity * dt
        pin.rotation = clamp(next, -pin.angle, pin.angle)
        if (pin.rotation !== next) pin.velocity *= .25
      }
    }
  }

  function bind(rest) {
    const offsets = new Uint32Array(rest.length / 2 + 1), indices = [], weights = []
    for (let vertex = 0; vertex < rest.length / 2; vertex += 1) {
      const x = rest[vertex * 2], y = rest[vertex * 2 + 1]
      for (let i = 0; i < pins.length; i += 1) {
        const pin = pins[i], [rx, ry] = pin.root
        const ax = pin.tip[0] - rx, ay = (pin.tip[1] - ry) * 1.5
        const length = Math.hypot(ax, ay)
        const px = x - rx, py = (y - ry) * 1.5
        const progress = (px * ax + py * ay) / (length * length)
        const across = Math.abs(px * ay - py * ax) / length
        // C1-continuous falloff, including beyond the tip. Never cut weights at
        // an image boundary. The root plane has exactly zero local influence.
        const weight = smooth(.08, .70, progress) * (1 - smooth(1.05, 1.65, progress)) * (1 - smooth(.1, 1, across / pin.radius))
        if (weight < .00001) continue
        indices.push(i); weights.push(weight)
      }
      offsets[vertex + 1] = indices.length
    }
    return { offsets, indices: new Uint16Array(indices), weights: new Float32Array(weights) }
  }

  function displacement(binding, vertex, x, y) {
    let dx = 0, dy = 0
    for (let i = binding.offsets[vertex]; i < binding.offsets[vertex + 1]; i += 1) {
      const pin = pins[binding.indices[i]], angle = pin.rotation * binding.weights[i]
      const px = x - pin.root[0], py = (y - pin.root[1]) * 1.5
      dx += px * (Math.cos(angle) - 1) - py * Math.sin(angle)
      dy += (px * Math.sin(angle) + py * (Math.cos(angle) - 1)) / 1.5
    }
    return { x: dx, y: dy }
  }
  return { pins, update, bind, displacement }
}
