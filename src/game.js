export const ROUND_SECONDS = 30
export const difficulties = {
  normal: { label: 'ふつう', interval: 0.58, speed: 24, cloudChance: 0.2 },
  hard: { label: 'むずかしい', interval: 0.39, speed: 34, cloudChance: 0.3 },
}
export function makeItem(id, mode, random = Math.random) {
  const p = random()
  return { id, type: p < difficulties[mode].cloudChance ? 'cloud' : p > 0.72 ? 'star' : 'candy', x: 7 + random() * 86, y: -8, rotation: random() * 50 - 25 }
}
export function resolveCatch(score, combo, type) {
  if (type === 'cloud') return { score: Math.max(0, score - 30), combo: 0, delta: -30 }
  const nextCombo = combo + 1
  const multiplier = Math.min(4, 1 + Math.floor(nextCombo / 5))
  const delta = (type === 'star' ? 30 : 10) * multiplier
  return { score: score + delta, combo: nextCombo, delta }
}
export function isCaught(item, player, previousY) {
  return previousY < 82 && item.y >= 82 && Math.abs(item.x - player) < 10
}
