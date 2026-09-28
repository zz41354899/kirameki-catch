import { onBeforeUnmount, ref } from 'vue'
import { RHYTHM_PULSE_MS } from '../rhythmGame'

const accompaniment = Object.freeze([
  { bass: 130.81, drone: 196, tones: [261.63, 293.66, 329.63, 392], response: 783.99 },
  { bass: 110, drone: 164.81, tones: [220, 261.63, 293.66, 329.63], response: 880 },
  { bass: 87.31, drone: 130.81, tones: [174.61, 196, 261.63, 293.66], response: 659.25 },
  { bass: 98, drone: 146.83, tones: [196, 220, 293.66, 329.63], response: 587.33 },
])
const arpeggioPattern = Object.freeze([0, 2, 1, 3])

export function useSoundtrack() {
  const soundOn = ref(false)
  let audioContext
  let musicLoop
  let musicStep = 0
  let musicEpoch = 0
  let musicPausedAt = 0

  function ensureAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)()
    if (audioContext.state === 'suspended') audioContext.resume()
  }

  function synthTone(frequency = 440, duration = 0.12, type = 'sine', volume = 0.04) {
    if (!soundOn.value) return
    ensureAudio()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(volume, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration)
    oscillator.connect(gain).connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + duration)
  }

  function synthPianoTone(frequency = 523.25, duration = 0.82, volume = 0.04) {
    if (!soundOn.value) return
    ensureAudio()
    const now = audioContext.currentTime
    const filter = audioContext.createBiquadFilter()
    const gain = audioContext.createGain()

    filter.type = 'lowpass'
    filter.frequency.value = 4200
    filter.Q.value = 0.55
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(volume * 0.42, now + 0.17)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    filter.connect(gain).connect(audioContext.destination)

    const partials = [
      { ratio: 1, type: 'triangle', level: 1 },
      { ratio: 2, type: 'sine', level: 0.24 },
      { ratio: 3, type: 'sine', level: 0.08 },
    ]
    partials.forEach(({ ratio, type, level }) => {
      const oscillator = audioContext.createOscillator()
      const partialGain = audioContext.createGain()
      oscillator.type = type
      oscillator.frequency.value = frequency * ratio
      partialGain.gain.value = level
      oscillator.connect(partialGain).connect(filter)
      oscillator.start(now)
      oscillator.stop(now + duration + 0.05)
    })
  }

  function playMusicStep() {
    const chord = accompaniment[Math.floor((musicStep % 32) / 8)]
    const pulseInBar = musicStep % 8
    if (pulseInBar === 0) {
      synthTone(chord.bass, 1.6, 'triangle', 0.014)
      synthTone(chord.drone, 1.45, 'sine', 0.006)
    }
    if (musicStep % 2 === 0) {
      const arpeggioIndex = arpeggioPattern[Math.floor(pulseInBar / 2)]
      synthTone(chord.tones[arpeggioIndex], 0.26, 'triangle', 0.007)
    }
    if (pulseInBar === 6 && Math.floor(musicStep / 8) % 2 === 1) synthPianoTone(chord.response, 0.72, 0.0065)
    synthTone(musicStep % 4 === 0 ? 2093 : 1760, 0.035, 'sine', musicStep % 2 === 0 ? 0.0028 : 0.0018)
  }

  function scheduleMusicStep() {
    const dueAt = musicEpoch + (musicStep + 1) * RHYTHM_PULSE_MS
    musicLoop = window.setTimeout(() => {
      musicStep += 1
      playMusicStep()
      scheduleMusicStep()
    }, Math.max(0, dueAt - performance.now()))
  }

  function startMusic() {
    ensureAudio()
    clearTimeout(musicLoop)
    musicStep = 0
    musicEpoch = performance.now()
    musicPausedAt = 0
    playMusicStep()
    scheduleMusicStep()
  }

  function restartMusic() {
    if (soundOn.value) startMusic()
  }

  function pauseMusic() {
    if (!soundOn.value || musicPausedAt) return
    musicPausedAt = performance.now()
    clearTimeout(musicLoop)
  }

  function resumeMusic() {
    if (!soundOn.value || !musicPausedAt) return
    musicEpoch += performance.now() - musicPausedAt
    musicPausedAt = 0
    scheduleMusicStep()
  }

  function enableSound() {
    if (soundOn.value) return
    soundOn.value = true
    startMusic()
  }

  function toggleSound() {
    if (soundOn.value) {
      soundOn.value = false
      clearTimeout(musicLoop)
      musicPausedAt = 0
      return
    }
    enableSound()
    synthPianoTone(783.99, 0.62, 0.022)
  }

  onBeforeUnmount(() => {
    clearTimeout(musicLoop)
    audioContext?.close()
  })

  return { soundOn, synthTone, synthPianoTone, enableSound, toggleSound, restartMusic, pauseMusic, resumeMusic }
}
