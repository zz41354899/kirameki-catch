<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const rabbitFrames = Array.from(
  { length: 24 },
  (_, index) => `/images/electronic-rabbit-head-rotation-${String(index).padStart(2, '0')}.webp`,
)

const props = defineProps({
  visible: Boolean,
  complete: Boolean,
  progress: { type: Number, default: 0 },
  frame: { type: Number, default: 0 },
})

const displayedFrame = ref(0)
let idleFramePreload

watch(() => props.frame, (frame) => {
  const nextFrame = Math.min(rabbitFrames.length - 1, Math.max(0, frame))
  if (nextFrame === displayedFrame.value) return

  const image = new Image()
  image.src = rabbitFrames[nextFrame]
  image.decode().catch(() => {}).finally(() => {
    displayedFrame.value = nextFrame
  })
})

onMounted(() => {
  const warmRemainingFrames = () => {
    rabbitFrames.slice(1).forEach((src) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = src
    })
  }

  if ('requestIdleCallback' in window) {
    idleFramePreload = window.requestIdleCallback(warmRemainingFrames, { timeout: 1800 })
  } else {
    idleFramePreload = window.setTimeout(warmRemainingFrames, 1200)
  }
})

onBeforeUnmount(() => {
  if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleFramePreload)
  else window.clearTimeout(idleFramePreload)
})
</script>

<template>
    <div v-if="visible" class="intro-screen" aria-label="月兔舞台載入中">
      <div class="intro-rabbit-head" aria-hidden="true">
        <img class="intro-rabbit" :src="rabbitFrames[displayedFrame]" alt="" fetchpriority="high" decoding="async" />
      </div>
    <div class="intro-loading" :class="{ 'is-complete': complete }" :style="{ '--intro-progress': `${progress}%` }">
      <p class="intro-loading-label">{{ complete ? 'READY' : 'LOADING' }}</p>
      <p class="intro-loading-value"><b>{{ progress }}</b><span>%</span></p>
      <div class="intro-loading-track"><i></i></div>
    </div>
  </div>
</template>
