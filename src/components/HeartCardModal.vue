<script setup>
import { computed, ref, watch } from 'vue'
import { isWardrobeCardUnlocked, wardrobeCardRequiredIds } from '../data/wardrobe'
import { useModalFocus } from '../composables/useModalFocus'

const props = defineProps({
  unlockedIds: { type: Array, default: () => [] },
})
const emit = defineEmits(['close'])
const modal = ref(null)
const close = () => emit('close')
useModalFocus(modal, close)

const cardMessage = ref('月圓時，\n把想念寄給\n最可愛的你。')
const cardTone = ref('moonlight')
const cardOrientation = ref('portrait')
const cardImage = ref('/images/momo-moon-rabbit-hero-v1.webp')
const cardLayout = ref('idol')
const selectedPreset = ref('moon-bunny')
const downloadStatus = ref('')
const cardColors = computed(() => ({
  moonlight: { bg: '#f1d8e2', ink: '#4f2940', accent: '#b94f77' },
  osmanthus: { bg: '#f8dc95', ink: '#54342d', accent: '#c76c47' },
  night: { bg: '#c8bee1', ink: '#362852', accent: '#7959a8' },
}[cardTone.value]))
const cardGallery = [
  { id: 'moon-bunny', title: '月兔邀請', note: '月亮正等著你入席。', image: '/images/momo-moon-rabbit-hero-v1.webp', tone: 'moonlight', orientation: 'portrait', layout: 'idol', message: '月圓時，\n把想念寄給\n最可愛的你。' },
  { id: 'moon-cake-gift', title: '月餅花禮', note: '甜甜的祝福，親手送達。', image: '/images/momo-moon-rabbit-mooncake-v1.webp', tone: 'osmanthus', orientation: 'portrait', layout: 'idol', message: '桂花香裡，\n甜甜的心意\n送給最可愛的你。' },
  { id: 'lantern-dance', title: '花燈共舞', note: '今夜的月光，和モモ一起跳。', image: '/images/momo-moon-rabbit-lantern-dance-v1.webp', tone: 'night', orientation: 'portrait', layout: 'idol', message: '花燈搖曳，\n和偶像モモ\n一起跳進月光。' },
  { id: 'osmanthus-pavilion', title: '桂月水榭', note: '月色與桂香都剛剛好。', image: '/images/momo-moon-rabbit-osmanthus-pavilion-v1.webp', tone: 'osmanthus', orientation: 'landscape', layout: 'scene', message: '桂月水榭，\n今晚慢慢喝一口\n月光。' },
  { id: 'lantern-river', title: '星燈月台', note: '把今夜跳成最亮的光。', image: '/images/momo-moon-rabbit-lantern-river-v1.webp', tone: 'night', orientation: 'landscape', layout: 'scene', message: '星燈月台，\n和偶像モモ一起\n舞進滿月。' },
  { id: 'wardrobe-secret', title: '月光衣櫥', note: '換上喜歡的模樣，收藏衣櫥的祕密月光。', image: '/images/momo-moon-rabbit-wardrobe-card-v1.webp', tone: 'night', orientation: 'landscape', layout: 'scene', message: '換上喜歡的\n模樣，月光也\n會記得你。', requiresWardrobe: true },
]

const wardrobeCardProgress = computed(() => wardrobeCardRequiredIds.filter((id) => props.unlockedIds.includes(id)).length)

function isCardLocked(card) {
  return card.requiresWardrobe && !isWardrobeCardUnlocked(props.unlockedIds)
}

function getCardLines(value, orientation) {
  const maxCharacters = orientation === 'landscape' ? 10 : 7
  const lines = []
  const sourceLines = (value?.trim() || '今夜也一起發光。').split(/\r?\n/)
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
  return lines.filter(Boolean)
}

function formatCardLines(value, orientation) {
  return getCardLines(value, orientation).slice(0, 3)
}

function constrainCardMessage(value, orientation) {
  const characters = [...(value || '').replace(/\r/g, '')]
  while (characters.length && getCardLines(characters.join(''), orientation).length > 3) characters.pop()
  return characters.join('')
}

const cardTextLines = computed(() => formatCardLines(cardMessage.value, cardOrientation.value))
const cardTextCapacity = computed(() => cardOrientation.value === 'landscape' ? 30 : 21)
const cardTextCount = computed(() => [...cardMessage.value].filter((character) => character !== '\n' && character !== '\r').length)

function updateCardMessage(value) {
  cardMessage.value = constrainCardMessage(value, cardOrientation.value)
}

watch(cardOrientation, (orientation) => {
  cardMessage.value = constrainCardMessage(cardMessage.value, orientation)
})

function chooseCard(card) {
  if (isCardLocked(card)) return
  selectedPreset.value = card.id
  cardTone.value = card.tone
  cardOrientation.value = card.orientation
  cardImage.value = card.image
  cardLayout.value = card.layout
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
    const [character, paper, rabbitMark] = await Promise.all([
      loadImage(cardImage.value),
      loadImage('/images/momo-paper-bg.webp'),
      loadImage('/images/lunar-pop-rabbit-mark-v1.webp'),
    ])
    const canvas = document.createElement('canvas')
    const landscape = cardOrientation.value === 'landscape'
    canvas.width = landscape ? 1500 : 1200
    canvas.height = landscape ? 1000 : 1500
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context is unavailable')
    const sceneCard = cardLayout.value === 'scene'
    ctx.fillStyle = cardColors.value.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (sceneCard) {
      ctx.drawImage(character, 0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#190a2252'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      ctx.globalAlpha = 0.34
      ctx.drawImage(paper, 0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1
    }
    const ink = sceneCard ? '#fff8f0' : cardColors.value.ink
    const accent = sceneCard ? '#ffd36f' : cardColors.value.accent
    ctx.strokeStyle = ink
    ctx.lineWidth = 4
    ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76)
    ctx.drawImage(rabbitMark, 82, 78, 74, 74)
    ctx.fillStyle = ink
    ctx.font = '900 38px "DM Sans", sans-serif'
    ctx.fillText('MOMO MOON CARD', 178, 129)
    ctx.font = `900 ${landscape ? 98 : 112}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif`
    drawCanvasLines(ctx, cardTextLines.value, 82, landscape ? 285 : 310, landscape ? 118 : 148)
    ctx.fillStyle = accent
    ctx.font = '800 30px "DM Sans", sans-serif'
    ctx.fillText('A LITTLE MOONLIGHT FOR YOU', 88, canvas.height - 136)
    ctx.fillStyle = ink
    ctx.font = '700 24px "DM Sans", sans-serif'
    ctx.fillText('ONLY FOR YOU, WITH MOMO.', 88, canvas.height - 90)
    if (!sceneCard) {
      const ratio = character.width / character.height
      const height = landscape ? 790 : 1060
      ctx.drawImage(character, canvas.width - height * ratio + (landscape ? 45 : 110), landscape ? 150 : 390, height * ratio, height)
    }
    const link = document.createElement('a')
    link.download = `momo-heart-card-${Date.now()}.webp`
    link.href = canvas.toDataURL('image/webp', 0.92)
    link.click()
    downloadStatus.value = '月光小卡已收藏。'
  } catch {
    downloadStatus.value = '小卡製作失敗，請再試一次。'
  }
}
</script>

<template>
  <div ref="modal" class="experience-modal card-modal" role="dialog" aria-modal="true" aria-labelledby="card-title">
    <div class="modal-panel card-dialog">
      <button class="modal-close" aria-label="關閉客製小卡" @click="close">×</button>
      <div class="card-intro"><p>MOMO MOON CARD STUDIO</p><h2 id="card-title">把月光，收進<br><em>你的專屬圖鑑。</em></h2><span>挑選一張月兔小卡，寫下今晚的心意，再收藏成屬於你的畫面。</span></div>
      <div class="card-workbench">
        <div class="card-preview" :class="[cardTone, cardOrientation, { 'has-three-lines': cardTextLines.length === 3, 'scene-card': cardLayout === 'scene' }]">
          <div class="card-meta"><img src="/images/lunar-pop-rabbit-mark-v1.webp" alt="" /><span>MOMO MOON CARD</span></div>
          <h3><span v-for="(line, index) in cardTextLines" :key="`${line}-${index}`">{{ line }}</span></h3>
          <img v-if="cardLayout === 'scene'" class="card-stage-scene" :src="cardImage" alt="月兔モモ的中秋舞台" />
          <img v-else class="card-idol" :src="cardImage" alt="把心意送給你的星乃モモ" />
          <p>A LITTLE MOONLIGHT FOR YOU</p>
        </div>
        <div class="card-editor">
          <p class="editor-kicker">MY MOONLIT WISH</p>
          <label for="card-message">寫給月亮下的你</label>
          <textarea id="card-message" :value="cardMessage" rows="3" placeholder="月圓時，&#10;把想念寄給最可愛的你。" aria-describedby="card-copy-note" @input="updateCardMessage($event.target.value)"></textarea>
          <small id="card-copy-note" class="card-copy-note">已輸入 {{ cardTextCount }} / {{ cardTextCapacity }} 字，最多三行，會依卡面比例自動收好。</small>
          <fieldset v-if="cardLayout !== 'scene'"><legend>今晚想收下哪一種月色？</legend><button v-for="tone in [{ id: 'moonlight', label: '粉月微光' }, { id: 'osmanthus', label: '桂花暖金' }, { id: 'night', label: '紫夜星河' }]" :key="tone.id" :class="tone.id" :aria-pressed="cardTone === tone.id" @click="cardTone = tone.id">{{ tone.label }}</button></fieldset>
          <fieldset><legend>小卡比例</legend><button :aria-pressed="cardOrientation === 'portrait'" @click="cardOrientation = 'portrait'">直式</button><button :aria-pressed="cardOrientation === 'landscape'" @click="cardOrientation = 'landscape'">橫式</button></fieldset>
          <button class="download-card" @click="downloadCard">收藏月光小卡 WEBP</button>
          <p class="download-status" role="status">{{ downloadStatus }}</p>
        </div>
      </div>
      <section class="card-collection" aria-labelledby="collection-title">
        <div class="collection-heading"><p>MID-AUTUMN COLLECTION</p><h3 id="collection-title">月兔小卡圖鑑</h3><span>點選一張，換上今晚想收藏的月光。</span></div>
        <div class="collection-grid">
          <button v-for="(card, index) in cardGallery" :key="card.id" class="collection-card" :class="[card.orientation, card.layout, { active: selectedPreset === card.id, locked: isCardLocked(card) }]" :disabled="isCardLocked(card)" :aria-pressed="selectedPreset === card.id" :aria-label="isCardLocked(card) ? `第六章月光衣櫥尚未解鎖，衣櫥條件完成 ${wardrobeCardProgress} / 2` : `選擇${card.title}小卡`" @click="chooseCard(card)">
            <img :src="card.image" alt="" />
            <span class="collection-copy"><b>{{ card.title }}</b><small>{{ card.note }}</small></span>
            <span v-if="isCardLocked(card)" class="collection-lock" aria-hidden="true"><strong>第六章・封存中</strong><small>衣櫥條件 {{ wardrobeCardProgress }} / 2</small><small>解鎖月牙側馬尾＋月光練習服</small></span>
            <em aria-hidden="true">0{{ index + 1 }}</em>
            <i aria-hidden="true">{{ card.requiresWardrobe ? 'SECRET WARDROBE' : card.layout === 'scene' ? 'MOON STAGE' : 'MOON RABBIT' }}</i>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
