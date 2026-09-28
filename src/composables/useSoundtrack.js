import { onBeforeUnmount, ref } from 'vue'

export function useSoundtrack() {
  const soundOn = ref(false)
  let audioContext
  let musicLoop
  let musicStep = 0

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

  function startMusic() {
    ensureAudio()
    clearInterval(musicLoop)
    musicStep = 0
    const melody = [659.25, 783.99, 880, 783.99, 659.25, 587.33, 659.25, 783.99, 1046.5, 880, 783.99, 659.25, 587.33, 659.25, 783.99, 587.33]
    const bass = [196, 196, 220, 220, 174.61, 174.61, 196, 196]
    musicLoop = window.setInterval(() => {
      const note = melody[musicStep % melody.length]
      synthTone(note, 0.32, 'sine', 0.018)
      synthTone(note * 2, 0.11, 'triangle', 0.007)
      if (musicStep % 4 === 0) synthTone(bass[Math.floor(musicStep / 2) % bass.length], 0.42, 'triangle', 0.014)
      if (musicStep % 2 === 1) synthTone(1567.98, 0.055, 'sine', 0.004)
      musicStep += 1
    }, 360)
  }

  function enableSound() {
    if (soundOn.value) return
    soundOn.value = true
    startMusic()
  }

  function toggleSound() {
    if (soundOn.value) {
      soundOn.value = false
      clearInterval(musicLoop)
      return
    }
    enableSound()
    synthTone(783.99, 0.22, 'triangle', 0.05)
  }

  onBeforeUnmount(() => {
    clearInterval(musicLoop)
    audioContext?.close()
  })

  return { soundOn, synthTone, enableSound, toggleSound }
}
