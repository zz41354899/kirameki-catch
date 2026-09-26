<script setup>
import { computed, nextTick, watch } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from '../composables/usePageExperience'

const props = defineProps({ activeStory: Number, stories: { type: Array, required: true } })
const emit = defineEmits(['select'])
const currentStory = computed(() => props.stories[props.activeStory])

function selectStory(index, event) {
  if (event.type === 'click' && event.detail > 0) return
  emit('select', index)
}

watch(() => props.activeStory, () => {
  if (prefersReducedMotion()) return
  nextTick(() => {
    gsap.fromTo('.story-copy > *', { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out', clearProps: 'all' })
    gsap.fromTo('.story-visual > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out', clearProps: 'all' })
    gsap.fromTo('.story-character', { y: 24, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.65, ease: 'power3.out', clearProps: 'all' })
  })
})
</script>

<template>
  <section id="story" class="story-section" aria-labelledby="story-title">
    <div class="story-sticky">
      <div class="story-copy">
        <p>{{ currentStory.en }} / {{ currentStory.label }}</p>
        <h2 id="story-title">{{ currentStory.word }}</h2>
        <span>{{ currentStory.note }}</span>
        <dl class="story-settings">
          <div v-for="setting in currentStory.settings" :key="setting.term"><dt>{{ setting.term }}</dt><dd>{{ setting.value }}</dd></div>
        </dl>
      </div>
      <div class="story-portrait"><img :key="currentStory.image" class="story-character" :src="currentStory.image" :alt="`${currentStory.label}：${currentStory.word}立繪`" /></div>
      <div class="story-visual" aria-hidden="true"><span>{{ currentStory.en }}</span><b>0{{ activeStory + 1 }}</b><i>{{ currentStory.label }}</i></div>
      <nav class="story-tabs" aria-label="角色介紹段落">
        <button v-for="(item, index) in stories" :key="item.en" :class="{ active: index === activeStory }" :aria-pressed="index === activeStory" @pointerdown.stop="selectStory(index, $event)" @click="selectStory(index, $event)"><b>0{{ index + 1 }}</b><span>{{ item.en }}<small>{{ item.label }}</small></span></button>
      </nav>
      <p class="story-hint">滾動認識モモ</p>
    </div>
  </section>
</template>
