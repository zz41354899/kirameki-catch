<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { scrollToSection } from '../composables/useSectionNavigation'
import MomoPuppet from './MomoPuppet.vue'
import { createMomoGesture } from '../lib/momoGesture.js'

const reactions = {
  default: {
    image: '/images/momo-moon-rabbit-hero-v2.webp',
    alt: '身穿月兔舞台裝的星乃モモ',
    message: '輕點モモ，看看月兔的反應。',
  },
  happy: {
    image: '/images/momo-moon-rabbit-hero-happy-v2.webp',
    alt: '開心微笑的月兔モモ',
    message: '摸摸頭，モモ好開心！',
  },
  angry: {
    image: '/images/momo-moon-rabbit-hero-angry-v2.webp',
    alt: '氣噗噗的月兔モモ',
    message: '這裡不可以亂碰啦！',
  },
  confused: {
    image: '/images/momo-moon-rabbit-hero-confused-v2.webp',
    alt: '疑惑地看著鞋子的月兔モモ',
    message: '咦？是在看モモ的鞋子嗎？',
  },
  startled: {
    image: '/images/momo-moon-rabbit-hero-startled-v2.webp',
    alt: '被嚇一跳的月兔モモ',
    message: '呀！突然嚇到モモ了。',
  },
}

const activeReaction = ref('default')
const reactionToken = ref(0)
const playedReactionToken = ref(-1)
const baseArt = ref(null)
const puppetRig = ref(null)
const reactionArt = ref(null)
const rigReady = ref(false)
const reaction = computed(() => reactions[activeReaction.value])
let resetReactionTimer
let reactionTimeline
let rigContext
const gesture = createMomoGesture()

function motionIsReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function playReactionMotion() {
  if (!baseArt.value || !reactionArt.value || playedReactionToken.value === reactionToken.value || motionIsReduced()) return

  playedReactionToken.value = reactionToken.value
  reactionTimeline?.kill()
  gsap.killTweensOf([baseArt.value, reactionArt.value])
  gsap.set(baseArt.value, { autoAlpha: 0 })

  const art = reactionArt.value
  const motion = gsap.timeline()

  if (activeReaction.value === 'happy') {
    motion
      .fromTo(art, { autoAlpha: 0, y: 24, scale: 0.82, rotation: -4 }, { autoAlpha: 1, y: -18, scale: 1.05, rotation: 2, duration: 0.22, ease: 'power3.out' })
      .to(art, { y: 0, scale: 1, rotation: 0, duration: 0.23, ease: 'bounce.out' })
      .to(art, { y: -9, duration: 0.14, ease: 'power2.out' })
      .to(art, { y: 0, duration: 0.2, ease: 'bounce.out' })
  } else if (activeReaction.value === 'angry') {
    motion
      .fromTo(art, { autoAlpha: 0, scale: 0.9, x: -13, rotation: -3 }, { autoAlpha: 1, scale: 1.02, x: 12, rotation: 3, duration: 0.12, ease: 'power2.out' })
      .to(art, { x: -10, rotation: -2.5, duration: 0.1 })
      .to(art, { x: 8, rotation: 2, duration: 0.1 })
      .to(art, { x: 0, scale: 1, rotation: 0, duration: 0.18, ease: 'power3.out' })
  } else if (activeReaction.value === 'confused') {
    motion
      .fromTo(art, { autoAlpha: 0, scale: 0.9, rotation: -7, y: 14 }, { autoAlpha: 1, scale: 1, rotation: 5, y: 0, duration: 0.28, ease: 'back.out(1.6)' })
      .to(art, { rotation: -4, duration: 0.22, ease: 'sine.inOut' })
      .to(art, { rotation: 0, duration: 0.24, ease: 'sine.inOut' })
  } else {
    motion
      .fromTo(art, { autoAlpha: 0, scale: 0.72, y: 42, rotation: -5 }, { autoAlpha: 1, scale: 1.1, y: -18, rotation: 4, duration: 0.22, ease: 'power3.out' })
      .to(art, { scale: 1, y: 0, rotation: 0, duration: 0.3, ease: 'bounce.out' })
  }

  reactionTimeline = motion
}

function restoreDefault() {
  if (!reactionArt.value || motionIsReduced()) {
    activeReaction.value = 'default'
    return
  }

  reactionTimeline?.kill()
  reactionTimeline = gsap.timeline({
    onComplete: () => {
      activeReaction.value = 'default'
      nextTick(() => gsap.to(baseArt.value, { autoAlpha: 1, duration: 0.18, ease: 'power2.out', overwrite: true }))
    },
  })
    .to(reactionArt.value, { autoAlpha: 0, y: 10, scale: 0.97, duration: 0.18, ease: 'power2.in', overwrite: true })
}

function chooseReaction(name) {
  window.clearTimeout(resetReactionTimer)
  reactionTimeline?.kill()
  activeReaction.value = name
  reactionToken.value += 1
  playedReactionToken.value = -1

  nextTick(() => {
    if (reactionArt.value?.complete) playReactionMotion()
  })

  resetReactionTimer = window.setTimeout(restoreDefault, 2000)
}

function releasePointerFocus(event) {
  const target = event.currentTarget
  requestAnimationFrame(() => target?.blur())
}

function moveRig(event) {
  if (!baseArt.value || motionIsReduced()) return
  const point = gesture.move(event, event.currentTarget.getBoundingClientRect())
  if (!point) return
  if (point.capture && !event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId)
  puppetRig.value?.setPointer(point.x, point.y)
}

function startRigGesture(event) {
  if (!motionIsReduced() && gesture.start(event)) moveRig(event)
}

function endRigGesture(event) {
  if (!gesture.end(event)) return
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  resetRig()
}

function leaveRig() {
  if (!gesture.active) resetRig()
}

function guardGestureClick(event) {
  if (!gesture.blocksClick(event)) return
  event.preventDefault()
  event.stopPropagation()
}

function resetRig() {
  if (!baseArt.value || motionIsReduced()) return
  puppetRig.value?.reset()
}

function triggerRigMotion() {
  if (!motionIsReduced()) puppetRig.value?.wave()
}

onMounted(() => {
  if (!baseArt.value) return
  if (motionIsReduced()) return

  rigContext = gsap.context(() => {
    gsap.to(baseArt.value, {
      y: -2,
      scaleY: 1.006,
      duration: 2.25,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      transformOrigin: '50% 78%',
    })
  }, baseArt.value)
})

onBeforeUnmount(() => {
  window.clearTimeout(resetReactionTimer)
  reactionTimeline?.kill()
  rigContext?.revert()
})
</script>

<template>
  <section id="top" class="hero-section" aria-labelledby="hero-title">
    <video
      class="hero-stage-loop"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/images/lunar-pop-stage-bg-v1.webp"
      aria-hidden="true"
    >
      <source src="/videos/lunar-pop-stage-loop.webm" type="video/webm" />
    </video>
    <img class="hero-rabbit-mark hero-rabbit-mark--left" src="/images/lunar-pop-rabbit-mark-v1-small.webp" alt="" aria-hidden="true" />
    <img class="hero-rabbit-mark hero-rabbit-mark--right" src="/images/lunar-pop-rabbit-mark-v1-small.webp" alt="" aria-hidden="true" />
    <div class="hero-copy">
      <p class="hero-kicker"><span>LUNAR POP CLUB</span> 星乃モモ 月兔限定舞台</p>
      <h1 id="hero-title" class="hero-title"><span class="hero-title-lead">今晚，陪伴著你</span><span class="hero-title-main">月亮偶像</span></h1>
      <p class="hero-intro">戴上兔耳，跟著節拍跳進月亮裡。<br>モモ會把每一次心跳，都變成今夜的光。</p>
    </div>
    <div class="hero-character-stage">
      <div class="hero-character" :class="[`hero-character--${activeReaction}`, { 'is-rig-ready': rigReady }]" role="group" aria-label="可互動的月兔モモ" @pointerdown="startRigGesture" @pointermove="moveRig" @pointerup="endRigGesture" @pointercancel="endRigGesture" @lostpointercapture="endRigGesture" @pointerleave="leaveRig" @click.capture="guardGestureClick" @click="triggerRigMotion">
        <div ref="baseArt" class="hero-character-art hero-character-rig">
          <MomoPuppet ref="puppetRig" :alt="activeReaction === 'default' ? reaction.alt : ''" @ready="rigReady = true" />
        </div>
        <img v-if="activeReaction !== 'default'" ref="reactionArt" :key="`${activeReaction}-${reactionToken}`" class="hero-character-reaction" :src="reaction.image" :alt="reaction.alt" draggable="false" @load="playReactionMotion" />
        <button class="hero-hotspot hero-hotspot--head" type="button" aria-label="摸摸モモ的頭，看看她高興的反應" @pointerup="releasePointerFocus" @click.stop="chooseReaction('happy')" />
        <button class="hero-hotspot hero-hotspot--middle" type="button" aria-label="點擊モモ的中間，看看她生氣的反應" @pointerup="releasePointerFocus" @click.stop="chooseReaction('angry')" />
        <button class="hero-hotspot hero-hotspot--thigh" type="button" aria-label="點擊モモ的大腿，看看她嚇到的反應" @pointerup="releasePointerFocus" @click.stop="chooseReaction('startled')" />
        <button class="hero-hotspot hero-hotspot--feet" type="button" aria-label="點擊モモ的腳，看看她疑惑的反應" @pointerup="releasePointerFocus" @click.stop="chooseReaction('confused')" />
        <div v-if="activeReaction !== 'default'" :key="`${activeReaction}-sparkles`" class="hero-reaction-sparkles" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i></div>
        <p :key="activeReaction" class="hero-reaction" aria-live="polite"><template v-if="rigReady && activeReaction === 'default'"><span class="hero-hint-pointer">控制滑鼠與モモ互動。</span><span class="hero-hint-touch">移動手指與モモ互動，輕點看反應。</span></template><template v-else>{{ reaction.message }}</template></p>
      </div>
    </div>
    <button class="hero-scroll-cue" type="button" @click="scrollToSection('story')"><span>ENTER THE STAGE</span><b>↓</b></button>
  </section>
</template>
