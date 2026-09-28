export const RHYTHM_PULSE_MS = 220
export const rhythmLanes = Object.freeze([
  Object.freeze({ key: 'Q', syllable: 'DO', label: '左拍', frequency: 523.25 }),
  Object.freeze({ key: 'W', syllable: 'RE', label: '拍手', frequency: 587.33 }),
  Object.freeze({ key: 'E', syllable: 'MI', label: '轉身', frequency: 659.25 }),
  Object.freeze({ key: 'R', syllable: 'SOL', label: '揮手', frequency: 783.99 }),
])
export const rhythmKeys = Object.freeze(rhythmLanes.map((lane) => lane.key))

export const rhythmLevels = Object.freeze([
  {
    id: 1,
    name: '暖身拍',
    englishName: 'SOFT GLOW',
    speedLabel: '舒緩',
    density: '低密度',
    description: '舒展的月光引子，留下呼吸與句尾餘韻。',
    cue: '跟著長短拍，慢慢彈出第一句',
    intervalMs: RHYTHM_PULSE_MS * 4,
    travelMs: RHYTHM_PULSE_MS * 16,
    hitAtMs: RHYTHM_PULSE_MS * 13,
    hitWindowMs: 540,
    perfectWindowMs: 210,
    pattern: [0, 1, 2, 3, 2, 1, 0, 1],
    spacingPulses: [0, 4, 4, 6, 2, 4, 4, 8],
  },
  {
    id: 2,
    name: '交錯拍',
    englishName: 'STAR RUSH',
    speedLabel: '流動',
    density: '中密度',
    description: '主題旋律的回答句，音程起伏但仍保留留白。',
    cue: '聽前一音的餘韻，再接下一音',
    intervalMs: RHYTHM_PULSE_MS * 3,
    travelMs: RHYTHM_PULSE_MS * 15,
    hitAtMs: RHYTHM_PULSE_MS * 12,
    hitWindowMs: 510,
    perfectWindowMs: 195,
    pattern: [0, 2, 3, 2, 1, 0, 1, 2, 3, 2],
    spacingPulses: [0, 3, 3, 4, 2, 4, 3, 3, 4, 6],
  },
  {
    id: 3,
    name: '閃耀拍',
    englishName: 'LIGHT SPEED',
    speedLabel: '輕快',
    density: '高密度',
    description: '輕快的變奏回到主音，完成一段月光旋律。',
    cue: '最後的變奏，讓句尾回到月光裡',
    intervalMs: RHYTHM_PULSE_MS * 2,
    travelMs: RHYTHM_PULSE_MS * 14,
    hitAtMs: RHYTHM_PULSE_MS * 11,
    hitWindowMs: 480,
    perfectWindowMs: 185,
    pattern: [0, 1, 2, 3, 2, 1, 0, 2, 3, 2, 1, 0],
    spacingPulses: [0, 2, 2, 4, 2, 2, 4, 2, 4, 2, 2, 8],
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

export function getRhythmSpawnDelay(noteIndex) {
  const { level, noteInLevel } = getRhythmLevelForNote(noteIndex)
  return (level.spacingPulses[noteInLevel] || level.intervalMs / RHYTHM_PULSE_MS) * RHYTHM_PULSE_MS
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

export function getRhythmLaneForKey(key = '') {
  return rhythmKeys.indexOf(String(key).toUpperCase())
}
