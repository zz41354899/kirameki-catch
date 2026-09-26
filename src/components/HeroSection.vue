<script setup>
import { scrollToSection } from '../composables/useSectionNavigation'
</script>

<template>
  <section id="top" class="hero-section" aria-labelledby="hero-title">
    <div class="hero-giant" aria-hidden="true">心動</div>
    <div class="hero-stage-ring" aria-hidden="true"></div>
    <div class="hero-copy">
      <p class="hero-kicker"><span>HOSHINO MOMO</span> 歡迎來到心動劇場</p>
      <h1 id="hero-title" class="hero-title"><span class="hero-title-lead">今天，也要</span><span class="hero-title-main">被可愛</span><span class="hero-title-tail">接住。</span></h1>
      <p class="hero-intro">把你的小小心事交給モモ，<br>讓閃閃發亮的旋律，替今天綁上一個粉色蝴蝶結。</p>
    </div>
    <img class="hero-character" src="/images/momo-hero-reach.png" alt="向你伸出手的星乃モモ" />
    <p class="hero-side-note">MOVE YOUR MOUSE<br>AND FOLLOW MY HEART.</p>
    <button class="hero-scroll-cue" type="button" @click="scrollToSection('story')"><span>SCROLL TO SYNC</span><b>↓</b></button>
    <div class="hero-heart-orbit" aria-hidden="true"><img v-for="n in 4" :key="n" src="/favicon.svg" alt="" /></div>
  </section>
</template>
