<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import gsap from 'gsap'
import Icon from './Icon.vue'
import MomoDancer from './MomoDancer.vue'
import { ROUND_SECONDS, difficulties, makeItem, resolveCatch, isCaught } from '../game'
const props = defineProps({ mode: String, sound: Boolean, best: Number })
const emit = defineEmits(['close', 'finish', 'toggle-sound'])
const modal = ref(null), board = ref(null)
const state = ref('ready'), countdown = ref(3), time = ref(ROUND_SECONDS), score = ref(0), combo = ref(0), maxCombo = ref(0), player = ref(50), items = ref([]), feedback = ref(''), feedbackBad = ref(false)
const newRecord = ref(false)
const cheer = ref(''), cheerId = ref(0)
const dancerPose = computed(() => feedbackBad.value && feedback.value ? 'oops' : feedback.value ? 'catch' : 'idle')
const multiplier = computed(() => Math.min(4, 1+Math.floor(combo.value/5)))
const rank = computed(() => score.value >= 1500 ? 'S' : score.value >= 800 ? 'A' : score.value >= 350 ? 'B' : 'C')
let frame, previous = 0, spawnTime = 0, countTime = 0, id = 0, feedbackTimer, soundTimer, cheerTimer, audio, nextBeat = 0
const held = new Set()
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
function tone(freq = 660, duration = 0.09, volume = 0.035) {
  if(!props.sound) return
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)()
    if(audio.state === 'suspended') audio.resume().catch(() => {})
    const oscillator = audio.createOscillator(), gain = audio.createGain()
    oscillator.type = 'sine'; oscillator.frequency.value = freq
    gain.gain.setValueAtTime(volume, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime+duration)
    oscillator.connect(gain); gain.connect(audio.destination)
    oscillator.start(); oscillator.stop(audio.currentTime+duration)
  } catch {}
}
function start() {
  score.value = 0; combo.value = 0; maxCombo.value = 0; player.value = 50; time.value = ROUND_SECONDS
  items.value = []; countdown.value = 3; countTime = 0; spawnTime = 0; nextBeat = 0; previous = 0; id = 0
  feedback.value = ''; cheer.value = ''; clearTimeout(cheerTimer); newRecord.value = false; held.clear(); state.value = 'countdown'
  tone(523, 0.13)
  board.value?.focus()
}
function finish() {
  state.value = 'result'; newRecord.value = score.value > props.best; items.value = []; held.clear()
  emit('finish', { score: score.value, combo: maxCombo.value, mode: props.mode })
  tone(784, 0.2)
  soundTimer = setTimeout(() => tone(1047,0.4), 130)
}
function pause() { if(state.value === 'playing') { state.value = 'paused'; held.clear() } }
function resume() { state.value = 'playing'; previous = 0; board.value?.focus() }
function setPlayer(event) {
  if(state.value !== 'playing') return
  const rect = board.value.getBoundingClientRect()
  player.value = Math.max(7, Math.min(93, (event.clientX-rect.left)/rect.width*100))
}
function down(event) { if(state.value === 'playing') { board.value.setPointerCapture(event.pointerId); setPlayer(event) } }
function keydown(e) {
  if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key) && state.value === 'playing') { e.preventDefault(); const key = e.key.toLowerCase(); if(!held.has(key)) player.value = Math.max(7, Math.min(93, player.value + (['arrowright','d'].includes(key) ? 2.5 : -2.5))); held.add(key) }
  if(e.code === 'Space' && e.target === board.value) { e.preventDefault(); if(state.value === 'playing') pause(); else if(state.value === 'paused') resume() }
}
function keyup(e) { held.delete(e.key.toLowerCase()) }
function catchItem(item) {
  const next = resolveCatch(score.value, combo.value, item.type)
  score.value = next.score; combo.value = next.combo; maxCombo.value = Math.max(maxCombo.value, combo.value)
  feedbackBad.value = item.type === 'cloud'
  feedback.value = item.type === 'cloud' ? 'むぅっ！ −30' : `きゅん♡ +${next.delta}`
  if (combo.value > 0 && combo.value % 5 === 0) {
    cheer.value = combo.value >= 15 ? 'かわいさ、限界突破!!' : combo.value >= 10 ? 'きゅんきゅんっ♡' : 'かわいい、大正解！'
    cheerId.value++; clearTimeout(cheerTimer); cheerTimer = setTimeout(() => { cheer.value = '' }, 1100)
  }
  clearTimeout(feedbackTimer); feedbackTimer = setTimeout(() => { feedback.value = '' }, 650)
  if(item.type === 'cloud') tone(160, 0.16)
  else tone(item.type === 'star' ? 1047 : 784, 0.12)
  if(!reduced) gsap.fromTo(board.value.querySelector('.catcher'), { scale: item.type === 'cloud' ? 0.88 : 1.14 }, { scale: 1, duration: 0.24, overwrite:true })
}
function tick(now) {
  const dt = previous ? Math.min((now-previous)/1000, 0.05) : 0
  previous = now
  if(state.value === 'countdown') {
    countTime += dt
    if(countTime >= 1) { countTime -= 1; countdown.value--; if(countdown.value <= 0) { state.value = 'playing'; tone(1047,0.15) } else tone(523,0.1) }
  }
  if(state.value === 'playing') {
    time.value = Math.max(0, time.value-dt)
    if(time.value <= 0) finish()
    else {
      const dir = Number(held.has('arrowright') || held.has('d')) - Number(held.has('arrowleft') || held.has('a'))
      player.value = Math.max(7, Math.min(93, player.value + dir*78*dt))
      spawnTime += dt; nextBeat += dt
      if(nextBeat >= 0.42) { nextBeat -= 0.42; const melody = [523,659,784,659,587,698,880,698]; tone(melody[Math.floor((ROUND_SECONDS-time.value)/0.42)%melody.length],0.09,0.012) }
      const config = difficulties[props.mode]
      if(spawnTime >= config.interval) { spawnTime -= config.interval; items.value.push(makeItem(id++, props.mode)) }
      items.value = items.value.filter(item => {
        const prev = item.y; item.y += (config.speed + (ROUND_SECONDS-time.value)*0.2)*dt
        if(isCaught(item, player.value, prev)) { catchItem(item); return false }
        if(item.y > 106) { if(item.type !== 'cloud') combo.value = 0; return false }
        return true
      })
    }
  }
  frame = requestAnimationFrame(tick)
}
function visibility() { if(document.hidden) { pause(); if(state.value === 'countdown') { state.value = 'ready'; held.clear() } } }
function escape() { if(state.value === 'playing') pause(); else if(state.value !== 'countdown') emit('close'); else state.value = 'ready' }
watch(() => props.sound, on => { if(on) tone(660) })
onMounted(() => {
  modal.value.showModal()
  frame = requestAnimationFrame(tick)
  window.addEventListener('keydown',keydown); window.addEventListener('keyup',keyup)
  window.addEventListener('blur', pause); document.addEventListener('visibilitychange',visibility)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame); clearTimeout(feedbackTimer); clearTimeout(soundTimer); clearTimeout(cheerTimer); gsap.killTweensOf(board.value?.querySelector('.catcher')); audio?.close().catch(() => {})
  window.removeEventListener('keydown',keydown); window.removeEventListener('keyup',keyup)
  window.removeEventListener('blur',pause); document.removeEventListener('visibilitychange',visibility)
})
</script>
<template>
  <dialog ref="modal" class="game-dialog" :class="{ 'game-is-playing': state === 'playing' }" @cancel.prevent="escape" aria-labelledby="game-title">
    <div class="game-header"><h2 id="game-title"><span class="game-live-dot"></span>きらめき♡ LIVE!</h2><div class="flex items-center gap-2"><button class="icon-button" :aria-label="sound ? '音をオフにする' : '音をオンにする'" @click="emit('toggle-sound')"><Icon :name="sound ? 'sound' : 'mute'"/></button><button v-if="state === 'playing'" class="icon-button pause-button" aria-label="一時停止" @click="pause">Ⅱ</button><button class="icon-button" aria-label="ゲームを閉じる" @click="emit('close')">×</button></div></div>
    <div class="game-stats"><div><span>SCORE</span><b>{{ String(score).padStart(5,'0') }}</b></div><div class="combo-stat"><span>COMBO <strong>×{{ multiplier }}</strong></span><b>{{ combo }} <small>♡</small></b></div><div :class="{ urgent: time < 10 }"><span>TIME LEFT</span><b>{{ Math.ceil(time) }}<small>sec</small></b></div></div>
    <div class="time-track"><span :style="{ width: (time/ROUND_SECONDS*100)+'%' }"></span></div>
    <div ref="board" class="game-board" tabindex="0" aria-label="ゲームエリア。左右の矢印キーで移動、スペースキーで一時停止。" @pointerdown="down" @pointermove="setPlayer">
      <div class="game-bg-type" aria-hidden="true">きゅんっ<br><span>ときめけ!!</span></div><span class="game-spark s1" aria-hidden="true">✧</span><span class="game-spark s2" aria-hidden="true">✧</span>
      <div v-for="item in items" :key="item.id" class="falling-item" :class="item.type" :style="{ left: item.x+'%', top: item.y+'%', transform: `translate(-50%,-50%) rotate(${item.rotation}deg)` }"><Icon :name="item.type"/></div>
      <div class="catch-line" aria-hidden="true"></div><div class="catcher" :style="{ left: player+'%' }" aria-hidden="true"><MomoDancer class="game-momo" :pose="dancerPose"/><div class="basket"><span>• ᴗ •</span><Icon name="bow"/></div></div>
      <div v-if="cheer" :key="cheerId" class="combo-cheer" aria-hidden="true"><small>{{ combo }} COMBO! ×{{ multiplier }}</small>{{ cheer }}<span>✦ ♡ ✦</span></div>
      <div class="stage-floor" aria-hidden="true"></div>
      <div v-if="feedback" class="catch-feedback" :class="{ bad:feedbackBad }" :style="{ left: Math.max(18,Math.min(82,player))+'%' }">{{ feedback }}</div>
      <div v-if="state === 'ready'" class="game-overlay"><div class="overlay-card"><span class="mini-label">{{ difficulties[mode].label }} · 30 SECONDS</span><MomoDancer class="ready-momo" pose="catch"/><h3>開演っ！<br>準備はいい？</h3><p>← → キー、または指をスライド。<br>モモといっしょに、きゅんをキャッチ！</p><div class="points-legend"><span><Icon name="candy"/> +10</span><span><Icon name="star"/> +30</span><span><Icon name="cloud"/> −30</span></div><button class="play-button" @click="start">スタート！ <span>▶</span></button></div></div>
      <div v-else-if="state === 'countdown'" class="game-overlay countdown-overlay" role="status"><b :key="countdown">{{ countdown }}</b><span>せーのっ！</span></div>
      <div v-else-if="state === 'paused'" class="game-overlay"><div class="overlay-card"><p class="section-label">TAKE A LITTLE BREAK</p><h3>ひとやすみ ♡</h3><p>きらめきは、待っててくれる。</p><button class="play-button" @click="resume">つづける <span>▶</span></button><button class="text-link" @click="start">はじめから</button></div></div>
      <div v-else-if="state === 'result'" class="game-overlay"><div class="overlay-card result-card" role="status"><span class="mini-label">{{ newRecord ? '✦ NEW PERSONAL BEST ✦' : 'NICE CATCH! ♡' }}</span><div class="rank-stamp">{{ rank }}<small>RANK</small></div><h3>かわいい、大優勝！</h3><b class="result-score">{{ score }}<small>pt</small></b><p>最大コンボ {{ maxCombo }} ♡ · {{ difficulties[mode].label }}</p><button class="play-button" @click="start">もういちど！ <span>↻</span></button><button class="text-link" @click="emit('close')">ホームにもどる ↗</button></div></div>
    </div>
    <div class="game-controls"><span>← → / A D で移動</span><span>SPACE：一時停止</span><span>✧ スライドでもOK</span></div>
  </dialog>
</template>
