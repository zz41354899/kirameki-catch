export function scrollToSection(sectionId, { focus = false, instant = false } = {}) {
  const target = document.getElementById(sectionId)
  if (!target) return

  const behavior = instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  // A pinned Hero is wrapped by a GSAP spacer. scrollIntoView() can target the
  // transformed element inside that spacer and stop at the animation's end state.
  if (sectionId === 'top') window.scrollTo({ top: 0, behavior })
  else target.scrollIntoView({ behavior, block: 'start' })

  if (focus) {
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }
}

export function removeLocationHash() {
  if (!window.location.hash) return

  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}`,
  )
}
