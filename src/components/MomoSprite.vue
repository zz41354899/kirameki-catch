<script setup>
import { computed } from 'vue'

const danceFrames = Array.from(
  { length: 8 },
  (_, index) => `/images/momo-moon-rabbit-dance-${String(index + 1).padStart(2, '0')}.webp`,
)

const props = defineProps({
  frame: { type: Number, default: 0 },
  label: { type: String, default: '' },
})

const normalizedFrame = computed(() => Math.min(danceFrames.length - 1, Math.max(0, Math.floor(props.frame))))
const frameSource = computed(() => danceFrames[normalizedFrame.value])
</script>
<template>
  <img
    class="momo-sprite"
    :src="frameSource"
    :alt="label || ''"
    :aria-hidden="label ? undefined : true"
    :data-frame="normalizedFrame"
    draggable="false"
  />
</template>
