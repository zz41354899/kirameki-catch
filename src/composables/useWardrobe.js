import { ref, watch } from 'vue'
import { defaultAppearance, getCompletionRewards, hairStyles, outfits } from '../data/wardrobe'

const storageKey = 'kirameki-momo-wardrobe-v2'
const legacyStorageKey = 'kirameki-momo-wardrobe-v1'
const defaultUnlocked = [...hairStyles, ...outfits].filter((item) => item.unlockedByDefault).map((item) => item.id)
const validIds = new Set([...hairStyles, ...outfits].map((item) => item.id))

function readSavedWardrobe() {
  if (typeof window === 'undefined') {
    return { unlockedIds: defaultUnlocked, appearance: { ...defaultAppearance }, gameCompleted: false, completionCount: 0, bestScore: 0, lastResult: null }
  }
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || window.localStorage.getItem(legacyStorageKey) || '{}')
    const legacyLookId = saved.selectedLookId
    const hairId = hairStyles.some((item) => item.id === saved.appearance?.hairId) ? saved.appearance.hairId : legacyLookId === 'practice' ? 'crescentPony' : defaultAppearance.hairId
    const outfitId = outfits.some((item) => item.id === saved.appearance?.outfitId) ? saved.appearance.outfitId : legacyLookId === 'practice' ? 'practice' : defaultAppearance.outfitId
    return {
      unlockedIds: Array.isArray(saved.unlockedIds) ? [...new Set([...defaultUnlocked, ...saved.unlockedIds.filter((id) => validIds.has(id))])] : defaultUnlocked,
      appearance: { hairId, outfitId },
      gameCompleted: Boolean(saved.gameCompleted),
      completionCount: Number.isFinite(saved.completionCount) ? saved.completionCount : 0,
      bestScore: Number.isFinite(saved.bestScore) ? saved.bestScore : 0,
      lastResult: saved.lastResult && typeof saved.lastResult === 'object' ? saved.lastResult : null,
    }
  } catch {
    return { unlockedIds: defaultUnlocked, appearance: { ...defaultAppearance }, gameCompleted: false, completionCount: 0, bestScore: 0, lastResult: null }
  }
}

export function useWardrobe() {
  const saved = readSavedWardrobe()
  const unlockedIds = ref(saved.unlockedIds)
  const appearance = ref({
    hairId: unlockedIds.value.includes(saved.appearance.hairId) ? saved.appearance.hairId : defaultAppearance.hairId,
    outfitId: unlockedIds.value.includes(saved.appearance.outfitId) ? saved.appearance.outfitId : defaultAppearance.outfitId,
  })
  const gameCompleted = ref(saved.gameCompleted)
  const completionCount = ref(saved.completionCount)
  const bestScore = ref(saved.bestScore)
  const lastResult = ref(saved.lastResult)

  function setHair(hairId) {
    if (unlockedIds.value.includes(hairId)) appearance.value = { ...appearance.value, hairId }
  }

  function setOutfit(outfitId) {
    if (unlockedIds.value.includes(outfitId)) appearance.value = { ...appearance.value, outfitId }
  }

  function recordCompletion(result) {
    gameCompleted.value = true
    completionCount.value += 1
    bestScore.value = Math.max(bestScore.value, result.score || 0)
    lastResult.value = {
      completed: Boolean(result.completed),
      missCount: result.missCount || 0,
      levelMisses: Array.isArray(result.levelMisses) ? result.levelMisses : [],
      recoveredAfterMiss: Boolean(result.recoveredAfterMiss),
      score: result.score || 0,
    }
    const newIds = getCompletionRewards(result).filter((id) => !unlockedIds.value.includes(id))
    if (newIds.length) unlockedIds.value = [...unlockedIds.value, ...newIds]
    return newIds
  }

  watch([unlockedIds, appearance, gameCompleted, completionCount, bestScore, lastResult], () => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify({
      unlockedIds: unlockedIds.value,
      appearance: appearance.value,
      gameCompleted: gameCompleted.value,
      completionCount: completionCount.value,
      bestScore: bestScore.value,
      lastResult: lastResult.value,
    }))
  }, { deep: true })

  return { appearance, unlockedIds, gameCompleted, completionCount, bestScore, lastResult, setHair, setOutfit, recordCompletion }
}
