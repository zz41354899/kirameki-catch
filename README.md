# 心動宣言! — 星乃モモ的心動小宇宙

Vue 3 + Vite + GSAP 的原創角色互動網站，以繁體中文為主。延續星乃モモ的粉色雙馬尾與奶油黃配色，使用信封、邀請卡、蝴蝶結、角色手帳和橫向動作卡，建立可點擊、可捲動的日系角色官網。

## 課程教材與線上案例

- [完整課程教材](./COURSE.md)：整合 Vue、GSAP、Codex、IA、Design System、Reference、Prompt 與實作練習。
- [課程案例規劃](./COURSE-CASE-PLAN.md)：教師備課流程、學員產出與案例拆解。
- [Codex 專案提示詞](./CODEX-PROMPT.md)：專案 Context、設計規則、動畫限制與驗證條件。
- [線上成果](https://kirameki-catch.vercel.app/)：上課時先觀察完成畫面，再回到原始碼分析。
- [GitHub 原始碼](https://github.com/zz41354899/kirameki-catch)：對照 Vue 元件、GSAP 動畫與設計紀錄。

## 本機啟動與建置

```sh
npm install
npm run dev
```

預設開啟 [本機開發網站](http://127.0.0.1:5173/)。若連接埠被占用，請使用 Vite 終端輸出的網址。

```sh
npm run build
npm run preview
```

正式靜態檔案輸出到 `dist/`；預覽網址以終端輸出為準，通常為 [本機正式版預覽](http://127.0.0.1:4173/)。`啟動遊戲.command` 沿用為雙擊啟動入口。原本的小遊戲檔案仍保留，但目前首頁不載入遊戲；`npm test` 僅涵蓋保留的遊戲邏輯，不能取代新版網頁互動驗證。

## 頁面與互動

| 區域 | 內容與操作 |
| --- | --- |
| 心動邀請開場 | 信封與心形封印進場，モモ從邀請卡升起，逐字顯示「把今天，變可愛。」，最後上下紙幕揭開網站。 |
| 首頁 `#top` | 中央角色主視覺、個人來信、心情明信片與回應字卡。點角色觀看八個姿勢；點「心動／閃耀／全力」同步切換角色與文字；點標題「變可愛。」觸發回應。 |
| 角色手帳 `#character` | 切換「蝴蝶結／草莓牛奶／聚光燈」，更新角色姿勢和日常小故事。 |
| 心動舞台 `#stage` | 捲動演出、播放控制、繁中逐字應援大字、日文小標與可編輯字幕。 |
| 可愛圖鑑 `#frames` | 橫向滑動的八張動作卡；使用箭頭瀏覽，點卡片前往舞台對應姿勢，也可下載透明圖集。 |
| 結尾與導覽 | 再次進入舞台、重播開場、回到頁首；手機另有可展開導覽。 |

`ReactiveWord.vue` 將可操作文字保留為原生按鈕，支援滑鼠、觸控與鍵盤。`useWorldMotion.js` 集中處理頁面 GSAP 動畫與角色回應；`DanceStage.vue` 自行管理舞台時間線，避免頁面效果干擾演出控制。

## 3.13 秒開場

`OpeningInvite.vue` 使用既有 `MomoSprite` 第 5 張比心姿勢（`frame=4`），不需新增圖檔。GSAP timeline 的總長為 **3.13 秒**；每次掛載都播放一次，目前每次載入頁面也會播放，沒有寫入 sessionStorage 或 localStorage。

| 時間 | 視覺節點 |
| --- | --- |
| 約 0.45 秒 | 奶油信封與愛心封印出現。 |
| 約 1.2 秒 | 信封打開，邀請卡與モモ升起。 |
| 1.85–2.3 秒 | 完整角色邀請卡與繁中標題停留。 |
| 2.48–3.13 秒 | 內容退場，上下紙幕揭開網站。 |

最小接線方式如下；完整的頁面鎖定與焦點還原可參考 `App.vue`：

```vue
<script setup>
import { ref } from 'vue'
import OpeningInvite from './components/OpeningInvite.vue'

const introOpen = ref(true)
function finishIntro() { introOpen.value = false }
function replayOpening() { introOpen.value = true }
</script>

<template>
  <OpeningInvite v-if="introOpen" @complete="finishIntro" />
  <div :inert="introOpen">
    <!-- 網站內容 -->
    <button @click="replayOpening">重播開場</button>
  </div>
</template>
```

元件不接收 props；父層以 `v-if` 卸載、重新掛載來重播。元件只發出一次 `complete`：動畫完成、點「跳過開場」、按 Esc、減少動態偏好啟用，或 4.5 秒保底計時到期時，均會結束開場。

開場內只有「跳過開場」一個可聚焦元素，掛載時接收焦點，Tab／Shift+Tab 留在該按鈕。父層負責背景 `inert`、保存並還原 `body.style.overflow`、關閉後的焦點還原與首頁進場動畫。現有 `App.vue` 在首次結束後聚焦主標題，重播後則回到觸發重播的按鈕。

初始或播放途中啟用 `prefers-reduced-motion: reduce` 會直接關閉開場。卸載時移除偏好監聽器、清除保底計時並 `context.revert()`，不留下動畫與事件監聽。

## 八幀舞台與文字

- 八個姿勢依序為登場、招呼、左指、右指、比心、應援、跳躍、謝幕。
- **素材是八張姿勢關鍵幀搭配 GSAP 補間位移與文字動畫，並非高幀率逐張手繪舞蹈。**
- 舞台基準長度為 8 秒，一秒對應一個姿勢；可選 0.5×／1×／1.5×，播放、暫停、前後換幀或拖曳滑桿。進入頁面不會自動播放舞台。
- 固定舞台的捲動距離為 `max(1400px, 視窗高度 × 2)`。捲動與手動控制操作同一條 timeline，實際捲動時接管播放；ScrollTrigger refresh 不會任意覆蓋手動播放。
- 選擇關鍵幀時停在該秒的 `+0.56s`，呈現已站穩的姿勢與文字；減少動態模式直接停在該幀起點。`selectPose(index)` 接受 0–7，會先前往對應舞台位置再選幀。
- 角色、繁中應援大字、日文小標、字幕與幀索引同步。點「心動／點我比心」印章切換至比心姿勢。
- 每幀字幕可即時編輯，最多 28 個字元；輸入框聚焦會暫停，捲動也不會在輸入途中切換字幕所屬幀。變更只保留於本次頁面，重新整理還原。
- 減少動態模式取消固定捲動與裝飾位移，保留手動換幀及播放。偏好動態切換會重建完整 timeline，保留進度並暫停；離開舞台或切換分頁也會暫停。
- 無音軌；使用原創短句，沒有嵌入歌曲歌詞。

`src/data/choreography.js` 的 `shout`、`accent`、`caption`、`side` 為繁中舞台文字，`japanese` 保留日文小標；同一份資料也供圖鑑使用。

## 角色素材

星乃モモ（Hoshino Momo）為 22 歲原創舞台表演者。角色使用粉色雙馬尾、星星髮夾、奶油色襯衣、粉色蝴蝶結洋裝與瑪莉珍鞋。生成提示保留於 `ASSET-PROMPT.md`。

`public/images/momo-dance-atlas.png` 是 1536 × 1024 RGBA 透明 PNG，4 欄 × 2 列，每格 384 × 512。索引 0–7 從左到右、再由上到下。`MomoSprite.vue` 以 `background-size: 400% 200%` 切換位置；多個角色實例共用同一圖檔。

```vue
<MomoSprite :frame="4" label="モモ比心" />
```

外層設定顯示尺寸，角色維持 3:4 比例。`index.html` 預載圖集；Google Fonts 使用 M PLUS Rounded 1c／DM Sans，字型無法載入時回退系統字型。

## 主要檔案

| 檔案 | 責任 |
| --- | --- |
| `src/App.vue` | 頁面區塊、心情回應、角色手帳、圖鑑導覽、開場狀態與焦點／捲動還原。 |
| `src/components/OpeningInvite.vue` | 3.13 秒可跳過開場與限定範圍樣式。 |
| `src/components/MomoSprite.vue` | 可重用透明角色圖集元件。 |
| `src/components/ReactiveWord.vue` | 可點擊的逐字動畫按鈕。 |
| `src/components/DanceStage.vue` | 演出時間線、捲動、播放控制與字幕編輯。 |
| `src/composables/useWorldMotion.js` | 頁面動畫與角色回應的 GSAP 管理。 |
| `src/data/choreography.js` | 八個動作及舞台文字。 |
| `src/character-world.css` | 角色官網的主要版面與響應式樣式。 |
| `src/showtime.css` | 共用基礎、角色圖集與舞台樣式。 |
| `src/stage-enhancements.css` | 繁中文字卡與舞台互動補充樣式。 |

## 設計與技術參考

- [hololive production 官方網站](https://hololive.hololivepro.com/)：角色官網與角色內容呈現方向。
- [《時々ボソッとロシア語でデレる隣のアーリャさん》官方網站](https://roshidere.com/)：動漫主視覺、文字層次與精緻裝飾方向。
- 互動構思參考：[Illoca](https://illoca.unseen.co/)、[Nodeck](https://www.nodeck.online/)、[Don't Board Me](https://dontboardme.com/)。
- GSAP 官方：[文件入口](https://gsap.com/docs/v3/)、[Timeline](https://gsap.com/docs/v3/GSAP/Timeline/)、[matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/)、[context](https://gsap.com/docs/v3/GSAP/gsap.context()/)、[ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)、[SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)。
- 初始舞台氛圍參考：[しぐれうい官方 MV](https://www.youtube.com/watch?v=A-M0zMeG_Ec)。角色、文案與動作素材屬本專案設計，未嵌入原曲、原角色或原 MV。

本專案交付為本機可執行的靜態網站；建置成功不代表已部署。開場、鍵盤、動態偏好切換、字幕編輯與手機版操作需另以瀏覽器驗證。
