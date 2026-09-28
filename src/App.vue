<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import DanceInvite from './components/DanceInvite.vue'
import HeroSection from './components/HeroSection.vue'
import OpeningScreen from './components/OpeningScreen.vue'
import PageProgressRail from './components/PageProgressRail.vue'
import PointerEffects from './components/PointerEffects.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import StorySection from './components/StorySection.vue'
import { usePageExperience } from './composables/usePageExperience'
import { useWardrobe } from './composables/useWardrobe'
import { removeLocationHash, scrollToSection } from './composables/useSectionNavigation'
import { storySteps } from './data/story'

const root = ref(null)
const activeStory = ref(0)
const menuOpen = ref(false)
const router = useRouter()
const route = useRoute()
const skipOpeningOnReturn = route.query.skipOpening === '1'
const { gameCompleted } = useWardrobe()
const {
  introVisible, introLoadingComplete, introLoadingProgress, introFrame, entryFlash, scrollProgress, activeSectionLabel, cursorVisible, cursorHearts,
  onPointerMove, spawnCursorHeart,
} = usePageExperience(root, activeStory, storySteps.length, { skipOpening: skipOpeningOnReturn })

function openGame() {
  router.push('/game')
}

function openCard() {
  if (!gameCompleted.value) {
    document.querySelector('#dance')?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  router.push('/gallery')
}

function selectStory(index) {
  const section = document.querySelector('.story-section')
  if (!section) return

  const sectionTop = window.scrollY + section.getBoundingClientRect().top
  const scrollDistance = Math.max(0, section.offsetHeight - window.innerHeight)
  const progress = storySteps.length > 1 ? index / (storySteps.length - 1) : 0

  window.scrollTo({
    top: sectionTop + scrollDistance * progress,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })
}

function setMenuOpen(open) {
  menuOpen.value = open
  if (open) cursorVisible.value = false
}

watch(menuOpen, (menu) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = menu ? 'hidden' : ''
}, { immediate: true })

onMounted(() => {
  if (skipOpeningOnReturn) router.replace('/')
  removeLocationHash()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div ref="root" class="momo-site lunar-pop" @pointermove="!menuOpen && onPointerMove($event)" @click="!menuOpen && spawnCursorHeart($event)" @pointerleave="cursorVisible = false">
    <button class="skip-link" type="button" @click="scrollToSection('main', { focus: true })">跳至主要內容</button>
    <OpeningScreen :visible="introVisible" :complete="introLoadingComplete" :progress="introLoadingProgress" :frame="introFrame" />
    <div v-if="entryFlash" class="entry-flash" aria-hidden="true" @animationend="entryFlash = false"></div>
    <div class="site-shell">
      <PointerEffects :visible="cursorVisible && !menuOpen" :hearts="cursorHearts" />
      <PageProgressRail :progress="scrollProgress" :label="activeSectionLabel" />
      <SiteHeader @overlay-change="setMenuOpen" />

      <main id="main">
        <HeroSection />
        <StorySection :active-story="activeStory" :stories="storySteps" @select="selectStory" />
        <DanceInvite :card-unlocked="gameCompleted" :on-play="openGame" :on-open-card="openCard" />
      </main>

      <SiteFooter />
    </div>
  </div>
</template>
