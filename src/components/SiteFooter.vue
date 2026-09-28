<script setup>
import { scrollToSection } from '../composables/useSectionNavigation'

function goTop() {
  window.scrollTo({ top: 0, behavior: 'auto' })
}
</script>

<template>
  <footer class="site-footer">
    <button class="footer-go-top" type="button" aria-label="回到頁面頂端" @click="goTop">
      <span aria-hidden="true">↑</span>
      <b>GO TOP</b>
    </button>
    <div class="footer-brand"><img src="/images/lunar-pop-rabbit-mark-v1-small.webp" alt="" loading="lazy" /><strong>LUNAR<br>POP CLUB</strong><p>月亮還亮著，モモ就會繼續陪你跳下去。</p></div>
    <nav aria-label="頁尾導覽"><button type="button" @click="goTop">月下開演</button><button type="button" @click="scrollToSection('story')">月兔檔案</button><button type="button" @click="scrollToSection('dance')">月下共舞</button></nav>
    <div class="footer-meta"><span>© {{ new Date().getFullYear() }} HOSHINO MOMO</span><span>MOON · RHYTHM · RABBIT · LOVE</span></div>
  </footer>
</template>
