import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function waitForDecodedImage(image) {
  if (typeof image.decode === 'function') return image.decode().catch(() => {})
  if (image.complete) return Promise.resolve()
  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  })
}

export function usePageExperience(root, activeStory, storyCount) {
  const introVisible = ref(true)
  const introLoadingComplete = ref(false)
  const introLoadingProgress = ref(0)
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
  let introTimeline
  let disposed = false
  function playHeroEntrance() {
    if (prefersReducedMotion()) return
    const shell = root.value?.querySelector('.site-shell')
    if (!shell) return

    gsap.set('.site-header', { y: -26, autoAlpha: 0 })
    gsap.set('.hero-character', { x: -110, rotation: -5, autoAlpha: 0 })
    gsap.set('.hero-rabbit-mark', { scale: 0.55, autoAlpha: 0 })
    gsap.set('.hero-kicker', { y: 18, autoAlpha: 0 })
    gsap.set('.hero-title span', { y: 70, autoAlpha: 0 })
    gsap.set('.hero-intro, .hero-scroll-cue', { y: 20, autoAlpha: 0 })

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to('.site-header', { y: 0, autoAlpha: 1, duration: 0.5 })
      .to('.hero-character', { x: 0, rotation: 0, autoAlpha: 1, duration: 0.92, ease: 'back.out(1.25)' }, '-=.22')
      .to('.hero-rabbit-mark', { scale: 1, autoAlpha: 1, duration: 0.42, stagger: 0.08 }, '-=.58')
      .to('.hero-kicker', { y: 0, autoAlpha: 1, duration: 0.45 }, '-=.18')
      .to('.hero-title span', { y: 0, autoAlpha: 1, duration: 0.68, stagger: 0.1 }, '-=.16')
      .to('.hero-intro', { y: 0, autoAlpha: 1, duration: 0.5 }, '-=.24')
      .to('.hero-scroll-cue', { y: 0, autoAlpha: 1, duration: 0.45 }, '-=.24')
  }

  function dismissIntro() {
    if (prefersReducedMotion()) {
      introVisible.value = false
      return
    }
    const shell = root.value?.querySelector('.site-shell')
    if (!shell) {
      introVisible.value = false
      return
    }
    gsap.set('.site-header, .hero-character, .hero-rabbit-mark, .hero-kicker, .hero-title span, .hero-intro, .hero-scroll-cue', { autoAlpha: 0 })
    gsap.timeline({
      onComplete: () => {
        introVisible.value = false
        nextTick(() => {
          gsap.set(shell, { clearProps: 'opacity' })
          playHeroEntrance()
        })
      },
    })
      .to('.intro-screen', { scale: 1.06, opacity: 0, duration: 0.64, ease: 'power2.inOut' })
      .to(shell, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '<0.18')
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
    context = gsap.context(() => {
      if (!prefersReducedMotion()) {
        const introFrames = gsap.utils.toArray('.intro-rabbit--frame')
        const loadingMeter = { value: 0 }
        const frameDuration = 0.12
        const turnFrames = Array.from({ length: 24 }, (_, step) => {
          const turn = step + 1
          return {
            index: turn % 24,
            progress: 10 + (90 * turn) / 24,
            y: Math.sin((turn / 24) * Math.PI * 2) * 2.5,
            rotationZ: Math.cos((turn / 24) * Math.PI * 2) * 0.9,
          }
        })
        const updateLoadingMeter = () => { introLoadingProgress.value = Math.round(loadingMeter.value) }
        introTimeline = gsap.timeline({ paused: true, onComplete: dismissIntro })
          .to('.intro-loading', { opacity: 1, duration: 0.01, ease: 'none' })
          .set(introFrames, { opacity: 0 })
          .set(introFrames[0], { opacity: 1 })
          .set(loadingMeter, { value: 10, onUpdate: updateLoadingMeter })
          .fromTo('.intro-rabbit-head', { scale: .72, y: 18, rotationZ: -3, opacity: 0 }, {
            scale: 1,
            y: 0,
            rotationZ: 0,
            opacity: 1, duration: 0.42,
            ease: 'back.out(1.6)',
          }, '<')
        let previousIndex = 0
        turnFrames.forEach(({ index, progress, y, rotationZ }) => {
          introTimeline
            .set(introFrames[previousIndex], { opacity: 0 })
            .set(introFrames[index], { opacity: 1 })
            .to(loadingMeter, { value: progress, duration: frameDuration, ease: 'none', onUpdate: updateLoadingMeter })
            .to('.intro-rabbit-head', { y, rotationZ, duration: frameDuration, ease: 'sine.inOut' }, '<')
          previousIndex = index
        })
        introTimeline
          .call(() => { introLoadingComplete.value = true })
          .to('.intro-loading', { scale: 1.08, duration: 0.24, ease: 'power2.out' })
          .to('.intro-rabbit-head', { y: -34, scale: 1.1, opacity: 0, duration: 0.2, ease: 'power2.in' }, '+=.62')
      } else {
        introVisible.value = false
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
    if (introTimeline) {
      const images = root.value?.querySelectorAll('.intro-rabbit') ?? []
      Promise.all([...images].map(waitForDecodedImage)).then(() => {
        if (!disposed) introTimeline.play()
      })
    }
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  })

  onBeforeUnmount(() => {
    disposed = true
    context?.revert()
  })

  return {
    introVisible,
    introLoadingComplete,
    introLoadingProgress,
    scrollProgress,
    activeSectionLabel,
    cursorVisible,
    cursorHearts,
    onPointerMove,
    spawnCursorHeart,
  }
}
