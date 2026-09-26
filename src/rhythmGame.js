export const rhythmLevels = Object.freeze([
  {
    id: 1,
    name: '暖身拍',
    englishName: 'SOFT GLOW',
    speedLabel: '舒緩',
    density: '低密度',
    description: '節拍寬鬆，適合第一次和モモ一起跳。',
    cue: '先看準黃線，慢慢按就好',
    intervalMs: 1120,
    travelMs: 3200,
    hitAtMs: 2600,
    hitWindowMs: 540,
    perfectWindowMs: 210,
    pattern: [0, 1, 2, 3, 1, 2, 0, 3],
  },
  {
    id: 2,
    name: '交錯拍',
    englishName: 'STAR RUSH',
    speedLabel: '流暢',
    density: '中密度',
    description: '左右交錯加速，開始感受舞台的推進感。',
    cue: '左右交錯，跟著心跳走',
    intervalMs: 980,
    travelMs: 3000,
    hitAtMs: 2440,
    hitWindowMs: 510,
    perfectWindowMs: 195,
    pattern: [0, 2, 1, 3, 0, 1, 3, 2, 0, 3],
  },
  {
    id: 3,
    name: '閃耀拍',
    englishName: 'LIGHT SPEED',
    speedLabel: '光速',
    density: '高密度',
    description: '最短判定窗口與最快節拍，挑戰完整連擊。',
    cue: '最後一小段，穩穩完成！',
    intervalMs: 880,
    travelMs: 2800,
    hitAtMs: 2280,
    hitWindowMs: 480,
    perfectWindowMs: 185,
    pattern: [0, 1, 0, 2, 3, 2, 1, 3, 0, 2, 1, 0],
  },
])

export const totalRhythmNotes = rhythmLevels.reduce((total, level) => total + level.pattern.length, 0)

export function getRhythmLevelForNote(noteIndex) {
  const safeIndex = Math.max(0, Math.min(totalRhythmNotes - 1, Math.floor(noteIndex)))
  let start = 0

  for (let levelIndex = 0; levelIndex < rhythmLevels.length; levelIndex += 1) {
    const level = rhythmLevels[levelIndex]
    const end = start + level.pattern.length
    if (safeIndex < end) {
      return { level, levelIndex, noteInLevel: safeIndex - start }
    }
    start = end
  }

  return { level: rhythmLevels.at(-1), levelIndex: rhythmLevels.length - 1, noteInLevel: 0 }
}

export function createRhythmNote(id, noteIndex, born = Date.now(), selectedLevelIndex = null) {
  const selectedLevel = selectedLevelIndex === null
    ? getRhythmLevelForNote(noteIndex)
    : {
        level: rhythmLevels[Math.max(0, Math.min(rhythmLevels.length - 1, selectedLevelIndex))],
        levelIndex: Math.max(0, Math.min(rhythmLevels.length - 1, selectedLevelIndex)),
        noteInLevel: noteIndex % rhythmLevels[Math.max(0, Math.min(rhythmLevels.length - 1, selectedLevelIndex))].pattern.length,
      }
  const { level, levelIndex, noteInLevel } = selectedLevel
  return {
    id,
    born,
    levelIndex,
    lane: level.pattern[noteInLevel],
    travelMs: level.travelMs,
    hitAtMs: level.hitAtMs,
    hitWindowMs: level.hitWindowMs,
    perfectWindowMs: level.perfectWindowMs,
  }
}

export function judgeRhythmNote(note, now = Date.now()) {
  const distance = Math.abs(now - note.born - note.hitAtMs)
  return {
    distance,
    hittable: distance <= note.hitWindowMs,
    perfect: distance <= note.perfectWindowMs,
  }
}
