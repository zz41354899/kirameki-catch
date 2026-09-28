<script setup>
import { useRouter } from '#imports'
import RhythmGameModal from '../../src/components/RhythmGameModal.vue'
import { useWardrobe } from '../../src/composables/useWardrobe'

const router = useRouter()
const { appearance, unlockedIds, recordCompletion, setHair, setOutfit } = useWardrobe()

useHead({ title: '月光節拍遊戲 | 跳躍心動' })

function completeGame(result) {
  recordCompletion(result)
  router.push('/gallery')
}

function closeGame() {
  router.push({ path: '/', query: { skipOpening: '1', returnTo: 'dance' } })
}
</script>

<template>
  <RhythmGameModal
    :appearance="appearance"
    :unlocked-ids="unlockedIds"
    standalone
    @close="closeGame"
    @complete="completeGame"
    @select-hair="setHair"
    @select-outfit="setOutfit"
  />
</template>
