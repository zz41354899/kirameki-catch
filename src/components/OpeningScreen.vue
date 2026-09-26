<script setup>
defineProps({ visible: Boolean })
</script>

<template>
  <div v-if="visible" class="intro-screen" aria-label="愛心放大的開場動畫">
    <svg class="intro-heart" viewBox="0 0 64 56" aria-hidden="true">
      <path d="M32 55S6 40 6 22C6 7 25 7 32 20 39 7 58 7 58 22c0 18-26 33-26 33" />
    </svg>
  </div>
</template>
