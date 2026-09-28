<script setup>
import { computed, nextTick, watch } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from '../composables/usePageExperience'

const props = defineProps({ activeStory: Number, stories: { type: Array, required: true } })
const emit = defineEmits(['select'])
const currentStory = computed(() => props.stories[props.activeStory])

function selectStory(index) {
  emit('select', index)
}

watch(() => props.activeStory, () => {
  if (prefersReducedMotion()) return
  nextTick(() => {
    gsap.fromTo('.story-copy > *', { y: 20 }, { y: 0, duration: 0.42, stagger: 0.035, ease: 'power3.out', clearProps: 'transform', overwrite: true })
    gsap.fromTo('.story-visual > *', { y: 12 }, { y: 0, duration: 0.4, stagger: 0.04, ease: 'power3.out', clearProps: 'transform', overwrite: true })
    gsap.fromTo('.story-character.is-active', { y: 16, scale: 0.98 }, { y: 0, scale: 1, duration: 0.48, ease: 'power3.out', clearProps: 'transform', overwrite: true })
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
      <div class="story-portrait" :class="`story-portrait--${activeStory + 1}`">
        <img v-for="(item, index) in stories" :key="item.image" class="story-character" :class="{ 'is-active': index === activeStory }" :src="item.image" :alt="index === activeStory ? `${item.label}：${item.word}立繪` : ''" :aria-hidden="index !== activeStory" loading="lazy" decoding="async" />
      </div>
      <div class="story-visual" aria-hidden="true"><span>{{ currentStory.en }}</span><b>0{{ activeStory + 1 }}</b><i>{{ currentStory.label }}</i></div>
      <nav class="story-tabs" aria-label="角色介紹段落">
        <button v-for="(item, index) in stories" :key="item.en" :class="{ active: index === activeStory }" :aria-pressed="index === activeStory" @click.stop="selectStory(index)"><b>0{{ index + 1 }}</b><span>{{ item.en }}<small>{{ item.label }}</small></span></button>
      </nav>
      <p class="story-hint">滾動認識モモ</p>
    </div>
  </section>
</template>
