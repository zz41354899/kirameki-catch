// Shared touch/pen gesture state. Vertical intent stays with the browser;
// horizontal intent drives Momo and suppresses the following synthetic click.
export function createMomoGesture() {
  let active = null
  let suppressClick = false
  const position = (event, rect, capture = false) => ({
    x: Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5)),
    y: Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5)),
    capture,
  })
  return {
    start(event) {
      if (event.isPrimary === false || event.button !== 0 || active) return false
      suppressClick = false
      if (event.pointerType === 'mouse') return false
      active = { id: event.pointerId, x: event.clientX, y: event.clientY, mode: 'pending' }
      return true
    },
    move(event, rect) {
      if (event.pointerType === 'mouse') {
        if (active) return null
        return position(event, rect)
      }
      if (!active || active.id !== event.pointerId) return null
      const dx = event.clientX - active.x, dy = event.clientY - active.y
      if (active.mode === 'pending' && Math.hypot(dx, dy) >= 9) {
        active.mode = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'drag' : 'scroll'
        suppressClick = true
      }
      if (active.mode === 'scroll') return null
      // Touch uses the exact mouse coordinate mapping, including first contact.
      // Intent detection only decides capture/click suppression, not motion.
      return position(event, rect, active.mode === 'drag')
    },
    end(event) {
      if (!active || active.id !== event.pointerId) return false
      if (event.type === 'pointercancel' || event.type === 'lostpointercapture') suppressClick = true
      active = null
      return true
    },
    blocksClick(event) { return event.detail !== 0 && suppressClick },
    get active() { return active !== null },
  }
}
