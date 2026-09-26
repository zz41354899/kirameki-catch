<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import MomoSprite from './MomoSprite.vue'

const emit = defineEmits(['complete'])
const opening = ref(null)
const skipButton = ref(null)
const title = [...'把今天，變可愛。']
let context, timeline, preference, fallback
let completed = false

function finish() {
  if (completed) return
  completed = true
  window.clearTimeout(fallback)
  timeline?.pause()
  emit('complete')
}

function handleKeys(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    finish()
  } else if (event.key === 'Tab') {
    event.preventDefault()
    skipButton.value?.focus({ preventScroll: true })
  }
}

function preferenceChanged(event) { if (event.matches) finish() }

onMounted(() => {
  // The parent owns page inertness, scroll locking and session persistence.
  skipButton.value?.focus({ preventScroll: true })
  fallback = window.setTimeout(finish, 4500)
  preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  preference.addEventListener('change', preferenceChanged)
  if (preference.matches) { finish(); return }

  context = gsap.context(() => {
    timeline = gsap.timeline({ onComplete: finish, defaults: { ease: 'power3.out' } })
    timeline
      .from('.opening-eyebrow', { opacity: 0, y: 8, duration: 0.35 }, 0.05)
      .fromTo('.letter-stack', { opacity: 0, y: 65, scale: 0.78, rotation: -13 },
        { opacity: 1, y: 0, scale: 1, rotation: -4, duration: 0.68, ease: 'back.out(1.2)' }, 0.1)
      .fromTo('.letter-seal', { scale: 0 },
        { scale: 1, duration: 0.34, ease: 'back.out(2.2)' }, 0.26)
      .to('.letter-seal', { scale: 1.18, duration: 0.16, ease: 'power2.out' }, 0.64)
      .to('.letter-seal', { scale: 0.6, opacity: 0, y: -18, duration: 0.2 }, 0.8)
      .to('.letter-flap', { rotationX: -176, duration: 0.45, ease: 'power2.inOut' }, 0.77)
      .set('.letter-flap', { zIndex: 1 }, 1.02)
      .fromTo('.invitation-card', { y: 125, rotation: -2, opacity: 0 },
        { y: -32, rotation: 5, opacity: 1, duration: 0.65, ease: 'back.out(1.1)' }, 0.91)
      .fromTo('.opening-momo', { y: 34, scale: 0.92, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.52, ease: 'back.out(1.2)' }, 1.02)
      .fromTo('.invitation-spark', { scale: 0, rotation: -25, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.42, stagger: 0.07, ease: 'back.out(1.8)' }, 1.12)
      .from('.opening-title-character', { opacity: 0, yPercent: 60, rotation: -7, duration: 0.4, stagger: 0.04, ease: 'back.out(1.3)' }, 1.33)
      .from('.opening-message', { opacity: 0, y: 8, duration: 0.35 }, 1.68)
      .to('.opening-composition', { opacity: 0, y: -20, scale: 0.97, duration: 0.3, ease: 'power2.in' }, 2.34)
      .to('.opening-frame, .opening-corner', { opacity: 0, duration: 0.22 }, 2.48)
      .to('.opening-skip', { opacity: 0, duration: 0.2 }, 2.9)
      .to('.opening-paper-top', { yPercent: -102, duration: 0.65, ease: 'power3.inOut' }, 2.48)
      .to('.opening-paper-bottom', { yPercent: 102, duration: 0.65, ease: 'power3.inOut' }, 2.48)
  }, opening.value)
})

onBeforeUnmount(() => {
  completed = true
  window.clearTimeout(fallback)
  preference?.removeEventListener('change', preferenceChanged)
  context?.revert()
})
</script>

<template>
  <div ref="opening" class="opening-invite" role="dialog" aria-modal="true" aria-labelledby="opening-title" aria-describedby="opening-description" @keydown="handleKeys">
    <div class="opening-paper opening-paper-top" aria-hidden="true"></div>
    <div class="opening-paper opening-paper-bottom" aria-hidden="true"></div>
    <div class="opening-frame" aria-hidden="true"></div>
    <p class="opening-corner" aria-hidden="true"><span>♡</span> A LITTLE LETTER<br><small>FROM HOSHINO MOMO</small></p>

    <div class="opening-composition">
      <p class="opening-eyebrow"><span aria-hidden="true">✧</span> モモ寄來一封心動邀請 <span aria-hidden="true">✧</span></p>
      <div class="invitation-scene" aria-hidden="true">
        <span class="invitation-spark invitation-spark-one">✦</span>
        <span class="invitation-spark invitation-spark-two">♡</span>
        <span class="invitation-spark invitation-spark-three">✧</span>
        <span class="invitation-spark invitation-spark-four">✦</span>

        <div class="letter-stack">
          <div class="letter-back"></div>
          <div class="invitation-card">
            <div class="card-inner-line"></div>
            <span class="card-kicker">YOU'RE INVITED!</span>
            <span class="card-halo"></span>
            <div class="opening-momo"><MomoSprite :frame="4" /></div>
            <span class="card-signature">Momo <i>♡</i></span>
          </div>
          <div class="letter-flap">
            <svg viewBox="0 0 320 114" fill="none"><path d="M1 1H319L177 105Q160 117 143 105Z" fill="#ffc7d9" stroke="#d97196" stroke-width="1.5"/><path d="M17 7L148 97Q160 105 172 97L303 7" stroke="#fff4e7" stroke-width="1"/></svg>
          </div>
          <svg class="letter-front" viewBox="0 0 320 188" fill="none"><path d="M1 1L160 104L319 1V177Q319 187 309 187H11Q1 187 1 177Z" fill="#fff7e7" stroke="#d97196" stroke-width="1.5"/><path d="M4 183L120 107M316 183L200 107" stroke="#e8b7c3" stroke-width="1"/><path d="M14 173H50" stroke="#e8b7c3" stroke-width="1.5"/></svg>
          <span class="letter-address">給今天的你 <i>♡</i></span>
          <div class="letter-seal"><span>♥</span></div>
        </div>
      </div>

      <h2 id="opening-title" class="opening-title" aria-label="把今天，變可愛。"><span v-for="(character, index) in title" :key="index" class="opening-title-character" :class="{ 'title-pink': index > 3 }" aria-hidden="true">{{ character }}</span></h2>
      <p id="opening-description" class="opening-message">你的專屬小劇場，現在開演。</p>
    </div>

    <button ref="skipButton" class="opening-skip" type="button" @click="finish">跳過開場 <span aria-hidden="true">↗</span></button>
  </div>
</template>

<style scoped>
.opening-invite{--invite-pink:#c54577;--invite-cream:#fffaf0;position:fixed;inset:0;z-index:10000;isolation:isolate;display:grid;place-items:center;overflow:hidden;color:#6b3e54;font-family:'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif}
.opening-paper{position:absolute;left:0;width:100%;height:50.1%;background-color:var(--invite-cream);z-index:-2;background-image:radial-gradient(#eebac64d .8px,transparent .8px);background-size:15px 15px;will-change:transform}
.opening-paper-top{top:0;background-color:#fff7ed}
.opening-paper-bottom{bottom:0}
.opening-frame{position:absolute;inset:22px;border:1px solid #e6b8c6;border-radius:12px;pointer-events:none}
.opening-frame:before,.opening-frame:after{content:'✦';position:absolute;color:#d46b90;font-size:16px;background:var(--invite-cream);padding:0 8px;top:-12px;left:50%;transform:translateX(-50%)}
.opening-frame:after{top:auto;bottom:-12px}
.opening-corner{position:absolute;top:43px;left:48px;margin:0;font:700 9px/1.7 'DM Sans',sans-serif;letter-spacing:1.4px;color:#a37086}
.opening-corner>span{float:left;font:25px/1.2 Georgia,serif;margin:2px 10px 0 0;color:#c95b83}
.opening-corner small{font-size:7px;letter-spacing:1.6px}
.opening-composition{width:min(660px,92vw);text-align:center;position:relative;transform:translateY(-3px);padding-top:30px}
.opening-eyebrow{font-size:11px;font-weight:800;letter-spacing:.13em;margin:0 0 31px;color:#b06a84}
.opening-eyebrow>span{display:inline-block;font-size:19px;vertical-align:-2px;margin:0 13px;color:#d47b98}
.invitation-scene{position:relative;width:350px;height:315px;margin:0 auto;perspective:1100px}
.letter-stack{position:absolute;width:290px;height:171px;bottom:13px;left:30px;isolation:isolate;perspective:1000px;transform-origin:50% 80%}
.letter-back{position:absolute;inset:0;background:#f6abc4;border:1.5px solid #d97196;border-radius:7px;box-shadow:0 13px 26px #bc6b8820;z-index:0}
.letter-flap{position:absolute;left:0;top:0;width:100%;height:104px;transform-origin:center top;z-index:4;backface-visibility:visible}
.letter-flap svg{display:block;width:100%;height:100%;overflow:visible}
.letter-front{position:absolute;inset:0;width:100%;height:100%;z-index:3;overflow:visible}
.letter-address{position:absolute;right:32px;bottom:23px;z-index:4;font-size:10px;font-weight:800;letter-spacing:2px;color:#b46480}
.letter-address i{font:17px Georgia,serif;font-style:normal;margin-left:7px}
.letter-seal{position:absolute;left:calc(50% - 24px);top:69px;width:48px;height:48px;display:grid;place-items:center;background:#d45481;border:4px double #ee93b1;border-radius:50%;box-shadow:0 3px 5px #9b456322;z-index:5;transform-origin:center}
.letter-seal span{font:24px/1 Georgia,serif;color:#fff2de}
.invitation-card{position:absolute;left:27px;bottom:0;width:236px;height:282px;background:#fffdf7;border:1.5px solid #dd9db5;border-radius:10px 10px 3px 3px;box-shadow:0 6px 12px #bb6b8814;z-index:2;overflow:hidden;transform-origin:50% 100%}
.card-inner-line{position:absolute;inset:7px;border:1px solid #f1cfdb;border-radius:6px 6px 0 0}
.card-kicker{position:absolute;top:17px;left:0;width:100%;font:700 8px 'DM Sans',sans-serif;letter-spacing:2px;color:#cb7d99;z-index:2}
.card-halo{position:absolute;width:195px;height:195px;top:47px;left:19px;border-radius:50%;background:#fff0b9;border:1px dashed #eec86f}
.opening-momo{position:absolute;height:249px;aspect-ratio:3/4;bottom:1px;left:25px;filter:drop-shadow(2px 2px 0 #fff9ed);z-index:2;transform-origin:50% 90%}
.opening-momo :deep(.momo-sprite){height:100%;width:100%}
.card-signature{position:absolute;bottom:19px;right:17px;font:italic 18px Georgia,serif;transform:rotate(-8deg);color:#b8406b;z-index:3}
.card-signature i{font-size:16px;font-style:normal}
.invitation-spark{position:absolute;line-height:1;z-index:7;pointer-events:none;transform-origin:center}
.invitation-spark-one{top:35px;left:-7px;font-size:46px;color:#e6bf53}
.invitation-spark-two{top:87px;right:-9px;font-size:34px;color:#d86a95;font-family:Georgia,serif;transform:rotate(15deg)}
.invitation-spark-three{bottom:26px;left:-10px;font-size:32px;color:#d5809f}
.invitation-spark-four{top:4px;right:22px;font-size:22px;color:#deb643}
.opening-title{font-size:clamp(27px,4.5vw,43px);font-weight:900;line-height:1.4;letter-spacing:-.055em;margin:22px 0 10px;color:#784354;white-space:nowrap}
.opening-title-character{display:inline-block;transform-origin:50% 100%}
.opening-title-character.title-pink{color:var(--invite-pink)}
.opening-message{font-size:11px;font-weight:600;letter-spacing:.13em;color:#aa7288;margin:0}
.opening-skip{position:absolute;right:45px;bottom:39px;display:flex;align-items:center;gap:24px;min-height:42px;padding:8px 16px;background:#fffaf0;border:1px solid #d693ad;border-radius:30px;font-size:11px;font-weight:800;letter-spacing:.06em;color:#9b4769;z-index:10}
.opening-skip>span{font-size:20px;font-weight:400;line-height:1}
.opening-skip:hover{background:#fbe5ed}
.opening-skip:focus-visible{outline:2px solid #a24b70;outline-offset:4px}
@media(max-width:600px){
  .opening-frame{inset:12px;border-radius:9px}
  .opening-corner{top:29px;left:30px;font-size:8px}
  .opening-corner small{font-size:6px}
  .opening-composition{padding-top:15px;transform:translateY(-15px)}
  .opening-eyebrow{font-size:9px;letter-spacing:.08em;margin-bottom:15px}
  .opening-eyebrow>span{margin:0 8px;font-size:17px}
  .invitation-scene{width:300px;height:298px}
  .letter-stack{left:5px;bottom:12px}
  .invitation-card{bottom:-15px}
  .invitation-spark-one{left:-2px;top:48px;font-size:31px}
  .invitation-spark-two{right:-3px;top:90px;font-size:26px}
  .invitation-spark-three{left:-2px;bottom:28px;font-size:23px}
  .invitation-spark-four{right:18px;top:16px;font-size:17px}
  .opening-title{font-size:clamp(25px,7vw,35px);margin-top:22px}
  .opening-message{font-size:9px;letter-spacing:.08em}
  .opening-skip{right:28px;bottom:28px;font-size:10px;gap:21px;min-height:44px}
}
@media(max-height:650px){
  .opening-composition{transform:scale(.82);padding-top:12px}
  .opening-eyebrow{margin-bottom:12px}
  .opening-title{margin-top:12px}
  .opening-corner{top:28px;left:30px}
  .opening-skip{bottom:25px;right:28px}
}
@media(prefers-reduced-motion:reduce){.opening-invite{display:none}}
</style>
