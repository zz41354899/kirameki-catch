// Overscan is outside the original artwork; the shader mapping and CSS extent
// cancel exactly, so the character keeps its original size and hit targets.
export const MOMO_CANVAS_PADDING = .12
export const toMomoCanvas = (value) => (value + MOMO_CANVAS_PADDING) / (1 + 2 * MOMO_CANVAS_PADDING)

export function momoBufferSize(width, height, density = 1) {
  const ratio = Math.max(1, Math.min(1.35, density || 1))
  return { width: Math.max(2, Math.round(width * ratio)), height: Math.max(3, Math.round(height * ratio)) }
}
