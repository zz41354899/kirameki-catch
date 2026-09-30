// A slow whole-character sway, shared by every vertex. Local hair/accessory
// springs receive its velocity so they trail the body instead of moving rigidly.
export function sampleMomoSway(elapsed) {
  const phase = elapsed * (Math.PI * 2 / 7200)
  const ramp = Math.min(1, Math.max(0, elapsed / 1200))
  const envelope = ramp * ramp * (3 - 2 * ramp)
  const rotation = (Math.sin(phase) * .038 + Math.sin(phase * .47) * .006) * envelope
  return {
    rotation,
    sin: Math.sin(rotation), cos: Math.cos(rotation),
    x: Math.sin(phase * .83) * .010 * envelope,
    y: Math.sin(phase * .71) * .009 * envelope,
    // Feed the changing body direction into the existing secondary springs.
    followVelocity: (Math.cos(phase) * .82 + Math.cos(phase * .47) * .07) * envelope,
  }
}

export function applyMomoSway(x, y, sway) {
  const px = x - .51, py = (y - .83) * 1.5
  return {
    x: .51 + px * sway.cos - py * sway.sin + sway.x,
    y: .83 + (px * sway.sin + py * sway.cos) / 1.5 + sway.y,
  }
}
