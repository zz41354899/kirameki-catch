import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePageExperience(root, activeStory, storyCount) {
  const introVisible = ref(true)
  const scrollProgress = ref(0)
  const cursorVisible = ref(false)
  const cursorHearts = ref([])
  const activeSectionLabel = computed(() => {
    if (scrollProgress.value < 0.22) return 'OPENING'
    if (scrollProgress.value < 0.56) return 'SCROLL STORY'
    if (scrollProgress.value < 0.82) return 'DANCE GAME'
    return 'YOUR CARD'
  })
  let context
  let introTimer

  function dismissIntro() {
    clearTimeout(introTimer)
    if (prefersReducedMotion()) {
      introVisible.value = false
      return
    }
    const shell = root.value?.querySelector('.site-shell')
    gsap.timeline({
      onComplete: () => {
        introVisible.value = false
        nextTick(() => gsap.set(shell, { clearProps: 'opacity' }))
      },
    })
      .to('.intro-screen', { opacity: 0, duration: 0.58, ease: 'power2.inOut' })
      .to(shell, { opacity: 1, duration: 0.68, ease: 'power2.out' }, '<0.12')
  }

  function onPointerMove(event) {
    if (event.pointerType !== 'mouse') return
    cursorVisible.value = true
    gsap.to('.momo-cursor', { x: event.clientX, y: event.clientY, duration: 0.18, ease: 'power3.out', overwrite: true })
    const hero = event.target.closest?.('.hero-section')
    if (!hero || prefersReducedMotion()) return
    const rect = hero.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    gsap.to('.hero-character', { x: x * 34, y: y * 20, rotation: x * 1.2, duration: 0.7, ease: 'power3.out', overwrite: true })
    gsap.to('.hero-giant', { x: x * -20, y: y * -10, duration: 0.9, ease: 'power3.out', overwrite: true })
  }

  function spawnCursorHeart(event) {
    if (event.target.closest?.('button, a, input, textarea, select')) return
    if (event.pointerType !== 'mouse' || prefersReducedMotion()) return
    const id = `${Date.now()}-${Math.random()}`
    cursorHearts.value.push({ id, x: event.clientX, y: event.clientY, rotate: Math.random() * 24 - 12 })
    nextTick(() => {
      const element = document.querySelector(`[data-heart-id="${id}"]`)
      if (!element) return
      gsap.fromTo(element, { scale: 0.4, opacity: 1, x: -12, y: -12 }, {
        scale: 1.25,
        opacity: 0,
        x: Math.random() * 50 - 25,
        y: -95 - Math.random() * 40,
        rotation: Math.random() * 60 - 30,
        duration: 0.85,
        ease: 'power2.out',
        onComplete: () => { cursorHearts.value = cursorHearts.value.filter((item) => item.id !== id) },
      })
    })
  }

  onMounted(() => {
    const heart = root.value?.querySelector('.intro-heart')
    const heartBounds = heart?.getBoundingClientRect()
    const heartCoverScale = heartBounds?.width && heartBounds?.height
      ? Math.max(28, Math.max(window.innerWidth / heartBounds.width, window.innerHeight / heartBounds.height) * 4.2)
      : 40

    introTimer = window.setTimeout(dismissIntro, prefersReducedMotion() ? 50 : 1650)
    context = gsap.context(() => {
      if (!prefersReducedMotion()) {
        gsap.timeline()
          .fromTo('.intro-heart', { scale: 0, rotation: -7 }, {
            scale: 1,
            rotation: 0,
            duration: 0.42,
            ease: 'back.out(1.8)',
          })
          .to('.intro-heart', { scale: 1.08, duration: 0.16, ease: 'sine.out' })
          .to('.intro-heart', { scale: 1, duration: 0.18, ease: 'sine.inOut' })
          .to('.intro-heart', { scale: heartCoverScale, duration: 0.7, ease: 'power2.inOut' })
          .to('.intro-heart', { scale: heartCoverScale * 1.08, duration: 0.14, ease: 'none' })
        gsap.timeline({ delay: 1.15, defaults: { ease: 'power3.out' } })
          .from('.site-header', { y: -25, opacity: 0, duration: 0.55 })
          .from('.hero-kicker, .hero-title span', { y: 70, opacity: 0, stagger: 0.08, duration: 0.75 }, '-=.15')
          .from('.hero-character', { x: -100, opacity: 0, rotation: -5, duration: 0.95, ease: 'back.out(1.35)' }, '-=.65')
          .from('.hero-scroll-cue', { y: 20, opacity: 0, duration: 0.5 }, '-=.28')
      }
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { scrollProgress.value = self.progress } })
      ScrollTrigger.create({
        trigger: '.story-section',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => { activeStory.value = Math.min(storyCount - 1, Math.floor(self.progress * storyCount)) },
      })
      gsap.to('.story-character', { yPercent: -10, rotation: 2, ease: 'none', scrollTrigger: { trigger: '.story-section', start: 'top bottom', end: 'bottom top', scrub: 0.7 } })
      gsap.to('.hero-giant', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.utils.toArray('.reveal-up').forEach((element) => {
        gsap.from(element, { y: 55, opacity: 0, duration: 0.9, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: element, start: 'top 86%', once: true } })
      })
    }, root.value)
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  })

  onBeforeUnmount(() => {
    clearTimeout(introTimer)
    context?.revert()
  })

  return {
    introVisible,
    scrollProgress,
    activeSectionLabel,
    cursorVisible,
    cursorHearts,
    onPointerMove,
    spawnCursorHeart,
  }
}
