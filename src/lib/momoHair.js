// Coordinates follow visible locks in the original 1024 x 1536 artwork.
// These are overlapping deformation influences on one surface, not image cuts.
const strand = (id, points, phase, radius = .042, gain = 1) => ({ id, points, phase, radius, gain })
export const HAIR_CHAINS = [
  strand('ahoge', [[.465, .069], [.456, .044], [.491, .047]], .3, .023, .22),
  strand('pony-left-outer', [[.34, .17], [.12, .285], [.040, .353]], .2),
  strand('pony-left-outer-curl', [[.34, .18], [.075, .327], [.096, .425]], .7),
  strand('pony-left-middle-a', [[.35, .18], [.16, .295], [.144, .421]], 1.2),
  strand('pony-left-middle-b', [[.35, .19], [.205, .298], [.186, .407]], 1.7),
  strand('pony-left-inner', [[.35, .19], [.253, .264], [.230, .334]], 2.2, .033, .65),
  strand('pony-left-tip-a', [[.165, .365], [.077, .423], [.109, .460]], 2.7, .035),
  strand('pony-left-tip-b', [[.133, .429], [.065, .463], [.089, .505]], 3.2, .033),
  strand('pony-left-tip-c', [[.099, .455], [.045, .485], [.080, .521]], 3.7, .028, .8),
  strand('pony-right-outer', [[.69, .17], [.89, .280], [.980, .363]], .8),
  strand('pony-right-outer-curl', [[.70, .18], [.948, .310], [.940, .405]], 1.3),
  strand('pony-right-middle-a', [[.69, .18], [.865, .295], [.903, .366]], 1.8),
  strand('pony-right-middle-b', [[.69, .19], [.810, .290], [.849, .343]], 2.3),
  strand('pony-right-inner', [[.68, .19], [.737, .277], [.777, .324]], 2.8, .033, .65),
  strand('pony-right-tip-a', [[.953, .410], [.955, .450], [.921, .476]], 3.3, .035),
  strand('pony-right-tip-b', [[.906, .423], [.960, .478], [.936, .501]], 3.8, .033),
  strand('pony-right-tip-c', [[.924, .460], [.970, .502], [.918, .527]], 4.3, .030, .8),
  strand('bang-left-side', [[.438, .09], [.405, .133], [.416, .191]], .4, .040, .8),
  strand('bang-left-outer', [[.459, .088], [.430, .127], [.447, .177]], .85, .036, .8),
  strand('bang-left-inner', [[.475, .092], [.462, .128], [.480, .165]], 1.3, .034, .8),
  strand('bang-center', [[.500, .095], [.503, .126], [.516, .161]], 1.75, .034, .8),
  strand('bang-right-inner', [[.522, .094], [.537, .123], [.553, .157]], 2.2, .034, .8),
  strand('bang-right-outer', [[.547, .096], [.567, .123], [.585, .151]], 2.65, .036, .8),
  strand('bang-right-side', [[.575, .103], [.607, .146], [.617, .206]], 3.1, .040, .8),
]

const clamp = (v, low, high) => Math.max(low, Math.min(high, v))
function smooth(a, b, value) {
  const t = clamp((value - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

// Fade across eye/face boundaries; a hard mask here would introduce a sharp
// displacement gradient and trigger the whole-surface fold limiter.
function faceClearance(x, y) {
  let weight = 1
  for (const [cx, cy, rx, ry] of [[.478, .193, .047, .023], [.578, .175, .043, .020], [.535, .235, .095, .041]]) {
    weight *= smooth(.9, 1.5, Math.hypot((x - cx) / rx, (y - cy) / ry))
  }
  return weight
}

function profile(chain) {
  const front = chain.id.startsWith('bang-')
  const pony = chain.id.startsWith('pony-')
  return { front, radius: chain.radius * (pony ? 1.6 : 1), maximum: front ? .007 * chain.gain : Math.min(.024 * chain.gain, chain.radius * (pony ? 1.6 : 1) * .22) }
}

export function createHairDynamics() {
  const pins = HAIR_CHAINS.flatMap((chain) => chain.points.map(([x, y], depth) => ({
    name: `${chain.id}-${['root', 'mid', 'tip'][depth]}`,
    parent: depth ? `${chain.id}-${depth === 1 ? 'root' : 'mid'}` : 'surface',
    x, y, depth, dx: 0, dy: 0, vx: 0, vy: 0,
    phase: chain.phase, gain: chain.gain,
    maximum: profile(chain).maximum,
    front: profile(chain).front,
    stiffness: profile(chain).front ? (depth === 1 ? .095 : .060) : (depth === 1 ? .055 : .024),
    damping: profile(chain).front ? (depth === 1 ? .82 : .88) : (depth === 1 ? .90 : .95),
  })))

  function update(time, deltaTime, lookX, lookVelocity) {
    const dt = clamp(deltaTime / 16.67, .5, 2)
    for (let i = 0; i < pins.length; i += 1) {
      const pin = pins[i]
      // Root follows the already deformed shared surface without a local offset.
      if (!pin.depth) continue
      const parent = pins[i - 1]
      const depth = pin.depth === 1 ? .48 : 1
      const breeze = Math.sin(time * .00085 + pin.phase - pin.depth * .8) * .004
      const force = pin.front ? .65 : 1
      // Smoothly saturate the target before integration, so tips float back
      // rather than repeatedly hitting a hard displacement clamp.
      const desiredX = pin.maximum * Math.tanh((parent.dx * .42 + (lookX / 30 * .008 - lookVelocity / 2.4 * .018 + breeze) * depth * pin.gain * force) / pin.maximum)
      const desiredY = parent.dy * .35 + Math.sin(time * .00075 + pin.phase) * .0024 * depth * pin.gain * force
      pin.vx = (pin.vx + (desiredX - pin.dx) * pin.stiffness * dt) * Math.pow(pin.damping, dt)
      pin.vy = (pin.vy + (desiredY - pin.dy) * pin.stiffness * dt) * Math.pow(pin.damping, dt)
      const nextX = pin.dx + pin.vx * dt, nextY = pin.dy + pin.vy * dt
      pin.dx = clamp(nextX, -pin.maximum, pin.maximum)
      pin.dy = clamp(nextY, -pin.maximum * .4, pin.maximum * .4)
      if (pin.dx !== nextX) pin.vx *= .25
      if (pin.dy !== nextY) pin.vy *= .25
    }
  }

  function bind(rest, columns = 0) {
    const offsets = new Uint32Array(rest.length / 2 + 1)
    const indices = [], weights = []
    for (let vertex = 0; vertex < rest.length / 2; vertex += 1) {
      const x = rest[vertex * 2], y = rest[vertex * 2 + 1]
      const influences = []
      let sum = 0
      for (let chainIndex = 0; chainIndex < HAIR_CHAINS.length; chainIndex += 1) {
        const chain = HAIR_CHAINS[chainIndex]
        const { front, radius } = profile(chain)
        const clearance = front ? faceClearance(x, y) : 1
        if (!clearance) continue
        let midWeight = 0, tipWeight = 0, chainWeight = 0
        for (let segment = 0; segment < 2; segment += 1) {
          const [ax, ay] = chain.points[segment], [bx, by] = chain.points[segment + 1]
          // Distances use source pixels' aspect, not the normalized square.
          const sx = bx - ax, sy = (by - ay) * 1.5
          const t = clamp(((x - ax) * sx + (y - ay) * 1.5 * sy) / (sx * sx + sy * sy), 0, 1)
          const distance = Math.hypot(x - ax - sx * t, (y - ay) * 1.5 - sy * t)
          const progress = (segment + t) / 2
          const weight = (1 - smooth(.15, 1, distance / radius)) * smooth(.08, .38, progress) * clearance
          midWeight += weight * (segment === 0 ? t : 1 - t)
          tipWeight += segment === 1 ? weight * t : 0
          chainWeight += weight
        }
        if (!chainWeight) continue
        // Blend both segments instead of choosing a nearest segment. Switching
        // the nearest segment at curled locks caused abrupt weight jumps.
        const divisor = Math.max(1, chainWeight)
        influences.push([chainIndex * 3 + 1, midWeight / divisor])
        influences.push([chainIndex * 3 + 2, tipWeight / divisor])
        sum += Math.min(1, chainWeight)
      }
      for (const [index, weight] of influences) {
        if (!weight) continue
        indices.push(index)
        weights.push(weight / Math.max(1, sum))
      }
      offsets[vertex + 1] = indices.length
    }
    if (columns < 2) return { offsets, indices: new Uint16Array(indices), weights: new Float32Array(weights) }

    // Smooth the skinning weights once, on the actual connected grid. This
    // rounds sharp influence borders without damping the physical springs.
    const vertices = rest.length / 2, count = pins.length
    let dense = new Float32Array(vertices * count)
    for (let vertex = 0; vertex < vertices; vertex += 1) {
      for (let i = offsets[vertex]; i < offsets[vertex + 1]; i += 1) dense[vertex * count + indices[i]] += weights[i]
    }
    for (let pass = 0; pass < 3; pass += 1) {
      const next = new Float32Array(dense.length)
      for (let vertex = 0; vertex < vertices; vertex += 1) {
        const neighbors = [vertex % columns ? vertex - 1 : vertex, (vertex + 1) % columns ? vertex + 1 : vertex,
          vertex >= columns ? vertex - columns : vertex, vertex + columns < vertices ? vertex + columns : vertex]
        const clearance = faceClearance(rest[vertex * 2], rest[vertex * 2 + 1])
        for (let pin = 0; pin < count; pin += 1) {
          const index = vertex * count + pin
          // The small ahoge needs its narrow support to stay distinct.
          if (pin < 3) { next[index] = dense[index]; continue }
          let value = dense[index] * 4
          for (const neighbor of neighbors) value += dense[neighbor * count + pin]
          next[index] = value / 8 * (pins[pin].front ? clearance : 1)
        }
      }
      dense = next
    }
    indices.length = weights.length = 0
    offsets.fill(0)
    for (let vertex = 0; vertex < vertices; vertex += 1) {
      for (let pin = 0; pin < count; pin += 1) {
        const value = dense[vertex * count + pin]
        if (value < .00001) continue
        indices.push(pin)
        weights.push(value)
      }
      offsets[vertex + 1] = indices.length
    }
    return { offsets, indices: new Uint16Array(indices), weights: new Float32Array(weights) }
  }

  function displacement(binding, vertex) {
    let x = 0, y = 0
    for (let i = binding.offsets[vertex]; i < binding.offsets[vertex + 1]; i += 1) {
      const pin = pins[binding.indices[i]], weight = binding.weights[i]
      x += pin.dx * weight
      y += pin.dy * weight
    }
    return { x, y }
  }

  return { pins, chains: HAIR_CHAINS, update, bind, displacement }
}
