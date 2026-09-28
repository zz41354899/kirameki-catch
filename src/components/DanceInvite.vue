<script setup>
defineProps({ cardUnlocked: Boolean })
const emit = defineEmits(['play', 'open-card'])
</script>

<template>
  <section id="dance" class="dance-section" aria-labelledby="dance-title">
    <div class="dance-cta reveal-up">
      <div class="cta-visual"><span>LUNAR RHYTHM</span><img src="/images/momo-moon-rabbit-hero-v2.webp" alt="邀請你一起跳舞的月兔 Momo" loading="lazy" decoding="async" /></div>
      <div class="cta-copy">
        <p>MOON RABBIT LIVE ☾</p>
        <h2 id="dance-title">和偶像<br>モモ一起<br><em>跳進月光</em></h2>
        <span>四個舞步、一輪滿月。接住每個節拍，讓モモ把今夜專屬的月光小卡送到你手心。</span>
        <button class="cta-play" @click="emit('play')"><b>開始月下共舞</b><small>A · S · D · F / LUNAR RHYTHM</small><i>♡</i></button>
        <button v-if="cardUnlocked" class="cta-card" @click="emit('open-card')">再次打開我的心動小卡 →</button>
      </div>
    </div>
  </section>
</template>
