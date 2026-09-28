import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePageExperience(root, activeStory, storyCount, { skipOpening = false } = {}) {
  const introVisible = ref(!skipOpening)
  const introLoadingComplete = ref(false)
  const introLoadingProgress = ref(10)
  const introFrame = ref(0)
  const entryFlash = ref(false)
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
  let heroFocusMedia
  let introTimeline
  let disposed = false

  function startIntro() {
    if (skipOpening || disposed || prefersReducedMotion()) {
      introVisible.value = false
      return
    }

    const introState = { frame: 0, progress: 10 }
    introTimeline = gsap.timeline({
      onComplete: () => {
        introVisible.value = false
        entryFlash.value = true
      },
    }).to(introState, {
      frame: 23,
      progress: 100,
      duration: 3.12,
      ease: 'none',
      onUpdate: () => {
        introFrame.value = Math.round(introState.frame)
        introLoadingProgress.value = Math.round(introState.progress)
      },
    })
      .call(() => { introLoadingComplete.value = true })
      .to({}, { duration: 0.38 })
      .to('.intro-screen', { opacity: 0, scale: 1.035, duration: 0.46, ease: 'power2.inOut' })
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
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { scrollProgress.value = self.progress } })
      if (!prefersReducedMotion()) {
        heroFocusMedia = gsap.matchMedia()
        heroFocusMedia.add('(min-width: 768px)', () => {
          const focusTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: '.hero-section',
              start: 'top top',
              end: () => `+=${Math.round(window.innerHeight * 1.15)}`,
              pin: true,
              anticipatePin: 1,
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          })

          focusTimeline
            .to('.hero-character-stage', { yPercent: -2, scale: 1.03, duration: 0.48, ease: 'none' }, 0)
            .to('.hero-copy', { y: -24, autoAlpha: 0.3, duration: 0.34, ease: 'none' }, 0.16)
            .to('.hero-rabbit-mark', { autoAlpha: 0.14, duration: 0.28, ease: 'none' }, 0.2)
            .to('.hero-stage-loop', { autoAlpha: 0.34, duration: 0.4, ease: 'none' }, 0.56)
            .to('.hero-character-stage', { yPercent: -4, scale: 1.05, duration: 0.44, ease: 'none' }, 0.56)
            .to('.hero-section', { backgroundColor: '#190a22', duration: 0.44, ease: 'none' }, 0.56)
        })
      }
      ScrollTrigger.create({
        trigger: '.story-section',
        start: 'top top',
        end: 'bottom bottom',
        snap: prefersReducedMotion() ? false : {
          snapTo: (progress) => {
            const step = storyCount > 1 ? 1 / (storyCount - 1) : 1
            return Math.round(progress / step) * step
          },
          duration: { min: 0.18, max: 0.42 },
          delay: 0.12,
          ease: 'power2.inOut',
          directional: false,
        },
        onUpdate: (self) => {
          const nextStory = Math.min(
            storyCount - 1,
            Math.round(self.progress * Math.max(1, storyCount - 1)),
          )
          if (nextStory !== activeStory.value) activeStory.value = nextStory
        },
      })
      gsap.to('.story-portrait', { yPercent: -4, rotation: 1.2, ease: 'none', scrollTrigger: { trigger: '.story-section', start: 'top bottom', end: 'bottom top', scrub: 0.7 } })
      if (!prefersReducedMotion()) {
        const danceTimeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: '.dance-section',
            start: 'top 78%',
            toggleActions: 'restart none restart none',
          },
        })

        danceTimeline
          .from('.dance-cta', { clipPath: 'inset(7% 4% 7% 4%)', autoAlpha: 0, duration: 0.72, ease: 'power3.inOut', clearProps: 'clipPath,opacity,visibility' })
          .from('.cta-visual', { xPercent: -7, autoAlpha: 0, duration: 0.62, clearProps: 'transform,opacity,visibility' }, 0.12)
          .from('.cta-visual img', { yPercent: 8, scale: 0.9, rotation: -3, autoAlpha: 0, duration: 0.82, ease: 'back.out(1.18)', clearProps: 'transform,opacity,visibility' }, 0.2)
          .from('.cta-copy', { xPercent: 7, autoAlpha: 0, duration: 0.62, clearProps: 'transform,opacity,visibility' }, 0.18)
          .from('.cta-copy > p, .cta-copy h2, .cta-copy > span, .cta-play, .cta-card', { y: 24, autoAlpha: 0, duration: 0.46, stagger: 0.065, clearProps: 'transform,opacity,visibility' }, 0.38)
      }
      gsap.utils.toArray('.reveal-up').forEach((element) => {
        gsap.from(element, { y: 55, opacity: 0, duration: 0.9, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: element, start: 'top 86%', once: true } })
      })
    }, root.value)
    const scheduleIntro = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(startIntro, { timeout: 1600 })
      } else {
        window.setTimeout(startIntro, 800)
      }
    }
    if (document.readyState === 'complete') scheduleIntro()
    else window.addEventListener('load', scheduleIntro, { once: true })
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  })

  onBeforeUnmount(() => {
    disposed = true
    introTimeline?.kill()
    heroFocusMedia?.revert()
    context?.revert()
  })

  return {
    introVisible,
    introLoadingComplete,
    introLoadingProgress,
    introFrame,
    entryFlash,
    scrollProgress,
    activeSectionLabel,
    cursorVisible,
    cursorHearts,
    onPointerMove,
    spawnCursorHeart,
  }
}
