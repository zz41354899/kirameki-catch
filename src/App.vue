<script setup>
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DanceInvite from './components/DanceInvite.vue'
import HeroSection from './components/HeroSection.vue'
import OpeningScreen from './components/OpeningScreen.vue'
import PageProgressRail from './components/PageProgressRail.vue'
import PointerEffects from './components/PointerEffects.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import StorySection from './components/StorySection.vue'
import { usePageExperience } from './composables/usePageExperience'
import { removeLocationHash, scrollToSection } from './composables/useSectionNavigation'
import { storySteps } from './data/story'

const loadGameModal = () => import('./components/RhythmGameModal.vue')
const loadCardModal = () => import('./components/HeartCardModal.vue')
const RhythmGameModal = defineAsyncComponent(loadGameModal)
const HeartCardModal = defineAsyncComponent(loadCardModal)

const root = ref(null)
const activeStory = ref(0)
const menuOpen = ref(false)
const gameModalOpen = ref(false)
const cardModalOpen = ref(false)
const cardUnlocked = ref(false)
const gameScore = ref(0)
let gamePrefetchObserver
const {
  introVisible, introLoadingComplete, introLoadingProgress, scrollProgress, activeSectionLabel, cursorVisible, cursorHearts,
  onPointerMove, spawnCursorHeart,
} = usePageExperience(root, activeStory, storySteps.length)

function openGame() {
  void loadCardModal()
  cardModalOpen.value = false
  cardUnlocked.value = false
  gameModalOpen.value = true
}

function openCard() {
  if (!cardUnlocked.value) {
    document.querySelector('#dance')?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  gameModalOpen.value = false
  cardModalOpen.value = true
}

function completeGame({ score }) {
  gameScore.value = score
  cardUnlocked.value = true
  gameModalOpen.value = false
  cardModalOpen.value = true
}

function selectStory(index) {
  activeStory.value = index

  const section = document.querySelector('.story-section')
  if (!section) return

  const sectionTop = window.scrollY + section.getBoundingClientRect().top
  const scrollDistance = Math.max(0, section.offsetHeight - window.innerHeight)
  const progress = (index + 0.5) / storySteps.length

  window.scrollTo({
    top: sectionTop + scrollDistance * progress,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })
}

function setMenuOpen(open) {
  menuOpen.value = open
  if (open) cursorVisible.value = false
}

watch([introVisible, menuOpen, gameModalOpen, cardModalOpen], ([intro, menu, game, card]) => {
  document.body.style.overflow = intro || menu || game || card ? 'hidden' : ''
}, { immediate: true })

onMounted(() => {
  removeLocationHash()
  if ('IntersectionObserver' in window) {
    gamePrefetchObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      void loadGameModal()
      gamePrefetchObserver.disconnect()
    }, { rootMargin: '200px' })
    const danceSection = root.value?.querySelector('.dance-section')
    if (danceSection) gamePrefetchObserver.observe(danceSection)
  }
})

onBeforeUnmount(() => {
  gamePrefetchObserver?.disconnect()
  document.body.style.overflow = ''
})
</script>

<template>
  <div ref="root" class="momo-site lunar-pop" @pointermove="!menuOpen && onPointerMove($event)" @click="!menuOpen && spawnCursorHeart($event)" @pointerleave="cursorVisible = false">
    <button class="skip-link" type="button" @click="scrollToSection('main', { focus: true })">跳至主要內容</button>
    <OpeningScreen :visible="introVisible" :complete="introLoadingComplete" :progress="introLoadingProgress" />
    <div class="site-shell" :class="{ 'is-intro-active': introVisible }">
      <PointerEffects :visible="cursorVisible && !menuOpen" :hearts="cursorHearts" />
      <PageProgressRail :progress="scrollProgress" :label="activeSectionLabel" />
      <SiteHeader @overlay-change="setMenuOpen" />

      <main id="main">
        <HeroSection />
        <StorySection :active-story="activeStory" :stories="storySteps" @select="selectStory" />
        <DanceInvite :card-unlocked="cardUnlocked" @play="openGame" @open-card="openCard" />
      </main>

      <RhythmGameModal v-if="gameModalOpen" @close="gameModalOpen = false" @complete="completeGame" />
      <HeartCardModal v-if="cardModalOpen" :score="gameScore" @close="cardModalOpen = false" />
      <SiteFooter />
    </div>
  </div>
</template>
