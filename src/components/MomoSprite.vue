<script setup>
import { computed } from 'vue'
const props = defineProps({ frame: { type: Number, default: 0 }, label: { type: String, default: '' } })
const position = computed(() => {
  const frame = Math.min(7, Math.max(0, Math.floor(props.frame)))
  return `${(frame % 4) * 100 / 3}% ${Math.floor(frame / 4) * 100}%`
})
</script>
<template>
  <div class="momo-sprite" :style="{ backgroundPosition: position }" :role="label ? 'img' : undefined" :aria-label="label || undefined" :aria-hidden="label ? undefined : true" :data-frame="frame"></div>
</template>
