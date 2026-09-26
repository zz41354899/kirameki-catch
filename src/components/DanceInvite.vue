<script setup>
defineProps({ cardUnlocked: Boolean })
defineEmits(['play', 'open-card'])
</script>

<template>
  <section id="dance" class="dance-section" aria-labelledby="dance-title">
    <div class="dance-cta reveal-up">
      <div class="cta-visual"><span>PLAY WITH MOMO</span><img src="/images/momo-dance-jump-v2.png" alt="邀請你一起跳舞的星乃モモ" /></div>
      <div class="cta-copy">
        <p>心動應援時間 ♡</p>
        <h2 id="dance-title">要不要，<br>陪我跳完<br><em>這首心動？</em></h2>
        <span>四個舞步、一封回信。接住節拍，モモ就把只屬於你的粉色小卡送到手心。</span>
        <button class="cta-play" @click="$emit('play')"><b>和モモ跳一首</b><small>A · S · D · F / 一首歌的時間</small><i>♡</i></button>
        <button v-if="cardUnlocked" class="cta-card" @click="$emit('open-card')">再次打開我的心動小卡 →</button>
      </div>
    </div>
  </section>
</template>
