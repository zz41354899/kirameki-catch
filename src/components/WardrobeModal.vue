<script setup>
import { ref } from 'vue'
import { hairStyles, outfits } from '../data/wardrobe'
import { useModalFocus } from '../composables/useModalFocus'
import MomoSprite from './MomoSprite.vue'

const props = defineProps({
  appearance: { type: Object, required: true },
  unlockedIds: { type: Array, required: true },
})
const emit = defineEmits(['close', 'select-hair', 'select-outfit'])
const modal = ref(null)
const close = () => emit('close')
useModalFocus(modal, close)
</script>

<template>
  <div ref="modal" class="experience-modal wardrobe-modal" role="dialog" aria-modal="true" aria-labelledby="wardrobe-title">
    <div class="wardrobe-shell">
      <button type="button" class="modal-close wardrobe-close" aria-label="關閉 Momo 舞台衣櫥" @pointerup.stop.prevent="close" @click.stop="close"><span aria-hidden="true">×</span></button>
      <div class="modal-panel wardrobe-dialog">
        <header class="wardrobe-intro">
          <p>MOMO'S STAGE WARDROBE</p>
          <h2 id="wardrobe-title">把今晚的<br><em>月光穿上身。</em></h2>
          <span>髮型與服裝各自選擇；關閉衣櫥後，遊戲角色會立刻換上目前搭配。月光小卡仍是獨立功能。</span>
        </header>
        <div class="wardrobe-workbench">
          <aside class="doll-display" aria-label="目前選擇的 Momo 舞台造型">
            <span>NOW PERFORMING</span>
            <MomoSprite class="paper-doll-momo" :hair-id="appearance.hairId" :outfit-id="appearance.outfitId" :frame="0" label="目前的 Momo 遊戲造型" />
            <p>HAIR · {{ hairStyles.find((item) => item.id === appearance.hairId)?.name }}<br>OUTFIT · {{ outfits.find((item) => item.id === appearance.outfitId)?.name }}</p>
          </aside>
          <div class="wardrobe-options">
            <section aria-labelledby="hair-title">
              <div class="wardrobe-section-title"><p>01 / HAIR</p><h3 id="hair-title">髮型</h3></div>
              <div class="wardrobe-grid">
                <button v-for="item in hairStyles" :key="item.id" type="button" class="wardrobe-item" :class="{ locked: !unlockedIds.includes(item.id), active: appearance.hairId === item.id }" :disabled="!unlockedIds.includes(item.id)" :aria-pressed="appearance.hairId === item.id" @click="emit('select-hair', item.id)">
                  <span class="wardrobe-item-icon" aria-hidden="true">{{ unlockedIds.includes(item.id) ? '✦' : '⌁' }}</span><b>{{ unlockedIds.includes(item.id) ? item.name : '月光封存中' }}</b><small>{{ unlockedIds.includes(item.id) ? item.note : item.condition }}</small>
                </button>
              </div>
            </section>
            <section aria-labelledby="outfit-title">
              <div class="wardrobe-section-title"><p>02 / OUTFIT</p><h3 id="outfit-title">服裝</h3></div>
              <div class="wardrobe-grid">
                <button v-for="item in outfits" :key="item.id" type="button" class="wardrobe-item" :class="{ locked: !unlockedIds.includes(item.id), active: appearance.outfitId === item.id }" :disabled="!unlockedIds.includes(item.id)" :aria-pressed="appearance.outfitId === item.id" @click="emit('select-outfit', item.id)">
                  <span class="wardrobe-item-icon" aria-hidden="true">{{ unlockedIds.includes(item.id) ? '♡' : '⌁' }}</span><b>{{ unlockedIds.includes(item.id) ? item.name : '月光封存中' }}</b><small>{{ unlockedIds.includes(item.id) ? item.note : item.condition }}</small>
                </button>
              </div>
            </section>
            <p class="wardrobe-rule">造型切換只影響節奏遊戲中的 Momo；結算後的月光小卡仍是一個獨立功能。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
