<script setup>
defineProps({ visible: Boolean, hearts: { type: Array, default: () => [] } })
</script>

<template>
  <div class="momo-cursor" :class="{ visible }" aria-hidden="true"><img src="/favicon.svg" alt="" /></div>
  <img v-for="heart in hearts" :key="heart.id" class="cursor-heart" :data-heart-id="heart.id" src="/favicon.svg" alt="" :style="{ left: `${heart.x}px`, top: `${heart.y}px`, rotate: `${heart.rotate}deg` }" />
</template>
