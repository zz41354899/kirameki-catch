<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MomoSprite from './MomoSprite.vue'
import { poses, FRAME_COUNT, frameAtTime } from '../data/choreography'
const props = defineProps({ calm: Boolean })

gsap.registerPlugin(ScrollTrigger)
const stage = ref(null)
const time = ref(0)
const playing = ref(false)
const speed = ref('1')
const reduced = ref(false)
const editing = ref(false)
const captions = ref(poses.map(p => p.caption))
const frame = computed(() => frameAtTime(time.value))
const pose = computed(() => poses[frame.value])
let timeline, media, observer, scroll
let mounted = false

function pause() {
  timeline?.pause()
  playing.value = false
}

function seek(index) {
  pause()
  const nextFrame = Math.min(FRAME_COUNT - 1, Math.max(0, Number(index) || 0))
  // Choosing a frame shows its settled pose. Scroll and play traverse the
  // entrance; every mode controls this same timeline.
  const nextTime = nextFrame + (reduced.value ? 0 : 0.56)
  timeline?.time(nextTime, false)
  time.value = nextTime
}

function selectPose(index) {
  const nextFrame = Math.min(FRAME_COUNT - 1, Math.max(0, Number(index) || 0))
  const progress = (nextFrame + 0.56) / FRAME_COUNT
  if (scroll) {
    window.scrollTo({ top: scroll.start + progress * (scroll.end - scroll.start), behavior: 'instant' })
    ScrollTrigger.update()
  } else {
    stage.value?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }
  seek(nextFrame)
}

function step(delta) { seek((frame.value + delta + FRAME_COUNT) % FRAME_COUNT) }
function play() {
  if (!timeline) return
  if (playing.value) { pause(); return }
  if (time.value >= FRAME_COUNT - 0.001) timeline.time(0, false)
  playing.value = true
  timeline.timeScale(Number(speed.value)).play()
}
function changeSpeed() { timeline?.timeScale(Number(speed.value)) }
function hidePause() { if (document.hidden) pause() }
function beginEditing() { pause(); editing.value = true }

defineExpose({ selectPose, seek, pause })

onMounted(() => {
  mounted = true
  media = gsap.matchMedia(stage.value)
  media.add({ always: '(min-width: 0px)', reduceMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
    const savedTime = time.value
    reduced.value = context.conditions.reduceMotion || props.calm
    playing.value = false
    const clock = { time: 0 }
    const activeTimeline = gsap.timeline({
      paused: true,
      onUpdate: () => { time.value = clock.time },
      onComplete: () => { playing.value = false },
    })
    timeline = activeTimeline
    activeTimeline.to(clock, { time: FRAME_COUNT, duration: FRAME_COUNT, ease: 'none' }, 0)

    if (!reduced.value) {
      for (let i = 0; i < FRAME_COUNT; i++) {
        activeTimeline.addLabel(`pose-${i}`, i)
          .fromTo(`[data-shout="${i}"] .shout-character`,
            { yPercent: 32, scale: 0.82, rotation: (index) => index % 2 ? 9 : -9 },
            { yPercent: 0, scale: 1, rotation: 0, duration: 0.36, stagger: { each: 0.045, from: 'center' }, ease: 'back.out(1.6)', immediateRender: false }, i)
          .fromTo('.sprite-performer', { y: 0 },
            { y: i === 6 ? -30 : -10, duration: 0.24, repeat: 1, yoyo: true, ease: 'sine.out', immediateRender: false }, i)
          .fromTo('.stage-symbol', { scale: 0.8, rotation: -8 },
            { scale: 1, rotation: 10, duration: 0.44, ease: 'back.out(1.7)', immediateRender: false }, i)
          .fromTo('.stage-subtitle', { y: 8 },
            { y: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, i)
      }

      // A refresh must not steal control from manual playback or the editor.
      // Only a scroll-position change takes over the shared timeline.
      let lastScroll = window.scrollY
      if (window.matchMedia('(min-width: 900px) and (min-height: 720px)').matches) scroll = ScrollTrigger.create({
        trigger: stage.value,
        start: 'top top',
        end: () => `+=${Math.max(1400, window.innerHeight * 2)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => { lastScroll = window.scrollY },
        onUpdate: self => {
          const scrollPosition = self.scroll()
          const moved = Math.abs(scrollPosition - lastScroll) > 0.5
          lastScroll = scrollPosition
          if (!moved || ScrollTrigger.isRefreshing || editing.value) return
          pause()
          activeTimeline.time(self.progress * FRAME_COUNT, false)
        },
      })
    }

    activeTimeline.timeScale(Number(speed.value)).time(savedTime, false).pause()
    return () => {
      // matchMedia reverts the entire timeline and pin before rebuilding.
      // Vue's time ref survives cleanup, preserving the selected pose.
      playing.value = false
      if (timeline === activeTimeline) timeline = null
      scroll = null
    }
  })

  observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause() }, { threshold: 0 })
  observer.observe(stage.value)
  document.addEventListener('visibilitychange', hidePause)
  document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh() })
})

onBeforeUnmount(() => {
  mounted = false
  observer?.disconnect()
  document.removeEventListener('visibilitychange', hidePause)
  media?.revert()
})
</script>

<template>
  <section ref="stage" id="stage" class="performance" aria-labelledby="performance-title">
    <div class="performance-top">
      <h2 id="performance-title"><span class="status-dot"></span> モモ的心動舞台 <small>LIVE STAGE</small></h2>
      <span>{{ reduced ? '點選動作，和モモ一起比心' : '捲動或按播放，一起閃閃發光 ↓' }}</span>
      <span class="stage-counter">第 <b>{{ String(frame + 1).padStart(2, '0') }}</b> 拍 / 08</span>
    </div>
    <div class="performance-scene" :data-pose="frame">
      <div class="stage-rays" aria-hidden="true"></div>
      <div class="stage-ring" aria-hidden="true"></div>
      <p class="stage-side" aria-hidden="true">{{ pose.side }}<span>!!</span></p>
      <div class="live-caption">
        <span>{{ pose.accent }}</span>
        <p v-for="(p, i) in poses" v-show="frame === i" :key="p.name" class="stage-shout" :data-shout="i" :aria-label="p.shout">
          <span v-for="(character, characterIndex) in [...p.shout]" :key="characterIndex" class="shout-character" aria-hidden="true">{{ character }}</span>
        </p>
        <small class="stage-japanese" lang="ja">{{ pose.japanese }}</small>
      </div>
      <div class="sprite-performer"><MomoSprite :frame="frame" :label="`星乃モモ：${pose.name}動作`"/></div>
      <span class="stage-symbol" aria-hidden="true">{{ pose.symbol }}</span>
      <button class="stage-seal stage-heart-button" @click="seek(4)" aria-label="送モモ一顆心，切換比心動作">心動<small>點我比心</small><span aria-hidden="true">♡</span></button>
      <p class="stage-subtitle">{{ captions[frame] || '這一拍，等你開口♡' }}</p>
      <span class="scene-corner" aria-hidden="true">你的文字，正在發光<br>HOSHINO MOMO / 22</span>
    </div>
    <div class="stage-controls">
      <div class="transport">
        <button class="round-control" @click="step(-1)" aria-label="上一幀">←</button>
        <button class="transport-play" @click="play" :aria-pressed="playing">{{ playing ? 'Ⅱ 暫停' : '▶ 播放' }}</button>
        <button class="round-control" @click="step(1)" aria-label="下一幀">→</button>
        <label class="speed-label"><span class="sr-only">播放速度</span><select v-model="speed" @change="changeSpeed"><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option></select></label>
      </div>
      <div class="scrubber"><label for="frame-seek">選一個心動瞬間 <b>{{ String(frame + 1).padStart(2, '0') }} / 08</b></label><input id="frame-seek" type="range" min="0" max="7" step="1" :value="frame" @input="seek($event.target.value)" :aria-valuetext="`${frame + 1}，${pose.name}`"></div>
      <label class="caption-editor">這一拍，想說什麼？<input v-model="captions[frame]" maxlength="28" placeholder="輸入你的應援文字" @focus="beginEditing" @blur="editing = false" /></label>
    </div>
    <div class="frame-tabs" aria-label="選擇動作關鍵幀"><button v-for="(p, i) in poses" :key="p.name" :class="{ active: frame === i }" :aria-pressed="frame === i" @click="seek(i)"><span>0{{ i + 1 }}</span>{{ p.name }}<i></i></button></div>
  </section>
</template>
