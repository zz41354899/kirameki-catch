<script setup>
import { computed } from 'vue'
import { getDanceFrameSource } from '../data/wardrobe'

const props = defineProps({
  frame: { type: Number, default: 0 },
  hairId: { type: String, default: 'classic' },
  outfitId: { type: String, default: 'debut' },
  label: { type: String, default: '' },
})

const normalizedFrame = computed(() => Math.min(7, Math.max(0, Math.floor(props.frame))))
const frameSource = computed(() => getDanceFrameSource(props.hairId, props.outfitId, normalizedFrame.value))
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
