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
    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 1046.5]
    musicLoop = window.setInterval(() => {
      synthTone(melody[musicStep % melody.length], 0.16, 'triangle', 0.025)
      if (musicStep % 2 === 0) synthTone(130.81, 0.09, 'sine', 0.018)
      musicStep += 1
    }, 320)
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
