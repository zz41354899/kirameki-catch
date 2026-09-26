import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(ScrollTrigger, SplitText)

export function useWorldMotion(root) {
  let media, reaction, entrance, alive = true, revealed = false
  const pulses = new Map()
  onMounted(() => {
    reaction = gsap.context(self => {
      self.add('respond', (scope = '.key-visual') => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const host = root.value?.querySelector(scope)
        if (!host) return
        pulses.get(scope)?.kill()
        const actor = host.querySelector('.momo-sprite')
        const sparks = host.querySelectorAll('.reaction-spark')
        const pulse = gsap.timeline({ defaults: { overwrite: 'auto' } })
          .fromTo(actor, { scale: .96 }, { scale: 1, duration: .65, ease: 'elastic.out(1,.5)' })
        if (sparks.length) pulse.fromTo(sparks, { x: 0, y: 0, opacity: 1, scale: .3 }, {
          x: i => Math.cos(i * Math.PI / 4) * 120,
          y: i => Math.sin(i * Math.PI / 4) * 150,
          rotation: i => i * 38, scale: 1.1, opacity: 0,
          duration: .8, ease: 'power2.out', stagger: .015,
        }, 0)
        pulses.set(scope, pulse)
      })
    }, root.value)
    document.fonts.ready.then(() => {
      if (!alive) return
      media = gsap.matchMedia()
      media.add({ always: '(min-width: 0px)', reduce: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 761px)' }, context => {
        entrance = null
        if (context.conditions.reduce) return
        const select = gsap.utils.selector(root.value)
        const cleanup = []
        const listen = (element, event, handler) => {
          element.addEventListener(event, handler)
          cleanup.push(() => element.removeEventListener(event, handler))
        }
        entrance = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        select('.title-split').forEach(el => {
          const split = SplitText.create(el, { type: 'chars', aria: 'auto', charsClass: 'split-glyph' })
          entrance.from(split.chars, { yPercent: 45, rotation: -6, opacity: 0, stagger: .06, duration: .65, clearProps: 'transform,opacity' }, .12)
        })
        entrance.from(select('.hero-arrive'), { y: 25, opacity: 0, stagger: .045, duration: .7, clearProps: 'transform,opacity' }, 0)
        if (revealed) entrance.progress(1)
        select('.scroll-phrase').forEach(el => {
          const split = SplitText.create(el, { type: 'chars', aria: 'auto', charsClass: 'story-glyph' })
          gsap.from(split.chars, { opacity: .23, stagger: .07, ease: 'none', scrollTrigger: { trigger: el, start: 'top 88%', end: 'bottom 52%', scrub: .35 } })
        })
        select('.section-reveal').forEach(el => gsap.from(el, { y: 35, opacity: 0, duration: .8, clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }))
        if (context.conditions.desktop) {
          gsap.to(select('.hero-giant-type'), { y: -95, ease: 'none', scrollTrigger: { trigger: select('.world-hero')[0], start: 'top top', end: 'bottom top', scrub: .6 } })
          gsap.to(select('.key-arch'), { rotation: 3, ease: 'none', scrollTrigger: { trigger: select('.world-hero')[0], start: 'top top', end: 'bottom top', scrub: .7 } })
          if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            const visual = select('.key-visual')[0]
            const actor = visual.querySelector('.hero-parallax')
            const x = gsap.quickTo(actor, 'x', { duration: .6, ease: 'power3.out' })
            const y = gsap.quickTo(actor, 'y', { duration: .6, ease: 'power3.out' })
            listen(visual, 'pointermove', event => {
              const box = visual.getBoundingClientRect()
              x(((event.clientX - box.left) / box.width - .5) * 18)
              y(((event.clientY - box.top) / box.height - .5) * 12)
            })
            listen(visual, 'pointerleave', () => { x(0); y(0) })
          }
        }
        ScrollTrigger.refresh()
        return () => { cleanup.forEach(fn => fn()); entrance = null }
      }, root.value)
    })
  })
  onBeforeUnmount(() => { alive = false; media?.revert(); reaction?.revert(); pulses.clear() })
  return {
    respond: scope => reaction?.respond(scope),
    reveal: () => {
      if (revealed) return
      revealed = true
      entrance?.play()
      ScrollTrigger.refresh()
    },
  }
}
