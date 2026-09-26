export function scrollToSection(sectionId, { focus = false } = {}) {
  const target = document.getElementById(sectionId)
  if (!target) return

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })

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
