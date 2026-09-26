import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export function useStageMotion(root) {
  let media
  onMounted(() => {
    media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const select = gsap.utils.selector(root.value)
      const cleanup = []
      const listen = (el, event, fn) => { el.addEventListener(event, fn); cleanup.push(() => el.removeEventListener(event, fn)) }
      gsap.from(select('.entrance'), { y: 45, opacity: 0, duration: .9, stagger: .075, ease: 'power4.out', clearProps: 'transform,opacity' })
      gsap.from(select('.hero-art'), { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power4.inOut', clearProps: 'clipPath' })
      gsap.from(select('.hero-impact'), { scale: 1.6, rotation: -18, opacity: 0, delay: .65, duration: .55, ease: 'expo.out' })
      gsap.to(select('.hero-progress'), { scaleX: 1, ease: 'none', scrollTrigger: { trigger: select('.hero')[0], start: 'top top', end: 'bottom top', scrub: true } })
      gsap.timeline({ scrollTrigger: { trigger: select('.hero')[0], start: 'top top', end: 'bottom top', scrub: .7 } })
        .to(select('.hero-copy'), { y: -85, opacity: .15, ease: 'none' }, 0)
        .to(select('.character'), { y: 110, rotation: 5, scale: 1.12, ease: 'none' }, 0)
        .to(select('.hero-backtype'), { xPercent: -14, ease: 'none' }, 0)
        .to(select('.hero-impact'), { y: -160, rotation: 12, ease: 'none' }, 0)
      gsap.to(select('.ticker > div'), { x: -380, ease: 'none', scrollTrigger: { trigger: select('.ticker')[0], start: 'top bottom', end: 'bottom top', scrub: .5 } })
      gsap.utils.toArray(select('.reveal')).forEach(el => gsap.from(el, { y: 45, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }))
      gsap.from(select('.instruction-card'), { y: 70, rotation: i => (i - 1) * 5, opacity: 0, stagger: .13, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: select('.instructions')[0], start: 'top 85%', once: true } })
      gsap.to(select('.character-portrait img'), { y: -38, scale: 1.09, ease: 'none', scrollTrigger: { trigger: select('.character-section')[0], start: 'top bottom', end: 'bottom top', scrub: .8 } })
      gsap.from(select('.closing h2'), { y: 60, scale: .88, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: select('.closing')[0], start: 'top 80%', once: true } })

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const hero = select('.hero')[0]
        const image = select('.hero-parallax')[0]
        const halo = select('.art-halo')[0]
        const x = gsap.quickTo(image, 'x', { duration: .75, ease: 'power3.out' })
        const y = gsap.quickTo(image, 'y', { duration: .75, ease: 'power3.out' })
        const hx = gsap.quickTo(halo, 'x', { duration: 1.2, ease: 'power3.out' })
        listen(hero, 'pointermove', e => {
          const r = hero.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5
          x(dx * 32); y(dy * 22); hx(-dx * 28)
        })
        listen(hero, 'pointerleave', () => { x(0); y(0); hx(0) })
        select('.play-button, .small-play').forEach(button => {
          const bx = gsap.quickTo(button, 'x', { duration: .4, ease: 'power3.out' })
          const by = gsap.quickTo(button, 'y', { duration: .4, ease: 'power3.out' })
          listen(button, 'pointermove', e => { const r = button.getBoundingClientRect(); bx((e.clientX-r.left-r.width/2)*.12); by((e.clientY-r.top-r.height/2)*.18) })
          listen(button, 'pointerleave', () => { bx(0); by(0) })
        })
        select('.instruction-card').forEach(card => {
          const tiltX = gsap.quickTo(card, 'rotationX', {duration:.45,ease:'power2.out'})
          const tiltY = gsap.quickTo(card, 'rotationY', {duration:.45,ease:'power2.out'})
          gsap.set(card, {transformPerspective:700})
          listen(card, 'pointermove', e => { const r = card.getBoundingClientRect(); tiltX(-(e.clientY-r.top-r.height/2)/r.height*8); tiltY((e.clientX-r.left-r.width/2)/r.width*8) })
          listen(card, 'pointerleave', () => { tiltX(0); tiltY(0) })
        })
      }
      return () => cleanup.forEach(fn => fn())
    }, root.value)
  })
  onBeforeUnmount(() => media?.revert())
}
