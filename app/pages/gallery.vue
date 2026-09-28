<script setup>
import { useRouter } from '#imports'
import HeartCardModal from '../../src/components/HeartCardModal.vue'
import { useWardrobe } from '../../src/composables/useWardrobe'

const router = useRouter()
const { unlockedIds, gameCompleted } = useWardrobe()

useHead({ title: '月光小卡圖鑑 | 跳躍心動' })

function closeGallery() {
  router.push({ path: '/', query: { skipOpening: '1' } })
}
</script>

<template>
  <HeartCardModal v-if="gameCompleted" :unlocked-ids="unlockedIds" @close="closeGallery" />
  <RouteGate v-else title="小卡圖鑑還在月光後台" description="完成一輪月光節拍後，Momo 才會把今晚的小卡圖鑑交給你。" action-label="前往遊玩" to="/game" />
</template>
