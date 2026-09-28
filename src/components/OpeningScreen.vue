<script setup>
const rabbitFrames = Array.from(
  { length: 24 },
  (_, index) => `/images/electronic-rabbit-head-rotation-${String(index).padStart(2, '0')}.webp`,
)

defineProps({
  visible: Boolean,
  complete: Boolean,
  progress: { type: Number, default: 0 },
})
</script>

<template>
  <div v-if="visible" class="intro-screen" aria-label="兔子機器人頭部讀取動畫">
    <div class="intro-rabbit-head" aria-hidden="true">
      <img v-for="(frame, index) in rabbitFrames" :key="frame" class="intro-rabbit intro-rabbit--frame" :data-frame="index" :src="frame" alt="" />
    </div>
    <div class="intro-loading" :class="{ 'is-complete': complete }" :style="{ '--intro-progress': `${progress}%` }" aria-hidden="true">
      <p class="intro-loading-label">{{ complete ? 'READY' : 'LOADING' }}</p>
      <p class="intro-loading-value"><b>{{ progress }}</b><span>%</span></p>
      <div class="intro-loading-track"><i></i></div>
    </div>
  </div>
</template>
