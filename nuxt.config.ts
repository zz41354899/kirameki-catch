import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  css: ['./src/momo-official.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant' },
      title: '跳躍心動 | 星乃モモ時尚舞台',
      titleTemplate: '%s',
      link: [
        { rel: 'icon', type: 'image/webp', href: '/images/electronic-rabbit-head-rotation-00.webp' },
      ],
      meta: [
        { name: 'description', content: '星乃モモ的月光節拍遊戲、成就圖鑑與舞台衣櫥。' },
      ],
    },
  },
})
