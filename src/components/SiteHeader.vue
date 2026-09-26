<script setup>
import { nextTick, ref, watch } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from '../composables/usePageExperience'
import { scrollToSection } from '../composables/useSectionNavigation'

const emit = defineEmits(['overlay-change'])
const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}

function navigateTo(sectionId) {
  closeMenu()
  scrollToSection(sectionId)
}

watch(menuOpen, async (open) => {
  emit('overlay-change', open)
  if (!open || prefersReducedMotion()) return
  await nextTick()
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.menu-character', { xPercent: -16, opacity: 0, duration: 0.75 })
    .from('.menu-links button', { x: 50, opacity: 0, stagger: 0.08, duration: 0.52 }, '-=.48')
})
</script>

<template>
  <header class="site-header">
    <button class="brand" type="button" @click="scrollToSection('top')"><img src="/favicon.svg" alt="" /><span>星乃モモ<small>OFFICIAL SITE</small></span></button>
    <span class="header-caption">把今天，變得更可愛一點。</span>
    <button class="menu-button" :aria-expanded="menuOpen" :aria-label="menuOpen ? '關閉選單' : '開啟選單'" @click="menuOpen = !menuOpen">
      <span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="menu-label">{{ menuOpen ? '關閉' : '選單' }}</span>
    </button>
  </header>

  <div v-if="menuOpen" class="menu-overlay" role="dialog" aria-modal="true" aria-label="網站選單">
    <div class="menu-visual"><img class="menu-character" src="/images/momo-standing-v2.png" alt="星乃モモ全身形象" /><span>WELCOME TO<br>MOMO'S WORLD</span></div>
    <nav class="menu-links" aria-label="主要導覽">
      <p>目錄 / MENU</p>
      <button type="button" @click="navigateTo('top')"><b>01</b><span>首頁<small>被可愛接住的地方</small></span></button>
      <button type="button" @click="navigateTo('story')"><b>02</b><span>關於モモ<small>再靠近一點點吧</small></span></button>
      <button type="button" @click="navigateTo('dance')"><b>03</b><span>心動小遊戲<small>陪我跳完這一首</small></span></button>
    </nav>
  </div>
</template>
