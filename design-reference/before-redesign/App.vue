<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import MomoSprite from './components/MomoSprite.vue'
import DanceStage from './components/DanceStage.vue'
import ReactiveWord from './components/ReactiveWord.vue'
import OpeningInvite from './components/OpeningInvite.vue'
import { poses } from './data/choreography'
import { useWorldMotion } from './composables/useWorldMotion'
const root = ref(null)
const stageRef = ref(null)
const filmstrip = ref(null)
const heroFrame = ref(7)
const mood = ref('hello')
const profileMood = ref(0)
const menuOpen = ref(false)
const introOpen = ref(true)
const motion = useWorldMotion(root)
const moods = {
  hello: { frame: 1, line: '欸，你終於來了！', word: '今天也請多多指教 ♡' },
  heart: { frame: 4, line: '心動訊號，接收成功。', word: '這顆心，偷偷送給你 ♡' },
  shine: { frame: 6, line: '跟上我的節奏！', word: '一起把煩惱跳走 ✦' },
  power: { frame: 5, line: '可愛能量，全・開！', word: '今天的主角就是我們！' },
}
const greeting = computed(() => moods[mood.value])
const profileNotes = [
  { label: '蝴蝶結', icon: '୨୧', frame: 0, title: '可愛的小儀式', text: '出門前，把蝴蝶結綁好。就算今天沒有什麼大事，也要好好喜歡自己。', note: '每天，都值得精心打扮。' },
  { label: '草莓牛奶', icon: '♡', frame: 4, title: '心情充電站', text: '如果今天有點累，就和我喝一杯草莓牛奶吧。甜甜的事情，總會發生。', note: '甜度剛好，心動加倍。' },
  { label: '聚光燈', icon: '✧', frame: 7, title: '最喜歡的那一秒', text: '當你看過來，而我剛好也在看你。那一刻，小小的舞台就變得閃閃發光。', note: '我的閃耀，有你一份。' },
]
let heroPreview, previousOverflow = '', returnFocus, introFinished = false
watch(introOpen, active => {
  if (active) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden' }
  else document.body.style.overflow = previousOverflow
}, { immediate: true })
async function finishIntro() {
  introOpen.value = false
  await nextTick()
  motion.reveal()
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
  else if (!introFinished) document.getElementById('hero-title')?.focus({ preventScroll: true })
  introFinished = true
}
function replayOpening(event) {
  returnFocus = event?.currentTarget
  menuOpen.value = false
  introOpen.value = true
}
function reactTo(type) { heroPreview?.kill(); mood.value = type; heroFrame.value = moods[type].frame; motion.respond('.key-visual') }
function greet() {
  heroPreview?.kill(); mood.value = 'hello'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { heroFrame.value = 1; return }
  const clock = { frame: 0 }
  heroPreview = gsap.to(clock, { frame: 7, duration: 2.8, ease: 'none', onUpdate: () => { heroFrame.value = Math.round(clock.frame) } })
  motion.respond('.key-visual')
}
function setProfile(index) { profileMood.value = index; motion.respond('.diary-portrait') }
function showPose(index) { stageRef.value?.selectPose(index) }
function moveFilm(direction) {
  const strip = filmstrip.value
  const card = strip?.querySelector('.film-card')
  if (strip && card) strip.scrollBy({ left: direction * (card.getBoundingClientRect().width + 24) * 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
onMounted(() => { if (!introOpen.value) motion.reveal() })
onBeforeUnmount(() => { heroPreview?.kill(); document.body.style.overflow = previousOverflow })
</script>
<template>
  <OpeningInvite v-if="introOpen" @complete="finishIntro"/>
  <div ref="root" class="momo-world" :inert="introOpen">
    <a class="skip-link" href="#main-content">跳至主要內容</a>
    <header class="world-header">
      <a class="world-brand" href="#top" aria-label="心動宣言首頁"><span aria-hidden="true">୨୧</span><b>心動宣言<em>!</em><small>MOMO'S LITTLE UNIVERSE</small></b></a>
      <nav class="world-nav" aria-label="主要導覽"><a href="#character">認識モモ</a><a href="#stage">心動舞台</a><a href="#frames">可愛圖鑑</a></nav>
      <div class="world-header-actions"><button class="opening-replay" @click="replayOpening"><span>↻</span> 重播開場</button><button class="world-menu-toggle" :aria-expanded="menuOpen" aria-controls="world-mobile-menu" @click="menuOpen = !menuOpen">{{ menuOpen ? '關閉 ×' : '選單 ☰' }}</button></div>
      <nav v-if="menuOpen" class="world-mobile-menu" id="world-mobile-menu" aria-label="手機導覽" @keydown.esc="menuOpen=false"><a href="#character" @click="menuOpen=false">01 / 認識モモ</a><a href="#stage" @click="menuOpen=false">02 / 心動舞台</a><a href="#frames" @click="menuOpen=false">03 / 可愛圖鑑</a></nav>
    </header>
    <main id="main-content">
      <section id="top" class="world-hero" aria-labelledby="hero-title">
        <div class="hero-checks" aria-hidden="true"></div>
        <p class="hero-season hero-arrive"><span>✧</span> 星乃モモ的心動小宇宙 <span>✧</span></p>
        <span class="hero-giant-type" aria-hidden="true">MOMO</span>
        <span class="hero-side-note" aria-hidden="true">今日份可愛，準時上線。 / KIRAMEKI 01</span>
        <div class="key-visual">
          <div class="key-arch" aria-hidden="true"><span></span></div>
          <span class="key-ribbon" aria-hidden="true">୨୧</span>
          <button class="world-character hero-arrive" @click="greet" aria-label="點モモ，表演八個可愛動作"><div class="hero-parallax"><MomoSprite :frame="heroFrame" :label="`星乃モモ：${poses[heroFrame].name}`"/></div></button>
          <div class="reaction-sparks" aria-hidden="true"><span v-for="i in 8" :key="i" class="reaction-spark">{{ i % 2 ? '♡' : '✦' }}</span></div>
        </div>
        <div class="mood-postcard hero-arrive"><span class="postcard-pin" aria-hidden="true"></span><p>MOOD OF THE DAY</p><h2>今天，想怎麼可愛？</h2><div><button :aria-pressed="mood === 'heart'" @click="reactTo('heart')">♡ 心動</button><button :aria-pressed="mood === 'shine'" @click="reactTo('shine')">✦ 閃耀</button><button :aria-pressed="mood === 'power'" @click="reactTo('power')">↑ 全力</button></div><small>選一個心情，モモ會回應你。</small></div>
        <div class="hero-letter hero-arrive"><span class="letter-number">DEAR YOU / 001</span><span class="letter-flower" aria-hidden="true">✳</span><p>獻給每個<br>認真可愛的你。</p><small>一點點任性、滿滿的真心。<br>歡迎來到，我的小小世界。</small><span class="letter-sign">from Momo ♡</span></div>
        <div class="hero-reply hero-arrive" aria-live="polite"><span>{{ greeting.line }}</span><b>{{ greeting.word }}</b></div>
        <div class="hero-name hero-arrive"><span>今天的主角</span><b>星乃 モモ</b><small>HOSHINO MOMO</small><i aria-hidden="true">✧</i></div>
        <span class="hero-flower flower-a" aria-hidden="true">✳</span><span class="hero-flower flower-b" aria-hidden="true">✧</span><span class="hero-flower flower-c" aria-hidden="true">♡</span>
        <div class="world-hero-title"><p class="hero-arrive">小小舞台，大大心動。</p><h1 id="hero-title" tabindex="-1"><span class="title-split">把今天，</span><ReactiveWord text="變可愛。" hint="點一下，開啟可愛能量" @activate="reactTo('power')"/></h1><div class="hero-bottom-actions hero-arrive"><a href="#stage" class="pink-pill">和モモ一起閃耀 <span>↗</span></a><span>點文字、選心情，和我說聲嗨。</span></div></div>
        <a class="hero-scroll" href="#character"><span>往下探索</span><b>↓</b></a>
        <span class="hero-edition">ORIGINAL CHARACTER<br>EST. 2026 / VOL. 01</span>
      </section>
      <section id="character" class="world-diary" aria-labelledby="diary-title">
        <div class="section-mark"><span>01</span><p>一點點關於我<small>MEET YOUR NEW FAVORITE</small></p><i>♡</i></div>
        <div class="diary-layout">
          <div class="diary-portrait section-reveal"><div class="portrait-type" aria-hidden="true">HELLO,<br>I'M MOMO.</div><MomoSprite :frame="profileNotes[profileMood].frame" :label="`星乃モモ：${poses[profileNotes[profileMood].frame].name}`"/><div class="portrait-caption"><b>星乃 モモ</b><span>22 歲 / 把日常變成舞台的夢想家</span></div><span class="portrait-tape" aria-hidden="true"></span></div>
          <div class="diary-content"><p class="tiny-japanese" lang="ja">かわいいを、あきらめない。</p><h2 id="diary-title" class="scroll-phrase">可愛，是我的<br><em>全力以赴。</em></h2><p class="diary-intro">有一點小任性，但每一次心動都很認真。<br>想更靠近我一點？翻翻我的日常小手帳吧。</p><div class="diary-tabs" aria-label="選擇モモ的喜好"><button v-for="(note,i) in profileNotes" :key="note.label" :aria-pressed="profileMood===i" :class="{selected:profileMood===i}" @click="setProfile(i)"><span>{{ note.icon }}</span>{{ note.label }}</button></div><article class="diary-note" aria-live="polite"><span class="note-date">MOMO'S DIARY <b>0{{ profileMood+1 }}</b></span><h3>{{ profileNotes[profileMood].title }}</h3><p>{{ profileNotes[profileMood].text }}</p><small>{{ profileNotes[profileMood].note }}</small><span class="note-doodle" aria-hidden="true">{{ profileNotes[profileMood].icon }}</span></article><div class="diary-signature"><span>粉色雙馬尾 · 星星髮夾 · 心動比心</span><b>よろしくね ♡</b></div></div>
        </div>
      </section>
      <section class="world-stage-intro" aria-labelledby="stage-intro-title"><div class="stage-intro-copy"><span class="eyebrow-no">02 / YOUR TURN</span><h2 id="stage-intro-title">把<ReactiveWord text="心動" hint="進入比心舞台" @activate="showPose(4)"/>，<br>交給這一拍。</h2><p>你的捲動，就是我的舞步。<br>寫一句應援，讓文字和モモ一起演出。</p></div><a class="stage-ticket" href="#stage"><span class="ticket-star">✦</span><div><small>特別入場券 / ADMIT ONE</small><b>モモ的心動舞台</b><span>8 個動作 × 無限心動</span></div><strong>↓</strong></a><span class="stage-intro-outline" aria-hidden="true">SHOWTIME!</span></section>
      <DanceStage ref="stageRef"/>
      <section id="frames" class="world-gallery" aria-labelledby="gallery-title"><div class="gallery-heading"><div><span class="eyebrow-no">03 / THE CUTE COLLECTION</span><h2 id="gallery-title">每一幀，<em>都是戲。</em></h2></div><div class="gallery-caption"><p>從第一聲招呼，到最後一個眨眼。<br>挑一張卡，收藏今天的心動瞬間。</p><div class="gallery-arrows"><button aria-label="向前查看動作卡" @click="moveFilm(-1)">←</button><button aria-label="向後查看動作卡" @click="moveFilm(1)">→</button></div></div></div><div ref="filmstrip" class="momo-filmstrip" aria-label="八個動作圖鑑"><article class="film-card" v-for="(pose,i) in poses" :key="pose.name"><button @click="showPose(i)" :aria-label="`在舞台查看${pose.name}動作`"><span class="film-card-top"><b>0{{ i+1 }}</b><i>{{ pose.symbol }}</i></span><MomoSprite :frame="i" :label="`${pose.name}動作`"/><div><h3>{{ pose.name }}</h3><span>{{ pose.japanese }}</span></div><small>在舞台演出 ↗</small></button></article></div><div class="gallery-foot"><span>← 左右滑動，發現更多可愛 →</span><a href="/images/momo-dance-atlas.webp" download="momo-dance-atlas.webp">帶走モモ的透明圖集 ↓</a></div></section>
      <section class="world-goodbye"><span class="goodbye-bow" aria-hidden="true">୨୧</span><p>不管今天過得怎麼樣。</p><h2 class="scroll-phrase">你都值得，<br><em>一點點可愛。</em></h2><div><a class="pink-pill" href="#stage">再和モモ跳一次 <span>↗</span></a><button @click="replayOpening">再看一次開場 ♡</button></div><small>謝謝你，來到我的小小世界。</small></section>
    </main>
    <footer class="world-footer"><a href="#top">心動宣言<span>!</span><small>MOMO'S LITTLE UNIVERSE</small></a><p>星乃モモ · 原創角色互動網站<br>© {{ new Date().getFullYear() }} KIRAMEKI / MADE WITH A LITTLE LOVE.</p><a href="#top" class="back-top" aria-label="回到頁首">↑</a></footer>
  </div>
</template>
