<script setup>
defineProps({ progress: Number, label: String })
</script>

<template>
  <aside class="scroll-rail" aria-label="頁面進度">
    <span class="rail-label">{{ label }}</span>
    <div class="rail-line"><i :style="{ transform: `scaleY(${progress})` }"></i></div>
  </aside>
</template>
