<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DanceInvite from './components/DanceInvite.vue'
import HeartCardModal from './components/HeartCardModal.vue'
import HeroSection from './components/HeroSection.vue'
import OpeningScreen from './components/OpeningScreen.vue'
import PageProgressRail from './components/PageProgressRail.vue'
import PointerEffects from './components/PointerEffects.vue'
import RhythmGameModal from './components/RhythmGameModal.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import StorySection from './components/StorySection.vue'
import { usePageExperience } from './composables/usePageExperience'
import { removeLocationHash, scrollToSection } from './composables/useSectionNavigation'
import { storySteps } from './data/story'

const root = ref(null)
const activeStory = ref(0)
const menuOpen = ref(false)
const gameModalOpen = ref(false)
const cardModalOpen = ref(false)
const cardUnlocked = ref(false)
const gameScore = ref(0)
const {
  introVisible, scrollProgress, activeSectionLabel, cursorVisible, cursorHearts,
  onPointerMove, spawnCursorHeart,
} = usePageExperience(root, activeStory, storySteps.length)

function openGame() {
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

watch([menuOpen, gameModalOpen, cardModalOpen], ([menu, game, card]) => {
  document.body.style.overflow = menu || game || card ? 'hidden' : ''
})

onMounted(() => {
  removeLocationHash()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div ref="root" class="momo-site" @pointermove="onPointerMove" @click="spawnCursorHeart" @pointerleave="cursorVisible = false">
    <button class="skip-link" type="button" @click="scrollToSection('main', { focus: true })">跳至主要內容</button>
    <OpeningScreen :visible="introVisible" />
    <div class="site-shell" :class="{ 'is-intro-active': introVisible }">
      <PointerEffects :visible="cursorVisible" :hearts="cursorHearts" />
      <PageProgressRail :progress="scrollProgress" :label="activeSectionLabel" />
      <SiteHeader @overlay-change="menuOpen = $event" />

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
