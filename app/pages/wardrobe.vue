<script setup>
import { useRouter } from '#imports'
import WardrobeModal from '../../src/components/WardrobeModal.vue'
import { useWardrobe } from '../../src/composables/useWardrobe'

const router = useRouter()
const { appearance, unlockedIds, gameCompleted, setHair, setOutfit } = useWardrobe()

useHead({ title: '月光衣櫥 | 跳躍心動' })
</script>

<template>
  <WardrobeModal
    v-if="gameCompleted"
    :appearance="appearance"
    :unlocked-ids="unlockedIds"
    @close="router.push('/game')"
    @select-hair="setHair"
    @select-outfit="setOutfit"
  />
  <RouteGate v-else title="衣櫥還在月光後台" description="完成一輪月光節拍後，Momo 才會邀請你進入舞台衣櫥。" action-label="前往遊玩" to="/game" />
</template>
