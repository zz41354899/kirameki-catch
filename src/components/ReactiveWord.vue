<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
const props = defineProps({ text: String, hint: { type: String, default: '點我，讓モモ回應' } })
const emit = defineEmits(['activate'])
const word = ref(null)
let context, animation
function bounce() { context?.bounce() }
onMounted(() => {
  context = gsap.context(self => {
    self.add('bounce', () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      animation?.kill()
      animation = gsap.fromTo(word.value.querySelectorAll('.word-char'), { y: 0, rotation: 0 }, {
        keyframes: [{ y: -10, rotation: -5, duration: .17 }, { y: 0, rotation: 0, duration: .55, ease: 'elastic.out(1,.4)' }],
        stagger: .045, overwrite: 'auto',
      })
    })
  }, word.value)
})
onBeforeUnmount(() => context?.revert())
</script>
<template>
  <button ref="word" class="reactive-word" :aria-label="`${text}，${hint}`" @pointerenter="bounce" @focus="bounce" @click="bounce(); emit('activate')"><span v-for="(char,i) in Array.from(text)" :key="i" class="word-char" aria-hidden="true">{{ char }}</span></button>
</template>
