<script setup>
import { computed, ref } from 'vue'
import MomoSprite from './MomoSprite.vue'
import WardrobeModal from './WardrobeModal.vue'
import { getDanceFrameOffset, getSadFrameSource } from '../data/wardrobe'
import { danceLanes, useRhythmGame } from '../composables/useRhythmGame'
import { rhythmLevels } from '../rhythmGame'
import { useModalFocus } from '../composables/useModalFocus'
import { useSoundtrack } from '../composables/useSoundtrack'

const props = defineProps({
  appearance: { type: Object, required: true },
  unlockedIds: { type: Array, required: true },
  standalone: Boolean,
})
const emit = defineEmits(['close', 'complete', 'select-hair', 'select-outfit'])
const sadFrameSource = computed(() => getSadFrameSource(props.appearance.hairId, props.appearance.outfitId))
const modal = ref(null)
const fabOpen = ref(false)
const wardrobeOpen = ref(false)
const close = () => emit('close')
function openWardrobe() {
  fabOpen.value = false
  if (gameActive.value && !gamePaused.value) togglePause()
  wardrobeOpen.value = true
}
function closeWardrobe() { wardrobeOpen.value = false }
function pauseFromFab() {
  togglePause()
  fabOpen.value = false
}
function endFromFab() {
  fabOpen.value = false
  endGameEarly()
}
function soundFromFab() {
  toggleGameSound()
  fabOpen.value = false
}
useModalFocus(modal, close)
const { soundOn, synthTone, synthPianoTone, enableSound, toggleSound, restartMusic, pauseMusic, resumeMusic } = useSoundtrack()
const {
  gameActive, gamePaused, gameScore, gameCombo, gameStatus, gameProgress,
  notes, danceFrame, letterSending, currentLevel, currentLevelIndex,
  isCrying, missCount, startGame, endGameEarly, togglePause, hitLane,
} = useRhythmGame({ enableSound, restartMusic, pauseMusic, resumeMusic, synthTone, synthPianoTone, onComplete: (result) => emit('complete', result) })
const dancerFrameStyle = computed(() => {
  const { x, y } = getDanceFrameOffset(props.appearance.hairId, props.appearance.outfitId, danceFrame.value)
  return { '--frame-shift-x': `${x}%`, '--frame-shift-y': `${y}%` }
})

function toggleGameSound() {
  const enabling = !soundOn.value
  toggleSound()
  if (enabling && gamePaused.value) pauseMusic()
}

</script>

<template>
  <div ref="modal" class="experience-modal game-modal" :class="{ 'game-modal--route': standalone }" role="dialog" :aria-modal="!standalone" aria-labelledby="game-dialog-title">
    <div class="modal-panel game-dialog" :class="{ 'is-paused': gamePaused }">
      <header class="rhythm-hud">
        <div class="rhythm-brand">
          <img src="/images/lunar-pop-rabbit-mark-v1.webp" alt="" />
          <span>MOONLIGHT DANCE</span>
          <h2 id="game-dialog-title">接住モモ的月光節拍。</h2>
        </div>
        <div class="rhythm-progress" aria-label="三個難度關卡進度">
          <div class="rhythm-progress-line" aria-hidden="true"><i :style="{ transform: `scaleX(${gameProgress})` }"></i></div>
          <span v-for="(level, index) in rhythmLevels" :key="level.id" :class="{ active: index === currentLevelIndex, complete: index < currentLevelIndex }" :title="level.name">
            <b>{{ index === currentLevelIndex ? '☾' : '' }}</b><small>0{{ level.id }}</small>
          </span>
        </div>
        <div class="rhythm-meta">
          <span>STAGE <b>{{ currentLevel.id }}/{{ rhythmLevels.length }}</b></span>
          <span>SCORE <b>{{ String(gameScore).padStart(4, '0') }}</b></span>
        </div>
        <button class="game-wardrobe-toggle" aria-label="前往月光衣櫥" @click="openWardrobe">
          <span aria-hidden="true">✦</span><b>前往衣櫥</b>
        </button>
        <button class="game-sound" :aria-pressed="soundOn" :aria-label="soundOn ? '關閉遊戲音樂' : '開啟遊戲音樂'" @click="toggleGameSound">
          <span>BGM</span><b>{{ soundOn ? 'ON' : 'OFF' }}</b>
        </button>
        <div class="rhythm-window-actions">
          <button v-if="gameActive" class="mobile-pause-toggle" :class="{ active: gamePaused }" :aria-label="gamePaused ? '繼續節奏遊戲' : '暫停節奏遊戲'" :aria-pressed="gamePaused" @click="togglePause">
            <span aria-hidden="true">{{ gamePaused ? '▶' : 'Ⅱ' }}</span><b>{{ gamePaused ? '繼續' : '暫停' }}</b>
          </button>
          <button v-if="gameActive" class="mobile-end-toggle" aria-label="提早結束本輪遊戲並前往月光小卡" @click="endGameEarly"><span aria-hidden="true">↗</span><b>結束</b></button>
          <button class="rhythm-close" aria-label="關閉舞蹈遊戲" @click="close">
            <span class="rhythm-close-label">關閉</span><span class="rhythm-close-icon" aria-hidden="true">×</span>
          </button>
        </div>
      </header>

      <div class="game-shell" :class="{ playing: gameActive, paused: gamePaused, crying: isCrying }" :data-status="gameStatus" :data-difficulty="currentLevel.id">
        <div class="rhythm-stage-bg" aria-hidden="true"></div>
        <div class="velocity-field" aria-hidden="true"><i v-for="n in 8" :key="n"></i></div>
        <div class="combo-readout"><b>{{ gameCombo }}</b><span>COMBO</span></div>
        <aside class="performer-zone">
          <div class="game-dancer game-dancer-anchor">
            <Transition name="momo-miss" mode="out-in">
              <img v-if="isCrying" key="crying" class="game-dancer-image crying-dancer" :src="sadFrameSource" alt="沒有接到節拍而難過的月兔モモ" />
              <MomoSprite v-else key="dancing" class="game-dancer-image" :style="dancerFrameStyle" :hair-id="appearance.hairId" :outfit-id="appearance.outfitId" :frame="danceFrame" label="跟著節拍跳舞的月兔モモ" />
            </Transition>
          </div>
          <div class="momo-stage-sign" aria-hidden="true"><b>Momo</b><span>一起跳進月光裡</span></div>
          <div v-if="gameActive" class="game-actions">
            <button @click="togglePause"><b>{{ gamePaused ? '▶' : 'Ⅱ' }}</b>{{ gamePaused ? '繼續' : '暫停' }}</button>
            <button class="early-finish" @click="endGameEarly"><b>↗</b>結束本輪</button>
          </div>
        </aside>

        <section class="rhythm-playfield" aria-label="四軌節奏遊戲區">
          <p class="stage-message" aria-hidden="true">你的<br>節拍<br>照亮月光</p>
          <div class="mobile-stage-chip" aria-live="polite"><span>STAGE {{ currentLevel.id }} / {{ rhythmLevels.length }}</span><b>{{ currentLevel.name }} · {{ currentLevel.speedLabel }}</b></div>
          <div class="mobile-stage-floor" aria-hidden="true"></div>
          <div class="note-highway" aria-label="節奏音符軌道">
            <div v-for="(_, lane) in danceLanes" :key="lane" class="note-lane">
              <span v-for="note in notes.filter((item) => item.lane === lane)" :key="note.id" class="beat-note" :style="{ animationDuration: `${note.travelMs}ms` }" aria-hidden="true"><img src="/images/lunar-pop-rabbit-mark-v1.webp" alt="" /></span>
            </div>
          </div>
          <div class="judgment-line" aria-hidden="true"></div>
          <div class="judgment-status" :class="{ visible: gameStatus !== 'PLAY!' && gameStatus !== 'READY' }" role="status" aria-live="polite">
            <b>{{ gameStatus }}</b><span v-if="isCrying">下一拍慢慢來</span>
          </div>
          <div class="lane-controls" aria-label="舞步按鍵">
            <button v-for="(lane, index) in danceLanes" :key="lane.key" class="lane-button" :disabled="!gameActive || gamePaused" :aria-label="`${lane.key} 鍵，${lane.syllable}，${lane.label}`" @click="hitLane(index)">
              <b>{{ lane.key }}</b><span>{{ lane.syllable }} · {{ lane.label }}</span>
            </button>
          </div>
          <div v-if="gamePaused" class="pause-panel" role="status">
            <div class="pause-sheet">
              <div class="pause-stage-card" aria-label="目前關卡與難度">
                <div class="pause-stage-heading">
                  <span>STAGE 0{{ currentLevel.id }} / 0{{ rhythmLevels.length }}</span><em>自動進階</em>
                </div>
                <strong>{{ currentLevel.name }}</strong>
                <small>{{ currentLevel.englishName }} · {{ currentLevel.speedLabel }} · {{ currentLevel.density }}</small>
                <div class="pause-stage-meter" aria-hidden="true">
                  <i v-for="(level, index) in rhythmLevels" :key="level.id" :class="{ active: index === currentLevelIndex, complete: index < currentLevelIndex }">
                    <b>0{{ level.id }}</b><span>{{ level.name }}</span>
                  </i>
                </div>
              </div>
              <span>INTERMISSION</span><h3>先喘口氣。</h3><p>節拍已停在原地，準備好再繼續。</p>
              <div class="pause-actions"><button @click="togglePause">▶&nbsp; 繼續遊戲</button><button @click="startGame">↻&nbsp; 重新開始</button></div>
            </div>
          </div>
        </section>

        <div v-if="letterSending" class="letter-flight" aria-live="polite">
          <img class="rabbit-character" src="/images/lunar-pop-rabbit-mark-v1.webp" alt="帶著月光祝福的月兔" />
        </div>
      </div>
      <div class="game-fab" :class="{ 'is-open': fabOpen }" aria-label="遊戲快捷操作">
        <div v-if="fabOpen" class="game-fab__actions">
          <button v-if="gameActive" class="game-fab__action game-fab__action--pause" :aria-label="gamePaused ? '繼續節奏遊戲' : '暫停節奏遊戲'" @click="pauseFromFab"><span aria-hidden="true">{{ gamePaused ? '▶' : 'Ⅱ' }}</span></button>
          <button class="game-fab__action game-fab__action--wardrobe" aria-label="前往月光衣櫥" @click="openWardrobe"><span aria-hidden="true">✦</span></button>
          <button v-if="gameActive" class="game-fab__action game-fab__action--end" aria-label="提早結束本輪遊戲並前往月光小卡" @click="endFromFab"><span aria-hidden="true">■</span></button>
          <button class="game-fab__action game-fab__action--sound" :aria-label="soundOn ? '關閉遊戲音樂' : '開啟遊戲音樂'" @click="soundFromFab"><span aria-hidden="true">{{ soundOn ? '♫' : '♩' }}</span></button>
        </div>
        <button class="game-fab__trigger" :aria-label="fabOpen ? '收合遊戲快捷操作' : '開啟遊戲快捷操作'" :aria-expanded="fabOpen" @click="fabOpen = !fabOpen"><span aria-hidden="true">{{ fabOpen ? '×' : '☾' }}</span></button>
      </div>
      <WardrobeModal
        v-if="wardrobeOpen"
        :appearance="appearance"
        :unlocked-ids="unlockedIds"
        @close="closeWardrobe"
        @select-hair="(id) => emit('select-hair', id)"
        @select-outfit="(id) => emit('select-outfit', id)"
      />
      <p class="sr-only">{{ currentLevel.cue }}。可使用 Q、W、E、R 鍵演奏 DO、RE、MI、SOL，或點擊按鍵遊玩。目前漏拍 {{ missCount }} 次。</p>
    </div>
  </div>
</template>
