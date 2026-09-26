<script setup>
import { computed, ref } from 'vue'
import { useModalFocus } from '../composables/useModalFocus'

const props = defineProps({ score: { type: Number, default: 0 } })
const emit = defineEmits(['close'])
const modal = ref(null)
const close = () => emit('close')
useModalFocus(modal, close)
const cardMessage = ref('今天的你，\n也值得被可愛\n抱緊緊。')
const cardTone = ref('strawberry')
const cardStyle = ref('spotlight')
const cardOrientation = ref('portrait')
const cardImage = ref('/images/momo-love-letter.png')
const selectedPreset = ref('letter')
const downloadStatus = ref('')
const cardColors = computed(() => ({
  strawberry: { bg: '#f8bfd3', ink: '#552e42', accent: '#ef5688' },
  lemon: { bg: '#ffe29a', ink: '#56364b', accent: '#f05b88' },
  grape: { bg: '#d9c8ed', ink: '#4c3150', accent: '#9c68bd' },
}[cardTone.value]))
const cardGallery = [
  { id: 'debut', title: '初遇草莓', note: '把第一次的心動，收好。', image: '/images/momo.png', tone: 'strawberry', style: 'spotlight', orientation: 'portrait', message: '今天開始，\n也請多多指教。' },
  { id: 'promise', title: '粉色約定', note: '明天也要笑著見面。', image: '/images/momo-hero-reach.png', tone: 'lemon', style: 'poster', orientation: 'landscape', message: '和你約好了，\n明天也一起閃亮。' },
  { id: 'stage', title: '舞台安可', note: '讓心跳成為旋律。', image: '/images/momo-dance-jump-v2.png', tone: 'grape', style: 'spotlight', orientation: 'landscape', message: '這一首，只\n想跳給你看。' },
  { id: 'letter', title: '月光來信', note: '今天的可愛，分你一半。', image: '/images/momo-love-letter.png', tone: 'strawberry', style: 'poster', orientation: 'portrait', message: '今天的你，\n也值得被可愛\n抱緊緊。' },
]

function formatCardLines(value, orientation) {
  const maxCharacters = orientation === 'landscape' ? 10 : 7
  const lines = []
  const sourceLines = (value?.trim() || '今天也一起發光。').split(/\r?\n/)
  sourceLines.forEach((source) => {
    let line = ''
    ;[...source.trim()].forEach((character) => {
      if (line.length >= maxCharacters) {
        lines.push(line)
        line = character
      } else line += character
    })
    if (line) lines.push(line)
  })
  return lines.filter(Boolean).slice(0, 3)
}

const cardTextLines = computed(() => formatCardLines(cardMessage.value, cardOrientation.value))

function chooseCard(card) {
  selectedPreset.value = card.id
  cardTone.value = card.tone
  cardStyle.value = card.style
  cardOrientation.value = card.orientation
  cardImage.value = card.image
  cardMessage.value = card.message
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function drawCanvasLines(ctx, lines, x, y, lineHeight) {
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight))
}

async function downloadCard() {
  downloadStatus.value = '正在裝進信封…'
  try {
    await document.fonts.ready
    const [character, paper, heart] = await Promise.all([
      loadImage(cardImage.value),
      loadImage('/images/momo-paper-bg.png'),
      loadImage('/favicon.svg'),
    ])
    const canvas = document.createElement('canvas')
    const landscape = cardOrientation.value === 'landscape'
    canvas.width = landscape ? 1500 : 1200
    canvas.height = landscape ? 1000 : 1500
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = cardColors.value.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 0.34
    ctx.drawImage(paper, 0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1
    ctx.strokeStyle = cardColors.value.ink
    ctx.lineWidth = 4
    ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76)
    ctx.drawImage(heart, 82, 78, 74, 74)
    ctx.fillStyle = cardColors.value.ink
    ctx.font = '900 38px "DM Sans", sans-serif'
    ctx.fillText('MOMO HEART CARD', 178, 129)
    ctx.font = `900 ${landscape ? 98 : 112}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif`
    drawCanvasLines(ctx, cardTextLines.value, 82, landscape ? 285 : 310, landscape ? 118 : 148)
    ctx.fillStyle = cardColors.value.accent
    ctx.font = '800 30px "DM Sans", sans-serif'
    ctx.fillText('MADE FOR YOUR SMILE', 88, canvas.height - 136)
    ctx.fillStyle = cardColors.value.ink
    ctx.font = '700 24px "DM Sans", sans-serif'
    ctx.fillText('ONLY FOR YOU, WITH MOMO.', 88, canvas.height - 90)
    const ratio = character.width / character.height
    const height = landscape ? 790 : 1060
    ctx.drawImage(character, canvas.width - height * ratio + (landscape ? 45 : 110), landscape ? 150 : 390, height * ratio, height)
    const link = document.createElement('a')
    link.download = `momo-heart-card-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    downloadStatus.value = '小卡已下載。'
  } catch {
    downloadStatus.value = '小卡製作失敗，請再試一次。'
  }
}
</script>

<template>
  <div ref="modal" class="experience-modal card-modal" role="dialog" aria-modal="true" aria-labelledby="card-title">
    <div class="modal-panel card-dialog">
      <button class="modal-close" aria-label="關閉客製小卡" @click="close">×</button>
      <div class="card-intro"><p>MOMO CARD BOOK</p><h2 id="card-title">把心動，收進<br><em>你的收藏圖鑑。</em></h2><span>挑一張モモ的心情，再把它變成只屬於你的收藏。</span></div>
      <div class="card-workbench">
        <div class="card-preview" :class="[cardTone, cardStyle, cardOrientation, { 'has-three-lines': cardTextLines.length === 3 }]">
          <div class="card-meta"><img src="/favicon.svg" alt="" /><span>MOMO HEART CARD</span></div>
          <h3><span v-for="(line, index) in cardTextLines" :key="`${line}-${index}`">{{ line }}</span></h3>
          <img class="card-idol" :src="cardImage" alt="把心意送給你的星乃モモ" />
          <p>MADE FOR YOUR SMILE</p>
        </div>
        <div class="card-editor">
          <p class="editor-kicker">MY LITTLE CARD</p>
          <label for="card-message">寫給今天的你</label>
          <textarea id="card-message" v-model="cardMessage" maxlength="20" rows="3" placeholder="今天的你，&#10;也值得被可愛抱緊緊。"></textarea>
          <small class="card-copy-note">最多三行，會依卡面比例自動收好。</small>
          <fieldset><legend>今天想要哪種甜度？</legend><button v-for="tone in [{ id: 'strawberry', label: '草莓心情' }, { id: 'lemon', label: '檸檬閃光' }, { id: 'grape', label: '葡萄晚安' }]" :key="tone.id" :class="tone.id" :aria-pressed="cardTone === tone.id" @click="cardTone = tone.id">{{ tone.label }}</button></fieldset>
          <fieldset><legend>可愛的樣子</legend><button v-for="style in [{ id: 'spotlight', label: '舞台小卡' }, { id: 'poster', label: '收藏海報' }]" :key="style.id" :aria-pressed="cardStyle === style.id" @click="cardStyle = style.id">{{ style.label }}</button></fieldset>
          <fieldset><legend>小卡比例</legend><button :aria-pressed="cardOrientation === 'portrait'" @click="cardOrientation = 'portrait'">直式</button><button :aria-pressed="cardOrientation === 'landscape'" @click="cardOrientation = 'landscape'">橫式</button></fieldset>
          <button class="download-card" @click="downloadCard">把小卡收藏起來 PNG</button>
          <p class="download-status" role="status">{{ downloadStatus }}</p>
        </div>
      </div>
      <section class="card-collection" aria-labelledby="collection-title">
        <div class="collection-heading"><p>MOMO COLLECTION</p><h3 id="collection-title">小卡圖鑑</h3><span>點選一張，換上今天想收藏的モモ。</span></div>
        <div class="collection-grid">
          <button v-for="card in cardGallery" :key="card.id" class="collection-card" :class="{ active: selectedPreset === card.id }" :aria-pressed="selectedPreset === card.id" @click="chooseCard(card)">
            <img :src="card.image" alt="" /><span><b>{{ card.title }}</b><small>{{ card.note }}</small></span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
