import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createMomoSimulation, constrainSharedSurface } from './lib/momoRig.js'
import { createHairDynamics } from './lib/momoHair.js'
import { createAccessoryDynamics } from './lib/momoAccessories.js'
import { createMomoGesture } from './lib/momoGesture.js'
import { MOMO_CANVAS_PADDING, toMomoCanvas, momoBufferSize } from './lib/momoViewport.js'

const fullSurface = (rig) => rig.buildContinuousMesh(undefined, 64, 96)

function minimumAreaRatio(surface) {
  let minimum = Infinity
  for (let i = 0; i < surface.indices.length; i += 3) {
    const a = surface.indices[i] * 2, b = surface.indices[i + 1] * 2, c = surface.indices[i + 2] * 2
    const area = (v) => (v[b] - v[a]) * (v[c + 1] - v[a + 1]) - (v[b + 1] - v[a + 1]) * (v[c] - v[a])
    minimum = Math.min(minimum, area(surface.positions) / area(surface.rest))
  }
  return minimum
}

test('neutral pose reproduces the original texture coordinates without gaps or duplicate vertices', () => {
  const rig = createMomoSimulation()
  const surface = fullSurface(rig)
  rig.updateVertices(surface, 0, true)
  assert.deepEqual(surface.positions, surface.rest)
  assert.deepEqual(surface.uvs, surface.rest)
  const edges = new Map()
  for (let i = 0; i < surface.indices.length; i += 3) {
    const triangle = surface.indices.subarray(i, i + 3)
    for (let j = 0; j < 3; j += 1) {
      const a = triangle[j], b = triangle[(j + 1) % 3]
      const key = a < b ? `${a}:${b}` : `${b}:${a}`
      edges.set(key, (edges.get(key) ?? 0) + 1)
    }
  }
  assert.equal([...edges.values()].filter((count) => count === 1).length, 2 * (64 + 96))
  assert.ok([...edges.values()].every((count) => count === 1 || count === 2))
})

test('rapid pointer reversals, wave and long frame gaps keep every triangle facing forward', () => {
  const rig = createMomoSimulation()
  const surface = fullSurface(rig)
  let time = 0, minimum = Infinity, maximumHairTravel = 0
  for (let frame = 0; frame < 600; frame += 1) {
    const dt = frame % 79 === 0 ? 2000 : frame % 3 === 0 ? 33.33 : 16.67
    time += dt
    rig.setPointer(frame % 14 < 7 ? -1 : 1, frame % 20 < 10 ? 1 : -1)
    rig.setParameter('wave', (frame % 60) / 59)
    rig.updatePins(time, dt)
    const diagnostics = rig.updateVertices(surface, time)
    minimum = Math.min(minimum, minimumAreaRatio(surface))
    assert.ok(diagnostics.maxDisplacementGradient <= .650001)
    assert.ok(surface.positions.every(Number.isFinite))
    assert.ok(surface.positions.every((value) => toMomoCanvas(value) >= 0 && toMomoCanvas(value) <= 1), 'motion is clipped by canvas bounds')
    const hair = (40 * 65 + 8) * 2
    maximumHairTravel = Math.max(maximumHairTravel, Math.abs(surface.positions[hair] - surface.rest[hair]) * 1024)
  }
  assert.ok(minimum > .12, `collapsed/flipped triangle: ${minimum}`)
  assert.ok(maximumHairTravel > 5, `hair movement was disabled: ${maximumHairTravel}px`)
  console.log(JSON.stringify({ frames: 600, trianglesPerFrame: surface.indices.length / 3, minimumAreaRatio: minimum, maximumHairTravelPixels: maximumHairTravel }))
})

test('fold guard repairs an adversarial deformation and safely handles nonfinite coordinates', () => {
  const rig = createMomoSimulation()
  const surface = fullSurface(rig)
  surface.positions[1000] += 2
  assert.ok(minimumAreaRatio(surface) < 0)
  assert.ok(constrainSharedSurface(surface).motionScale < 1)
  assert.ok(minimumAreaRatio(surface) > 0)
  surface.positions[1000] = NaN
  constrainSharedSurface(surface)
  assert.deepEqual(surface.positions, surface.rest)
})

test('every hair chain, including ahoge, independently influences the shared mesh', () => {
  const rig = createMomoSimulation()
  const surface = fullSurface(rig)
  for (let chain = 0; chain < rig.hair.chains.length; chain += 1) {
    for (const pin of rig.hair.pins) pin.dx = pin.dy = 0
    rig.hair.pins[chain * 3 + 1].dx = .005
    rig.hair.pins[chain * 3 + 2].dx = .01
    let maximum = 0
    for (let vertex = 0; vertex < surface.rest.length / 2; vertex += 1) {
      maximum = Math.max(maximum, rig.hair.displacement(surface.hairBinding, vertex).x)
    }
    assert.ok(maximum > .001, `${rig.hair.chains[chain].id} has no usable influence`)
  }
  // Local hair controls must not deform the eyes/nose in the middle of the face.
  const faceBinding = rig.hair.bind(new Float32Array([.51, .19]))
  for (const pin of rig.hair.pins) pin.dx = pin.dy = .02
  assert.deepEqual(rig.hair.displacement(faceBinding, 0), { x: 0, y: 0 })
})

test('hair roots stay anchored while mids and tips develop different delayed motion', () => {
  const hair = createHairDynamics()
  let maximumAhoge = 0, maximumLag = 0
  for (let frame = 0; frame < 180; frame += 1) {
    const reverse = frame % 30 < 15 ? 1 : -1
    hair.update(frame * 16.67, 16.67, 30 * reverse, 2.4 * reverse)
    for (const pin of hair.pins.filter((pin) => !pin.depth)) {
      assert.equal(pin.dx, 0)
      assert.equal(pin.dy, 0)
    }
    maximumAhoge = Math.max(maximumAhoge, Math.abs(hair.pins[2].dx))
    maximumLag = Math.max(maximumLag, Math.abs(hair.pins[5].dx - hair.pins[4].dx))
  }
  assert.ok(maximumAhoge > .001, 'ahoge does not react')
  assert.ok(maximumAhoge < .0075, 'ahoge overextends into adjacent hair')
  assert.ok(maximumLag > .001, 'mid and tip move rigidly together')
})

test('regular pointer sweeps retain full motion instead of repeatedly hitting the fold limiter', () => {
  const rig = createMomoSimulation()
  const surface = fullSurface(rig)
  let limitedFrames = 0
  for (let frame = 0; frame < 360; frame += 1) {
    rig.setPointer(frame % 90 < 45 ? -.5 : .5, 0)
    rig.updatePins(frame * 16.67, 16.67)
    if (rig.updateVertices(surface, frame * 16.67).motionScale < .99) limitedFrames += 1
  }
  assert.equal(limitedFrames, 0, 'local hair strain is suppressing whole-character motion')
})

test('smoothed bangs bindings still exclude both eyes and the mouth on the render grid', () => {
  const rig = createMomoSimulation()
  const surface = fullSurface(rig)
  for (const pin of rig.hair.pins) pin.dx = pin.dy = .02
  for (const [x, y] of [[.478, .193], [.578, .175], [.535, .235]]) {
    const vertex = Math.round(y * 96) * 65 + Math.round(x * 64)
    const flow = rig.hair.displacement(surface.hairBinding, vertex)
    assert.ok(Math.hypot(flow.x, flow.y) < .000001, `local bangs motion leaked to face at ${x},${y}`)
  }
})

test('accessories bend independently while their own attachment remains fixed', () => {
  const motion = createAccessoryDynamics()
  for (const pin of motion.pins) {
    for (const other of motion.pins) other.rotation = 0
    pin.rotation = pin.angle
    const rest = new Float32Array([...pin.root, ...pin.tip])
    const binding = motion.bind(rest)
    const root = motion.displacement(binding, 0, ...pin.root)
    const tip = motion.displacement(binding, 1, ...pin.tip)
    assert.ok(Math.hypot(root.x, root.y) < 1e-8, `${pin.id} detached from its root`)
    assert.ok(Math.hypot(tip.x, tip.y) > .003, `${pin.id} has no visible tip response`)
  }
  for (const pin of motion.pins) pin.rotation = pin.angle
  const face = new Float32Array([.478, .193, .578, .175, .535, .235])
  const binding = motion.bind(face)
  for (let i = 0; i < 3; i += 1) {
    assert.deepEqual(motion.displacement(binding, i, face[i * 2], face[i * 2 + 1]), { x: 0, y: 0 })
  }
})

test('accessories retain follow-through after the pointer stops and stay bounded on long frames', () => {
  const motion = createAccessoryDynamics()
  for (let frame = 0; frame < 30; frame += 1) motion.update(frame * 16.67, 16.67, 2.4, 0)
  const released = motion.pins.map((pin) => pin.rotation)
  for (let frame = 30; frame < 42; frame += 1) motion.update(frame * 16.67, 16.67, 0, 0)
  assert.ok(motion.pins.every((pin, i) => Math.abs(pin.rotation - released[i]) > .001), 'secondary motion stopped instantly')
  assert.ok(Math.abs(motion.pins[2].rotation / motion.pins[2].angle - motion.pins[6].rotation / motion.pins[6].angle) > .1, 'ribbon and bell have identical timing')
  for (let frame = 0; frame < 300; frame += 1) {
    motion.update(frame * 500, 500, frame % 2 ? 2.4 : -2.4, (frame % 10) / 10)
    for (const pin of motion.pins) {
      assert.ok(Number.isFinite(pin.rotation) && Number.isFinite(pin.velocity))
      assert.ok(Math.abs(pin.rotation) <= pin.angle)
    }
  }
})

const touchEvent = (changes = {}) => ({ pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, clientX: 100, clientY: 200, ...changes })
const gestureRect = { left: 0, top: 0, width: 300, height: 450 }

test('canvas overscan preserves original placement and includes escaped opaque pixels', () => {
  for (const value of [-.028149, -.013897, 0, .5, 1, 1.015402]) {
    const mapped = toMomoCanvas(value)
    assert.ok(mapped >= 0 && mapped <= 1)
    assert.ok(Math.abs(-MOMO_CANVAS_PADDING + mapped * (1 + 2 * MOMO_CANVAS_PADDING) - value) < 1e-12)
  }
  assert.deepEqual(momoBufferSize(620, 930, 2), { width: 837, height: 1256 })
  assert.deepEqual(momoBufferSize(0, 0), { width: 2, height: 3 })
})

test('hero rig wrappers cannot clip the padded canvas after loading or at responsive breakpoints', () => {
  const css = readFileSync(new URL('./momo-official.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  let checked = 0
  for (const [, selector, declarations] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/\.hero-character(?:-rig|-stage)?(?=[\s.:#,\[]|$)/.test(selector)) continue
    checked += 1
    assert.doesNotMatch(declarations, /overflow(?:-[xy])?\s*:\s*(?:hidden|clip|auto|scroll)\b/, `${selector.trim()} clips the rig`)
    assert.doesNotMatch(declarations, /contain\s*:[^;]*(?:paint|strict|content)\b/, `${selector.trim()} creates a paint clip`)
  }
  assert.ok(checked > 5, 'the regression test must cover base, ready and responsive selectors')
})

test('touch follows the same absolute position as mouse and suppresses drag reactions', () => {
  const gesture = createMomoGesture()
  assert.equal(gesture.start(touchEvent()), true)
  const mouse = createMomoGesture()
  assert.deepEqual(gesture.move(touchEvent(), gestureRect), mouse.move(touchEvent({ pointerType: 'mouse' }), gestureRect))
  assert.deepEqual(gesture.move(touchEvent({ clientX: 104 }), gestureRect), mouse.move(touchEvent({ pointerType: 'mouse', clientX: 104 }), gestureRect))
  const movement = gesture.move(touchEvent({ clientX: 250, clientY: 203 }), gestureRect)
  const mouseMovement = mouse.move(touchEvent({ pointerType: 'mouse', clientX: 250, clientY: 203 }), gestureRect)
  assert.equal(movement.x, mouseMovement.x)
  assert.equal(movement.y, mouseMovement.y)
  assert.equal(movement.capture, true)
  assert.ok(movement.x > .3 && movement.y < .01)
  const rig = createMomoSimulation()
  rig.setPointer(movement.x, movement.y)
  for (let i = 0; i < 40; i += 1) rig.updatePins(i * 16.67, 16.67)
  assert.ok(rig.parameters.lookX > 10)
  assert.equal(gesture.end(touchEvent({ type: 'pointerup' })), true)
  rig.reset()
  for (let i = 40; i < 200; i += 1) rig.updatePins(i * 16.67, 16.67)
  assert.ok(Math.abs(rig.parameters.lookX) < .01)
  assert.equal(gesture.blocksClick({ detail: 1 }), true)
  assert.equal(gesture.blocksClick({ detail: 0 }), false, 'keyboard activation must remain available')
  gesture.start(touchEvent())
  gesture.end(touchEvent({ type: 'pointerup' }))
  assert.equal(gesture.blocksClick({ detail: 1 }), false, 'a fresh tap should still activate a reaction')
})

test('vertical scrolling, cancellation, multi-touch and pen input do not leave a stuck gesture', () => {
  const gesture = createMomoGesture()
  gesture.start(touchEvent())
  assert.equal(gesture.start(touchEvent({ pointerId: 2, isPrimary: false })), false)
  assert.equal(gesture.move(touchEvent({ clientY: 245 }), gestureRect), null)
  assert.equal(gesture.move(touchEvent({ clientX: 250, clientY: 250 }), gestureRect), null, 'scroll intent must stay locked')
  assert.equal(gesture.end(touchEvent({ type: 'pointercancel' })), true)
  assert.equal(gesture.active, false)
  assert.equal(gesture.blocksClick({ detail: 1 }), true)
  assert.equal(gesture.move(touchEvent({ clientX: 200 }), gestureRect), null)
  gesture.start(touchEvent({ pointerType: 'pen' }))
  assert.equal(gesture.move(touchEvent({ pointerType: 'pen', clientX: 200 }), gestureRect).capture, true)
  gesture.end(touchEvent({ type: 'lostpointercapture' }))
  assert.equal(gesture.active, false)
  assert.equal(gesture.start(touchEvent({ pointerType: 'mouse' })), false)
  assert.equal(gesture.move(touchEvent({ pointerType: 'mouse', clientX: 300 }), gestureRect).x, .5)
})
