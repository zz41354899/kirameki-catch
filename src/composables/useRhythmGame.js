import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from './usePageExperience'
import {
  createRhythmNote,
  getRhythmLevelForNote,
  judgeRhythmNote,
  rhythmLevels,
  totalRhythmNotes,
} from '../rhythmGame'

export const danceLanes = [
  { key: 'A', label: '左拍' },
  { key: 'S', label: '拍手' },
  { key: 'D', label: '轉身' },
  { key: 'F', label: '揮手' },
]

const laneDanceFrames = [
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 0],
]

export function useRhythmGame({ enableSound, synthTone, onComplete }) {
  const gameActive = ref(false)
  const gamePaused = ref(false)
  const gameUnlocked = ref(false)
  const gameScore = ref(0)
  const gameCombo = ref(0)
  const gameStatus = ref('READY')
  const gameProgress = ref(0)
  const notes = ref([])
  const danceFrame = ref(0)
  const letterSending = ref(false)
  const currentLevelIndex = ref(0)
  const currentLevel = computed(() => rhythmLevels[currentLevelIndex.value])
  const isCrying = ref(false)
  const missCount = ref(0)
  const levelMisses = ref([0, 0, 0])
  const recoveryHits = ref(0)
  const recoveredAfterMiss = ref(false)
  const completedAllStages = ref(true)
  let spawnTimer
  let finishTimer
  let completionTimer
  let cryTimer
  let spawnRemaining = 0
  let finishRemaining = 0
  let pauseStartedAt = 0
  let spawnDueAt = 0
  let finishDueAt = 0
  let noteId = 0
  let spawnedNotes = 0
  let soundInitialized = false
  let lanePoseTurns = [0, 0, 0, 0]
  const noteTimers = new Map()

  function clearGameTimers() {
    clearTimeout(spawnTimer)
    clearTimeout(finishTimer)
    noteTimers.forEach((timer) => clearTimeout(timer))
    noteTimers.clear()
  }

  function showMissReaction() {
    gameCombo.value = 0
    gameStatus.value = 'MISS'
    missCount.value += 1
    levelMisses.value = levelMisses.value.map((count, index) => index === currentLevelIndex.value ? count + 1 : count)
    recoveryHits.value = 0
    isCrying.value = true
    clearTimeout(cryTimer)
    cryTimer = window.setTimeout(() => { isCrying.value = false }, 1100)
    synthTone(196, 0.16, 'sine', 0.035)
  }

  function removeNote(id, missed = false) {
    const exists = notes.value.some((note) => note.id === id)
    notes.value = notes.value.filter((note) => note.id !== id)
    noteTimers.delete(id)
    if (exists && missed && gameActive.value) {
      showMissReaction()
    }
  }

  function scheduleNoteMiss(note) {
    const remaining = Math.max(40, note.travelMs + 80 - (Date.now() - note.born))
    noteTimers.set(note.id, window.setTimeout(() => removeNote(note.id, true), remaining))
  }

  function spawnNote() {
    if (!gameActive.value || gamePaused.value) return
    const note = createRhythmNote(++noteId, spawnedNotes)
    currentLevelIndex.value = note.levelIndex
    notes.value.push(note)
    scheduleNoteMiss(note)
    return note
  }

  function finishGame(completed = true) {
    clearGameTimers()
    finishDueAt = 0
    gameActive.value = false
    gamePaused.value = false
    gameUnlocked.value = true
    gameProgress.value = 1
    isCrying.value = false
    completedAllStages.value = completed
    gameStatus.value = completed ? (gameScore.value >= 900 ? 'ENCORE!' : 'CLEAR!') : 'SEE YOU!'
    completionTimer = window.setTimeout(sendHeart, prefersReducedMotion() ? 50 : 650)
  }

  function endGameEarly() {
    if (!gameActive.value) return
    finishGame(false)
  }

  function scheduleFinish(delay) {
    finishRemaining = delay
    finishDueAt = Date.now() + delay
    finishTimer = window.setTimeout(finishGame, delay)
  }

  function scheduleNextSpawn(delayOverride) {
    clearTimeout(spawnTimer)
    if (spawnedNotes >= totalRhythmNotes) return
    const delay = delayOverride ?? getRhythmLevelForNote(spawnedNotes).level.intervalMs
    spawnRemaining = delay
    spawnDueAt = Date.now() + delay
    spawnTimer = window.setTimeout(() => {
      spawnDueAt = 0
      const note = spawnNote()
      spawnedNotes += 1
      gameProgress.value = Math.min(1, spawnedNotes / totalRhythmNotes)
      if (spawnedNotes >= totalRhythmNotes) {
        scheduleFinish((note?.travelMs ?? currentLevel.value.travelMs) + 140)
      } else {
        scheduleNextSpawn()
      }
    }, delay)
  }

  function startGame() {
    clearTimeout(completionTimer)
    clearGameTimers()
    notes.value = []
    gameScore.value = 0
    gameCombo.value = 0
    gameStatus.value = '月兔準備中'
    gameProgress.value = 0
    gameUnlocked.value = false
    letterSending.value = false
    isCrying.value = false
    missCount.value = 0
    levelMisses.value = [0, 0, 0]
    recoveryHits.value = 0
    recoveredAfterMiss.value = false
    completedAllStages.value = true
    currentLevelIndex.value = 0
    danceFrame.value = 0
    lanePoseTurns = [0, 0, 0, 0]
    spawnedNotes = 0
    spawnDueAt = 0
    finishDueAt = 0
    spawnRemaining = 0
    finishRemaining = 0
    gameActive.value = true
    gamePaused.value = false
    if (!soundInitialized) {
      enableSound()
      soundInitialized = true
    }
    gameStatus.value = 'PLAY!'
    spawnNote()
    spawnedNotes += 1
    gameProgress.value = 1 / totalRhythmNotes
    scheduleNextSpawn()
  }

  function togglePause() {
    if (!gameActive.value) return
    if (!gamePaused.value) {
      gamePaused.value = true
      pauseStartedAt = Date.now()
      gameStatus.value = 'PAUSE'
      clearTimeout(spawnTimer)
      clearTimeout(finishTimer)
      if (spawnDueAt) spawnRemaining = Math.max(40, spawnDueAt - Date.now())
      if (finishDueAt) finishRemaining = Math.max(40, finishDueAt - Date.now())
      noteTimers.forEach((timer) => clearTimeout(timer))
      noteTimers.clear()
      return
    }
    const pausedFor = Date.now() - pauseStartedAt
    notes.value.forEach((note) => { note.born += pausedFor; scheduleNoteMiss(note) })
    gamePaused.value = false
    gameStatus.value = 'PLAY!'
    if (spawnedNotes < totalRhythmNotes) scheduleNextSpawn(spawnRemaining)
    else {
      scheduleFinish(finishRemaining)
    }
  }

  function hitLane(lane) {
    if (!gameActive.value || gamePaused.value) return
    const candidates = notes.value.filter((note) => note.lane === lane)
    if (!candidates.length) {
      showMissReaction()
      return
    }
    const closest = candidates.reduce((best, note) => {
      const distance = judgeRhythmNote(note).distance
      return !best || distance < best.distance ? { note, distance } : best
    }, null)
    const judgment = closest ? judgeRhythmNote(closest.note) : null
    if (!closest || !judgment?.hittable) {
      showMissReaction()
      return
    }
    clearTimeout(noteTimers.get(closest.note.id))
    removeNote(closest.note.id)
    clearTimeout(cryTimer)
    isCrying.value = false
    const perfect = judgment.perfect
    gameScore.value += perfect ? 100 : 60
    gameCombo.value += 1
    if (missCount.value > 0 && !recoveredAfterMiss.value) {
      recoveryHits.value += 1
      if (recoveryHits.value >= 5) recoveredAfterMiss.value = true
    }
    gameStatus.value = perfect ? 'PERFECT!' : 'GOOD!'
    const poses = laneDanceFrames[lane]
    danceFrame.value = poses[lanePoseTurns[lane] % poses.length]
    lanePoseTurns[lane] += 1
    synthTone(perfect ? 1046.5 : 783.99, 0.12, 'triangle', 0.05)
    if (prefersReducedMotion()) return
    gsap.fromTo(`.lane-button:nth-child(${lane + 1})`, { scale: 0.9 }, { scale: 1, duration: 0.32, ease: 'back.out(2)' })
    gsap.fromTo('.game-dancer', { y: 8, rotation: lane % 2 ? 2 : -2 }, { y: 0, rotation: 0, duration: 0.4, ease: 'back.out(2)' })
  }

  function onKeydown(event) {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
    const lane = ['a', 's', 'd', 'f'].indexOf(event.key.toLowerCase())
    if (lane >= 0) {
      event.preventDefault()
      hitLane(lane)
    }
  }

  function sendHeart() {
    if (!gameUnlocked.value || letterSending.value) return
    letterSending.value = true
    nextTick(() => {
      const complete = () => onComplete({
        score: gameScore.value,
        completed: completedAllStages.value,
        missCount: missCount.value,
        levelMisses: levelMisses.value,
        recoveredAfterMiss: recoveredAfterMiss.value,
      })
      if (prefersReducedMotion()) {
        letterSending.value = false
        complete()
        return
      }
      gsap.timeline({ onComplete: complete })
        .fromTo('.rabbit-character', { y: 120, scale: 0.35, rotation: -10, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.72, ease: 'back.out(1.5)' })
        .to('.letter-flight', { opacity: 0, duration: 0.3, delay: 0.42 })
    })
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    startGame()
  })

  onBeforeUnmount(() => {
    clearTimeout(completionTimer)
    clearTimeout(cryTimer)
    clearGameTimers()
    window.removeEventListener('keydown', onKeydown)
  })

  return {
    gameActive,
    gamePaused,
    gameScore,
    gameCombo,
    gameStatus,
    gameProgress,
    notes,
    danceFrame,
    letterSending,
    currentLevel,
    currentLevelIndex,
    isCrying,
    missCount,
    startGame,
    endGameEarly,
    togglePause,
    hitLane,
  }
}
