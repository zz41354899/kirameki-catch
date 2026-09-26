<script setup>
import { scrollToSection } from '../composables/useSectionNavigation'
</script>

<template>
  <footer class="site-footer">
    <div class="footer-brand"><img src="/favicon.svg" alt="" /><strong>MOMO'S<br>LITTLE THEATER</strong><p>如果今天有一點點累，就讓モモ多喜歡你一點點。</p></div>
    <nav aria-label="頁尾導覽"><button type="button" @click="scrollToSection('top')">首頁</button><button type="button" @click="scrollToSection('story')">關於モモ</button><button type="button" @click="scrollToSection('dance')">心動小遊戲</button></nav>
    <div class="footer-meta"><span>© {{ new Date().getFullYear() }} HOSHINO MOMO</span><span>SCROLL · DANCE · SEND · DOWNLOAD</span></div>
  </footer>
</template>
