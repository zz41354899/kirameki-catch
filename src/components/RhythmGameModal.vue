<script setup>
import { ref } from 'vue'
import MomoSprite from './MomoSprite.vue'
import { danceLanes, useRhythmGame } from '../composables/useRhythmGame'
import { rhythmLevels } from '../rhythmGame'
import { useModalFocus } from '../composables/useModalFocus'
import { useSoundtrack } from '../composables/useSoundtrack'

const emit = defineEmits(['close', 'complete'])
const modal = ref(null)
const close = () => emit('close')
useModalFocus(modal, close)
const { soundOn, synthTone, enableSound, toggleSound } = useSoundtrack()
const {
  gameActive, gamePaused, gameScore, gameCombo, gameStatus, gameProgress,
  notes, danceFrame, letterSending, currentLevel, currentLevelIndex,
  isCrying, missCount, startGame, togglePause, hitLane,
} = useRhythmGame({ enableSound, synthTone, onComplete: (result) => emit('complete', result) })
</script>

<template>
  <div ref="modal" class="experience-modal game-modal" role="dialog" aria-modal="true" aria-labelledby="game-dialog-title">
    <div class="modal-panel game-dialog">
      <header class="rhythm-hud">
        <div class="rhythm-brand">
          <img src="/favicon.svg" alt="" />
          <span>HEARTBEAT DANCE</span>
          <h2 id="game-dialog-title">接住モモ的心跳。</h2>
        </div>
        <div class="rhythm-progress" aria-label="三個難度關卡進度">
          <div class="rhythm-progress-line" aria-hidden="true"><i :style="{ transform: `scaleX(${gameProgress})` }"></i></div>
          <span v-for="(level, index) in rhythmLevels" :key="level.id" :class="{ active: index === currentLevelIndex, complete: index < currentLevelIndex }" :title="level.name">
            <b>{{ index === currentLevelIndex ? '♡' : '' }}</b><small>0{{ level.id }}</small>
          </span>
        </div>
        <div class="rhythm-meta">
          <span>STAGE <b>{{ currentLevel.id }}/{{ rhythmLevels.length }}</b></span>
          <span>SCORE <b>{{ String(gameScore).padStart(4, '0') }}</b></span>
        </div>
        <button class="game-sound" :aria-pressed="soundOn" :aria-label="soundOn ? '關閉遊戲音樂' : '開啟遊戲音樂'" @click="toggleSound">♫&nbsp; BGM {{ soundOn ? 'ON' : 'OFF' }}</button>
        <button class="rhythm-close" aria-label="關閉舞蹈遊戲" @click="close">關閉&nbsp; ×</button>
      </header>

      <div class="game-shell" :class="{ playing: gameActive, paused: gamePaused, crying: isCrying }" :data-status="gameStatus" :data-difficulty="currentLevel.id">
        <div class="rhythm-stage-bg" aria-hidden="true"></div>
        <div class="velocity-field" aria-hidden="true"><i v-for="n in 8" :key="n"></i></div>
        <aside class="performer-zone">
          <div class="combo-readout"><b>{{ gameCombo }}</b><span>COMBO</span></div>
          <Transition name="momo-miss" mode="out-in">
            <img v-if="isCrying" key="crying" class="game-dancer crying-dancer" src="/images/momo-crying.png" alt="沒有接到節拍而掉眼淚的星乃モモ" />
            <MomoSprite v-else key="dancing" class="game-dancer" :frame="danceFrame" label="跟著節拍跳舞的星乃モモ" />
          </Transition>
          <div class="momo-stage-sign" aria-hidden="true"><b>Momo</b><span>一起跳動吧 ♡</span></div>
          <div v-if="gameActive" class="game-actions">
            <button @click="togglePause"><b>{{ gamePaused ? '▶' : 'Ⅱ' }}</b>{{ gamePaused ? '繼續' : '暫停' }}</button>
          </div>
        </aside>

        <section class="rhythm-playfield" aria-label="四軌節奏遊戲區">
          <p class="stage-message" aria-hidden="true">你的<br>心跳<br>是最棒的光 ♡</p>
          <div class="mobile-stage-chip" aria-live="polite"><span>STAGE {{ currentLevel.id }} / {{ rhythmLevels.length }}</span><b>{{ currentLevel.name }} · {{ currentLevel.speedLabel }}</b></div>
          <div class="note-highway" aria-label="節奏音符軌道">
            <div v-for="(_, lane) in danceLanes" :key="lane" class="note-lane">
              <span v-for="note in notes.filter((item) => item.lane === lane)" :key="note.id" class="beat-note" :style="{ animationDuration: `${note.travelMs}ms` }" aria-hidden="true"><img src="/favicon.svg" alt="" /></span>
            </div>
          </div>
          <div class="judgment-line" aria-hidden="true"></div>
          <div class="judgment-status" :class="{ visible: gameStatus !== 'PLAY!' && gameStatus !== 'READY' }" role="status" aria-live="polite">
            <b>{{ gameStatus }}</b><span v-if="isCrying">下一拍慢慢來</span>
          </div>
          <div class="lane-controls" aria-label="舞步按鍵">
            <button v-for="(lane, index) in danceLanes" :key="lane.key" class="lane-button" :disabled="!gameActive || gamePaused" :aria-label="`${lane.key} 鍵，${lane.label}`" @click="hitLane(index)">
              <b>{{ lane.key }}</b><span>{{ lane.label }}</span>
            </button>
          </div>
          <div v-if="gamePaused" class="pause-panel" role="status">
            <span>INTERMISSION</span><h3>先喘口氣。</h3><p>節拍已停在原地，準備好再繼續。</p>
            <div><button @click="togglePause">繼續遊戲</button><button @click="startGame">重新開始</button></div>
          </div>
        </section>

        <div v-if="letterSending" class="letter-flight" aria-live="polite">
          <img class="letter-character" src="/images/momo-love-letter.png" alt="抱著心形信件的星乃モモ" />
        </div>
      </div>
      <p class="sr-only">{{ currentLevel.cue }}。可使用 A、S、D、F 鍵或點擊按鍵遊玩。目前漏拍 {{ missCount }} 次。</p>
    </div>
  </div>
</template>
