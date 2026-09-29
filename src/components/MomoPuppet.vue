<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createMomoSimulation } from '../lib/momoRig.js'
import { MOMO_CANVAS_PADDING, momoBufferSize } from '../lib/momoViewport.js'

defineProps({ alt: { type: String, default: '' } })
const emit = defineEmits(['ready', 'error'])

const canvas = ref(null)
const ready = ref(false)
const simulation = createMomoSimulation()
const { textureSize, pins, setPointer, setParameter, reset, wave, updatePins, buildContinuousMesh, updateVertices } = simulation
defineExpose({ setPointer, setParameter, reset, wave })

let gl
let program
let mesh
let inspectMode
let positionLocation
let textureLocation
let frameId
let resizeObserver
let visibilityObserver
let stopped = false
let visible = true
let lastFrameTime = 0
let resizePending = true
const canvasStyle = {
  left: `${-MOMO_CANVAS_PADDING * 100}%`, top: `${-MOMO_CANVAS_PADDING * 100}%`,
  width: `${(1 + 2 * MOMO_CANVAS_PADDING) * 100}%`, height: `${(1 + 2 * MOMO_CANVAS_PADDING) * 100}%`,
}

function createShader(type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'MomoRig shader compile failed')
  return shader
}

function createProgram() {
  const vertex = createShader(gl.VERTEX_SHADER, `
    attribute vec2 a_position;
    attribute vec2 a_texture;
    varying vec2 v_texture;
    void main() {
      vec2 position = (a_position + vec2(${MOMO_CANVAS_PADDING})) / ${1 + 2 * MOMO_CANVAS_PADDING};
      gl_Position = vec4(position.x * 2.0 - 1.0, 1.0 - position.y * 2.0, 0.0, 1.0);
      v_texture = a_texture;
    }
  `)
  const fragment = createShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_texture;
    void main() { gl_FragColor = texture2D(u_image, v_texture); }
  `)
  const next = gl.createProgram()
  gl.attachShader(next, vertex)
  gl.attachShader(next, fragment)
  gl.linkProgram(next)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(next, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(next) || 'MomoRig shader link failed')
  return next
}

async function loadImage(src) {
  const image = new window.Image()
  image.decoding = 'async'
  image.src = src
  await image.decode()
  return image
}

function createTexture(image) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  return texture
}

function uploadMesh(targetMesh, images) {
  targetMesh.positionBuffer = gl.createBuffer()
  targetMesh.uvBuffer = gl.createBuffer()
  targetMesh.indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, targetMesh.positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, targetMesh.positions, gl.DYNAMIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, targetMesh.uvBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, targetMesh.uvs, gl.STATIC_DRAW)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, targetMesh.indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, targetMesh.indices, gl.STATIC_DRAW)
  targetMesh.texture = createTexture(images.visible)
}

function resizeCanvas() {
  if (!resizePending || !canvas.value || !gl) return
  // Layout dimensions exclude GSAP's breathing/scale transforms. Reading the
  // transformed rect each frame used to repeatedly clear/reallocate the buffer.
  const { width, height } = momoBufferSize(canvas.value.clientWidth, canvas.value.clientHeight, window.devicePixelRatio)
  if (canvas.value.width !== width) canvas.value.width = width
  if (canvas.value.height !== height) canvas.value.height = height
  gl.viewport(0, 0, width, height)
  resizePending = false
}

function drawMesh(targetMesh, texture) {
  gl.bindBuffer(gl.ARRAY_BUFFER, targetMesh.positionBuffer)
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, targetMesh.positions)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, targetMesh.uvBuffer)
  gl.enableVertexAttribArray(textureLocation)
  gl.vertexAttribPointer(textureLocation, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, targetMesh.indexBuffer)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.drawElements(gl.TRIANGLES, targetMesh.indices.length, gl.UNSIGNED_SHORT, 0)
}

function draw(time) {
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const diagnostics = updateVertices(mesh, time, inspectMode === 'rest')
  drawMesh(mesh, mesh.texture)
  if (inspectMode) {
    canvas.value.dataset.motionScale = diagnostics.motionScale.toFixed(4)
    canvas.value.dataset.displacementGradient = diagnostics.maxDisplacementGradient.toFixed(4)
  }
}

function render(time) {
  if (stopped) return
  frameId = window.requestAnimationFrame(render)
  if (!visible || !gl || !ready.value || time - lastFrameTime < 15) return
  const deltaTime = lastFrameTime ? time - lastFrameTime : 16.67
  lastFrameTime = time
  if (inspectMode === 'stress') {
    setPointer(Math.sin(time / 170), Math.cos(time / 230))
    setParameter('wave', (time % 1150) / 1150)
  }
  if (inspectMode !== 'rest') updatePins(time, deltaTime)
  resizeCanvas()
  draw(time)
}

function releaseWebGL() {
  if (!gl) return
  for (const targetMesh of [mesh].filter(Boolean)) {
    if (targetMesh.texture) gl.deleteTexture(targetMesh.texture)
    if (targetMesh.positionBuffer) gl.deleteBuffer(targetMesh.positionBuffer)
    if (targetMesh.uvBuffer) gl.deleteBuffer(targetMesh.uvBuffer)
    if (targetMesh.indexBuffer) gl.deleteBuffer(targetMesh.indexBuffer)
  }
  if (program) gl.deleteProgram(program)
  gl = undefined
}

async function initialize() {
  inspectMode = import.meta.dev ? new URLSearchParams(window.location.search).get('rigInspect') : null
  const masterImage = await loadImage('/images/momo-moon-rabbit-hero-v2.webp')
  if (stopped || !canvas.value) return false
  if (masterImage.naturalWidth !== textureSize.width || masterImage.naturalHeight !== textureSize.height) throw new Error('Unexpected Momo texture dimensions')
  gl = canvas.value.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' })
  if (!gl) throw new Error('WebGL is unavailable')
  program = createProgram()
  gl.useProgram(program)
  positionLocation = gl.getAttribLocation(program, 'a_position')
  textureLocation = gl.getAttribLocation(program, 'a_texture')
  gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.disable(gl.DEPTH_TEST)
  mesh = buildContinuousMesh(
    { kind: 'master', id: 'master', x: 0, y: 0, width: textureSize.width, height: textureSize.height },
    64,
    96,
  )
  uploadMesh(mesh, { visible: masterImage })
  resizeCanvas()
  draw(0)
  return true
}

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  try {
    const initialized = await initialize()
    if (!initialized || stopped || !canvas.value) return
    // Buffer resizing must occur immediately before drawing, never in an
    // observer callback that could leave a cleared canvas for a display frame.
    resizeObserver = new ResizeObserver(() => { resizePending = true })
    resizeObserver.observe(canvas.value)
    visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting !== false }, { rootMargin: '160px' })
    visibilityObserver.observe(canvas.value)
    ready.value = true
    emit('ready', { runtime: 'momo-shared-surface-v4', meshes: 1, pins: pins.length + simulation.hair.pins.length + simulation.accessories.pins.length, hairZones: simulation.hair.chains.length })
    frameId = window.requestAnimationFrame(render)
  } catch (error) {
    console.error('Momo shared surface failed to load', error)
    emit('error', error)
    releaseWebGL()
  }
})

onBeforeUnmount(() => {
  stopped = true
  window.cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  releaseWebGL()
})
</script>

<template>
  <div class="momo-rig-v2" :class="{ 'is-ready': ready }">
    <canvas ref="canvas" class="momo-rig-v2__canvas" :style="canvasStyle" data-renderer="shared-surface-v4" :data-canvas-padding="MOMO_CANVAS_PADDING" :data-hair-zones="simulation.hair.chains.length" :data-hair-pins="simulation.hair.pins.length" :data-accessory-zones="simulation.accessories.pins.length" aria-hidden="true" />
    <img class="momo-rig-v2__fallback" src="/images/momo-moon-rabbit-hero-v2.webp" :alt="alt" draggable="false" />
  </div>
</template>

<style scoped>
.momo-rig-v2,
.momo-rig-v2__canvas,
.momo-rig-v2__fallback { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.momo-rig-v2 { pointer-events: none; user-select: none; }
.momo-rig-v2__canvas { opacity: 0; }
.momo-rig-v2__fallback { object-fit: fill; -webkit-user-drag: none; }
.is-ready .momo-rig-v2__canvas { opacity: 1; }
.is-ready .momo-rig-v2__fallback { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .momo-rig-v2__canvas { display: none; }
}
</style>
