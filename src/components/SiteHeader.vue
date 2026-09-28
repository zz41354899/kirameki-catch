<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import gsap from 'gsap'
import { prefersReducedMotion } from '../composables/usePageExperience'
import { scrollToSection } from '../composables/useSectionNavigation'

const router = useRouter()
const emit = defineEmits(['overlay-change'])
const menuOpen = ref(false)
const menuRendered = ref(false)
const menuClosing = ref(false)
const menuOverlay = ref(null)
let menuTimeline

function closeMenu() {
  if (!menuOpen.value || menuClosing.value) return
  menuOpen.value = false
  if (prefersReducedMotion()) {
    menuRendered.value = false
    emit('overlay-change', false)
    return
  }

  menuClosing.value = true
  menuTimeline?.kill()
  const overlay = menuOverlay.value
  if (!overlay) return finishClosingMenu()

  const visual = overlay.querySelector('.menu-visual')
  const character = overlay.querySelector('.menu-character')
  const bursts = overlay.querySelectorAll('.menu-burst')
  const heading = overlay.querySelector('.menu-links > p')
  const cards = overlay.querySelectorAll('.menu-links button')
  menuTimeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: finishClosingMenu })
    .to(cards, { y: -14, opacity: 0, stagger: .045, duration: .22 })
    .to(heading, { y: -10, opacity: 0, duration: .2 }, .04)
    .to(bursts, { scale: .72, opacity: 0, duration: .22 }, .08)
    .to(character, { xPercent: -5, opacity: 0, duration: .32 }, .1)
    .to(visual, { xPercent: -4, opacity: 0, duration: .32 }, .12)
    .to(overlay, { opacity: 0, duration: .2 }, .25)
}

function finishClosingMenu() {
  menuClosing.value = false
  menuRendered.value = false
  emit('overlay-change', false)
}

function openMenu() {
  if (menuClosing.value) return
  menuRendered.value = true
  menuOpen.value = true
}

function toggleMenu() {
  if (menuOpen.value) closeMenu()
  else openMenu()
}

async function navigateTo(sectionId) {
  if (router.currentRoute.value.path !== '/') await router.push('/')
  closeMenu()
  await nextTick()
  scrollToSection(sectionId)
}

function navigateToRoute(route) {
  closeMenu()
  router.push(route)
}

function goHome() {
  if (router.currentRoute.value.path === '/') scrollToSection('top')
  else router.push('/')
}

watch(menuOpen, async (open) => {
  if (!open) return
  emit('overlay-change', true)
  if (prefersReducedMotion()) return
  menuTimeline?.kill()
  await nextTick()
  const overlay = menuOverlay.value
  if (!overlay) return
  const visual = overlay.querySelector('.menu-visual')
  const character = overlay.querySelector('.menu-character')
  const bursts = overlay.querySelectorAll('.menu-burst')
  const heading = overlay.querySelector('.menu-links > p')
  const cards = overlay.querySelectorAll('.menu-links button')
  menuTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from(overlay, { opacity: 0, duration: .24 })
    .from(visual, { xPercent: -5, opacity: 0, duration: .42 }, .04)
    .from(character, { xPercent: -6, opacity: 0, duration: .46 }, .1)
    .from(bursts, { scale: .7, opacity: 0, stagger: .08, duration: .3 }, .18)
    .from(heading, { y: 14, opacity: 0, duration: .32 }, .16)
    .from(cards, { y: 18, opacity: 0, stagger: .07, duration: .34 }, .24)
})

onBeforeUnmount(() => menuTimeline?.kill())
</script>

<template>
  <header class="site-header">
    <button class="brand" type="button" @click="goHome"><img src="/images/lunar-pop-rabbit-mark-v1-small.webp" alt="" /><span>星乃モモ<small>LUNAR POP CLUB</small></span></button>
    <button class="menu-button" :aria-expanded="menuOpen" :aria-label="menuOpen ? '關閉選單' : '開啟選單'" @click="toggleMenu">
      <span class="menu-icon" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="menu-label">{{ menuOpen ? '關閉' : '選單' }}</span>
    </button>
  </header>

  <div v-if="menuRendered" ref="menuOverlay" class="menu-overlay" role="dialog" aria-modal="true" aria-label="網站選單">
    <div class="menu-visual">
      <span class="menu-burst menu-burst--top" aria-hidden="true">✦</span>
      <img class="menu-character" src="/images/momo-moon-rabbit-hero-v2.webp" alt="月兔裝扮的星乃モモ" />
      <span class="menu-visual-copy">WELCOME TO<br>LUNAR POP CLUB</span>
    </div>
    <nav class="menu-links" aria-label="主要導覽">
      <p>MOONLIGHT MENU</p>
      <button type="button" @click="navigateTo('top')"><span>月下開演<small>跟著月光走進舞台</small></span><i aria-hidden="true">↗</i></button>
      <button type="button" @click="navigateTo('story')"><span>月兔檔案<small>認識今晚的 Momo</small></span><i aria-hidden="true">↗</i></button>
      <button type="button" @click="navigateToRoute('/game')"><span>節奏遊戲<small>陪我跳完這一首</small></span><i aria-hidden="true">↗</i></button>
    </nav>
  </div>
</template>
