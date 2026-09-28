export const hairStyles = Object.freeze([
  { id: 'classic', name: '月兔雙馬尾', note: 'Momo 原本的長粉紅雙馬尾。', unlockedByDefault: true },
  { id: 'crescentPony', name: '月牙側馬尾', note: '高側馬尾與月牙髮夾。', condition: 'Stage 1 無 Miss' },
])

export const outfits = Object.freeze([
  { id: 'debut', name: '初登台服', note: '紅白粉金的月兔舞台服。', unlockedByDefault: true },
  { id: 'practice', name: '月光練習服', note: '薰衣草帽T與海軍藍百褶裙。', condition: 'Miss 後連續接住 5 拍' },
])

export const defaultAppearance = Object.freeze({ hairId: 'classic', outfitId: 'debut' })

export const wardrobeCardRequiredIds = Object.freeze(['crescentPony', 'practice'])

export function isWardrobeCardUnlocked(unlockedIds = []) {
  return wardrobeCardRequiredIds.every((id) => unlockedIds.includes(id))
}

function getAssetStem(hairId, outfitId) {
  if (hairId === 'classic' && outfitId === 'debut') return 'momo-moon-rabbit'
  if (hairId === 'crescentPony' && outfitId === 'practice') return 'momo-moon-rabbit-practice'
  return `momo-moon-rabbit-${hairId}-${outfitId}`
}

const danceFrameOffsets = Object.freeze({
  'classic:debut': Object.freeze([[0, 0], [0, 1.17], [0, 0], [0, 0], [0, 0], [0, 0], [0, 1.17], [0, 0]]),
  'classic:practice': Object.freeze([[0, 0], [-0.35, 0.26], [0, 2.08], [0.35, 1.04], [0, 0.78], [0, -0.26], [1.04, 0], [-0.35, 1.04]]),
  'crescentPony:debut': Object.freeze([[2.08, 2.34], [0, 1.04], [-2.78, -0.78], [1.04, 0], [-1.39, 0.26], [0.69, 1.04], [0.35, 1.04], [0, -1.04]]),
  'crescentPony:practice': Object.freeze([[-0.35, 0.26], [-2.78, -1.82], [-4.17, -1.82], [0.69, 0.26], [1.39, 0], [1.39, 0], [1.39, 0], [0, -0.78]]),
})

export function getDanceFrameSource(hairId, outfitId, frame) {
  const sequence = String(Math.min(8, Math.max(1, Math.floor(frame) + 1))).padStart(2, '0')
  return `/images/${getAssetStem(hairId, outfitId)}-dance-${sequence}.webp`
}

export function getDanceFrameOffset(hairId, outfitId, frame) {
  const sequence = danceFrameOffsets[`${hairId}:${outfitId}`] ?? danceFrameOffsets['classic:debut']
  const [x, y] = sequence[Math.min(7, Math.max(0, Math.floor(frame)))] ?? [0, 0]
  return { x, y }
}

export function getSadFrameSource(hairId, outfitId) {
  if (hairId === 'classic' && outfitId === 'debut') return '/images/momo-moon-rabbit-sad-v2.webp'
  return `/images/${getAssetStem(hairId, outfitId)}-sad.webp`
}

export function getCompletionRewards(result = {}) {
  if (!result.completed) return []
  const rewards = []
  if ((result.levelMisses?.[0] ?? 1) === 0) rewards.push('crescentPony')
  if (result.recoveredAfterMiss) rewards.push('practice')
  return rewards
}
