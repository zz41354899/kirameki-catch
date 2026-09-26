import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'

gsap.registerPlugin(ScrollTrigger, Draggable)

// Page effects live in one scoped context. Each lesson can be removed independently.
export function useMomoMotion(root, heroFrame, motionOff) {
  let media, reaction, context, alive = true, observer
  const listeners = []
  const listen = (target, name, fn) => {
    target.addEventListener(name, fn)
    listeners.push(() => target.removeEventListener(name, fn))
  }
  function setup() {
    media?.revert()
    listeners.splice(0).forEach(fn => fn())
    media = gsap.matchMedia()
    media.add({ reduce: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 900px)', always: '(min-width: 0px)' }, ({ conditions }) => {
      const q = gsap.utils.selector(root.value)
      const quiet = conditions.reduce || motionOff.value
      if (!quiet) {
        // 01: entrance timeline + stagger. Only transform/opacity; text remains semantic.
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from(q('.hero-enter'), { y: 38, opacity: 0, stagger: .09, duration: .8, clearProps: 'all' })
          .from(q('.hero-actor'), { y: 70, rotation: -7, opacity: 0, duration: 1, ease: 'back.out(1.3)', clearProps: 'all' }, .15)
        // 02: scrub links native scroll position to spatial movement, no scroll hijacking.
        gsap.to(q('.hero-backword'), { xPercent: -8, ease: 'none', scrollTrigger: { trigger: q('.momo-hero')[0], start: 'top top', end: 'bottom top', scrub: .6 } })
        gsap.to(q('.ticker-track'), { xPercent: -18, ease: 'none', scrollTrigger: { trigger: q('.momo-ticker')[0], start: 'top bottom', end: 'bottom top', scrub: .4 } })
        q('.reveal').forEach(el => gsap.from(el, { y: 45, opacity: 0, duration: .75, clearProps: 'all', scrollTrigger: { trigger: el, start: 'top 93%', once: true } }))
        q('.moment-card').forEach((el, i) => gsap.from(el, { y: 70, rotation: i % 2 ? 5 : -5, duration: .8, clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 95%', once: true } }))
        // 03: quickTo reuses tweens; bounds-based pointer coordinates prevent drift.
        if (conditions.desktop && matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const hero = q('.momo-hero')[0], actor = q('.actor-parallax')[0]
          const x = gsap.quickTo(actor, 'x', { duration: .65, ease: 'power3.out' })
          const y = gsap.quickTo(actor, 'y', { duration: .65, ease: 'power3.out' })
          listen(hero, 'pointermove', e => {
            const r = hero.getBoundingClientRect()
            x(((e.clientX - r.left) / r.width - .5) * 32)
            y(((e.clientY - r.top) / r.height - .5) * 20)
          })
          listen(hero, 'pointerleave', () => { x(0); y(0) })
          q('[data-magnetic]').forEach(button => {
            const inner = button.firstElementChild
            const mx = gsap.quickTo(inner, 'x', { duration: .35 }), my = gsap.quickTo(inner, 'y', { duration: .35 })
            listen(button, 'pointermove', e => { const r = button.getBoundingClientRect(); mx((e.clientX-r.left-r.width/2)*.14); my((e.clientY-r.top-r.height/2)*.16) })
            listen(button, 'pointerleave', () => { mx(0); my(0) })
          })
        }
      }
      // 04: Draggable is also usable when reduced motion is enabled: direct manipulation.
      const sticker = q('.draggable-momo')[0], board = q('.fan-card')[0]
      const drag = Draggable.create(sticker, { type: 'x,y', bounds: board, edgeResistance: 1, allowEventDefault: true,
        onDragStart() { sticker.classList.add('is-dragging') },
        onDragEnd() { sticker.classList.remove('is-dragging') },
      })[0]
      const clampSticker = () => { drag.applyBounds(board) }
      observer?.disconnect()
      observer = new ResizeObserver(clampSticker)
      observer.observe(board)
      listen(sticker, 'keydown', e => {
        const shifts = { ArrowLeft: [-12,0], ArrowRight: [12,0], ArrowUp: [0,-12], ArrowDown: [0,12] }
        if (!shifts[e.key]) return
        e.preventDefault()
        const [dx,dy] = shifts[e.key]
        gsap.set(sticker, { x: Number(gsap.getProperty(sticker,'x')) + dx, y: Number(gsap.getProperty(sticker,'y')) + dy })
        drag.update(); drag.applyBounds(board)
      })
      listen(q('.reset-sticker')[0], 'click', () => { gsap.set(sticker, { x: 0, y: 0 }); drag.update(); drag.applyBounds(board) })
      ScrollTrigger.refresh()
      return () => { observer?.disconnect(); listeners.splice(0).forEach(fn => fn()) }
    }, root.value)
  }
  onMounted(() => {
    context = gsap.context(() => {}, root.value)
    document.fonts.ready.then(() => { if (alive) setup() })
  })
  function react(frame = 4) {
    reaction?.kill()
    heroFrame.value = frame
    if (motionOff.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    context?.add(() => {
      reaction = gsap.timeline().fromTo('.actor-response', { y: 0, scale: .97, rotation: -2 }, { y: -18, scale: 1, rotation: 2, duration: .25, ease: 'power2.out' })
        .to('.actor-response', { y: 0, rotation: 0, duration: .55, ease: 'bounce.out' })
    })
  }
  onBeforeUnmount(() => { alive = false; reaction?.kill(); media?.revert(); context?.revert(); observer?.disconnect(); listeners.splice(0).forEach(fn => fn()) })
  return { react, refresh: setup }
}
