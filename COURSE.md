---
meta:
  contentType: Tutorial
  title: 讓網頁動起來：Vue + GSAP × Codex 網頁特效入門
  audience: 網頁設計與前端開發初學者
---

# 讓網頁動起來：Vue + GSAP × Codex 網頁特效入門

這堂課從網站規劃開始，帶你使用 Vue、GSAP 與 Codex，把想法做成具有動畫效果的網頁。你會先學習如何描述網站，再透過「星乃モモ互動舞台」完成規劃、實作、調整與驗證。

## 課程案例

本課程使用同一個案例貫穿所有章節：

- [瀏覽星乃モモ互動舞台](https://kirameki-catch.vercel.app/)
- [查看 kirameki-catch 原始碼](https://github.com/zz41354899/kirameki-catch)
- [查看 Codex 專案提示詞](https://github.com/zz41354899/kirameki-catch/blob/main/CODEX-PROMPT.md)
- [查看課程案例規劃](https://github.com/zz41354899/kirameki-catch/blob/main/COURSE-CASE-PLAN.md)

上課時先瀏覽線上成果，不要先看原始碼。請先用自己的語言描述畫面與動畫，再打開 GitHub 對照 Vue 元件和 GSAP 實作。

## 你會使用的工具

本次課程主要使用：

- Vue 3
- Vite
- GSAP
- Node.js
- npm
- Codex
- Visual Studio Code
- Chrome

主要示範環境為 macOS。Windows 或其他作業系統的安裝方式與 Terminal 指令可能不同。

## 課前準備

上課前完成以下準備：

- [ ] 安裝 Chrome
- [ ] 安裝 Visual Studio Code
- [ ] 安裝 Node.js
- [ ] 確認 npm 可以使用
- [ ] 安裝 Codex
- [ ] 準備可以登入 Codex 的 ChatGPT 帳號
- [ ] 確認可以開啟課程案例與 GitHub 原始碼

## 1. 安裝 Visual Studio Code

課程使用 Visual Studio Code 編輯程式碼。你也可以使用熟悉的程式碼編輯器。

## 2. 安裝 Node.js

Vue 專案需要 Node.js 執行前端開發工具。建議安裝 Node.js 長期支援版（Long-term support，LTS）。

安裝完成後，開啟 Terminal 並確認版本：

```bash
node -v
```

Terminal 顯示版本號，例如 `v24.x.x`，代表 Node.js 已安裝。

接著確認 npm：

```bash
npm -v
```

Terminal 顯示版本號，代表 npm 可以使用。

## 3. 安裝 Codex

這堂課使用 Codex 規劃網站、理解原始碼、建立元件、修改樣式與撰寫動畫。

在 macOS 開啟 Terminal，執行：

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

安裝完成後啟動 Codex：

```bash
codex
```

第一次使用時，依照畫面登入 ChatGPT。看到 Codex 操作介面，代表安裝完成。

## 4. 理解 Codex 在課程中的角色

Codex 是這堂課使用的 AI Coding 工具。你會使用 Codex 完成以下工作：

- 規劃網站架構
- 建立 Vue 元件
- 修改 CSS
- 撰寫 GSAP 動畫
- 找出程式錯誤
- 調整動畫節奏
- 檢查修改範圍
- 執行測試與建置

你可以提出單一、明確的需求：

```text
幫我替這個 Hero Section 加入由下往上淡入的動畫。
```

你也可以先要求分析：

```text
請先分析目前的動畫為什麼看起來太快，
再提供不修改版面的調整方式。
```

AI 不負責替你決定所有設計。你需要先知道自己想做什麼，並把目標、限制與完成條件描述清楚。

## 5. 開始 Coding 前先理解網站

「幫我做一個很有質感的網站」可以產生一個看起來像網站的結果，卻沒有提供可判斷好壞的標準。

開始 Coding 前，先回答以下問題：

- 網站要完成什麼目標？
- 誰會使用？
- 使用者會看到哪些內容？
- 使用者可以完成哪些操作？
- 哪些功能需要資料或後端？
- 視覺風格是什麼？
- 每一段動畫為什麼存在？
- 桌機與手機有什麼差異？
- 完成後如何驗證？

### 課堂練習：先描述案例

開啟[星乃モモ互動舞台](https://kirameki-catch.vercel.app/)，先不要看原始碼。記錄你看到的內容：

1. 首頁先出現什麼？
2. Hero 如何安排標題與角色？
3. 捲動時哪些元素改變？
4. 哪些內容可以點擊？
5. 網站如何引導你進入小遊戲？
6. 動畫是在說故事、引導操作，還是裝飾畫面？

目前線上案例包含愛心開場、Hero、三段角色故事、舞蹈邀請、節奏遊戲、心動小卡與頁尾導覽。

## 6. 分辨 Frontend 與 Backend

Frontend（前端）是訪客看到與操作的部分。Backend（後端）負責網站背後的資料、權限與商業邏輯。

### Frontend 前端

前端常見內容包括：

- Navbar
- Hero
- Button
- Card
- Form
- Responsive Web Design（RWD）
- Hover
- Animation
- Page Transition

本課程的 Vue 與 GSAP 主要處理前端。

### Backend 後端

後端常見內容包括：

- Login
- Database
- Application Programming Interface（API）
- Content Management System（CMS）
- Order
- User Data
- Permission

星乃モモ案例目前是靜態前端網站。角色故事、動畫與小遊戲都在瀏覽器執行，不需要登入、資料庫或 CMS。

### 課堂練習：分類需求

把以下功能分成前端、後端或兩者都需要：

- 點擊按鈕切換角色圖片
- 完成遊戲後顯示心動小卡
- 儲存所有玩家的最高分
- 登入後同步玩家資料
- 捲動時切換故事內容

課堂案例只實作前端需求。不要在沒有需求時加入後端。

## 7. 不要從 Prompt 直接跳到 Code

使用 AI 製作網站時，先建立計畫：

```text
Idea
↓
Goal
↓
Target User
↓
Information Architecture
↓
Design System
↓
Plan
↓
Vue + GSAP
↓
Review
```

不要使用只有三步的流程：

```text
Idea
↓
Prompt
↓
Code
```

Codex 可以加速實作。你的計畫提供判斷結果是否符合需求的依據。

## 8. 建立資訊架構

Information Architecture（IA）中文稱為資訊架構。IA 說明網站有哪些資訊，以及這些資訊如何組織。

作品集網站的 IA 可能是：

```text
Home
├── Hero
├── Selected Works
├── About
└── Contact

Works
├── Project A
├── Project B
└── Project C
```

清楚的 IA 可以轉換成 Vue 元件：

```text
components/
├── Navbar.vue
├── HeroSection.vue
├── ProjectCard.vue
├── AboutSection.vue
└── ContactSection.vue
```

### 星乃モモ案例 IA

```text
Home
├── Opening Screen／愛心放大開場
├── Site Header／品牌與選單
├── Hero／今天，也要被可愛接住。
├── Story／PROFILE、CHARM、DREAM
├── Dance Invite／舞蹈與遊戲邀請
├── Rhythm Game Modal／Q、W、E、R 旋律節奏遊戲
├── Heart Card Modal／完成後取得心動小卡
└── Site Footer／導覽與收尾文案
```

這份 IA 對應以下主要元件：

```text
src/components/
├── OpeningScreen.vue
├── SiteHeader.vue
├── HeroSection.vue
├── StorySection.vue
├── DanceInvite.vue
├── RhythmGameModal.vue
├── HeartCardModal.vue
└── SiteFooter.vue
```

開啟[案例原始碼](https://github.com/zz41354899/kirameki-catch)，比較 IA 與實際元件是否一致。

## 9. 建立 Design System

Design System 不需要在第一天就涵蓋所有元件。入門專案先定義 Color、Typography、Spacing、Button、Radius 與 Animation。

一個基礎 Design System 可以寫成：

```text
Background
#0A0A0A

Text
#FFFFFF

Accent
#7C5CFF

Spacing
8 / 16 / 24 / 32

Radius
12px

Animation
0.6s
power3.out
```

### 星乃モモ案例 Design System

案例使用以下視覺方向：

- **Cream**：主要背景與留白
- **Momo Pink**：角色與情緒主色
- **Berry Red**：CTA、愛心與操作重點
- **Dark Plum**：主要文字與線條
- **Lemon Yellow**：星星與局部高光

排版規則：

- 繁體中文是主要資訊層級
- 英文與日文用於小標與角色氣氛
- Hero 使用大型標題與階梯式閱讀順序
- 手機版保留自然換行，不裁切文字
- 已確認文案不因動畫調整而被改寫

動畫規則：

```text
Fast feedback    0.15～0.25s
UI transition    0.3～0.5s
Entrance         0.6～0.8s
Default ease     power3.out
Stagger          0.08～0.15s
```

這些規則讓 Codex 產生的畫面與動畫保持一致。

## 10. 觀察 Reference 網站

看 Reference 時先觀察畫面與行為，不要先猜程式碼。

### Case 01：Survedaa

瀏覽[Survedaa](https://survedaa.com/)，記錄以下內容：

- Hero 的排版方式
- 文字與圖片的比例
- 捲動時開始移動的元素
- 文字進場的方向與順序

把觀察寫成可執行描述：

```text
當我往下滑動時，
圖片慢慢放大，
文字由下往上出現。
```

### Case 02：CodeTV GSAP

瀏覽[CodeTV GSAP](https://codetv-gsap-cloud.webflow.io/)，觀察以下效果：

- Scroll Animation
- Mouse Interaction
- Image Movement
- Scale
- Rotation
- Pin
- Scroll-driven Animation

把複雜效果拆成事件與步驟：

```text
Mouse Move
↓
取得滑鼠位置
↓
圖片出現
↓
圖片移動與旋轉
↓
圖片消失
```

複雜動畫通常由多個小動畫組合而成。先描述觸發、起點、變化與終點，再請 Codex 規劃實作。

### Case 03：星乃モモ互動舞台

案例不是 Reference，而是這堂課的完成成果。請比較它如何把觀察轉換成自己的設計：

- 大型文字轉換成繁中階梯式 Hero 標題
- Mouse Interaction 轉換成愛心 Pointer 回饋
- Scroll-driven Animation 轉換成三段角色故事
- 舞台氛圍轉換成舞蹈邀請與節奏遊戲

案例保留自己的角色、文案、顏色與版面，沒有複製 Reference 的品牌內容。

## 11. 比較沒有規劃的 Prompt

以下 Prompt 看似完整，仍然把大量設計決策交給 AI：

```text
使用 Vue 幫我做一個很有質感的創意工作室網站。

希望風格很科技、很未來感。

加入 Hero、About、Services、Projects、FAQ、Contact。

並且使用大量 GSAP 動畫，
加入 Scroll、Parallax、Hover、Mouse Effect。

請直接完成網站。
```

AI 仍要自行決定 IA、Color、Typography、Content、Layout 與 Animation。最後可能每項功能都有，卻沒有清楚的設計方向。

### 套用到課程案例的錯誤版本

```text
請用 Vue 做一個很可愛的動漫角色網站，
加入很多 GSAP 動畫和小遊戲，
直接完成整個網站。
```

這個版本沒有說明角色、目標、使用者、內容、限制或完成條件。

## 12. 先請 Codex 規劃

把 Goal、Target User、IA 與視覺方向交給 Codex，先取得可以檢查的計畫。

原始課程範例：

```text
我要製作一個創意工作室形象網站。

請先不要寫程式。

網站目標：
讓潛在客戶快速了解工作室的服務與過去作品。

Target User：
正在尋找品牌設計與網站設計服務的新創團隊。

網站 IA：

Home
├── Hero
├── Selected Projects
├── Services
├── About
└── Contact

視覺方向：

- Minimal
- Editorial
- Large Typography
- 大量留白
- 黑白為主
- 一個 Accent Color

請先提供：

1. Website Plan
2. IA
3. Component Structure
4. Design System

先不要 Coding。
```

### 星乃モモ案例 Planning Prompt

```text
我要製作一個原創角色互動網站。

請先不要寫程式。

網站目標：
讓第一次看到星乃モモ的訪客快速理解角色個性，
並透過舞蹈邀請與節奏遊戲參與她的角色世界。

Target User：
喜歡日系角色、互動網頁與輕量節奏遊戲的訪客。

網站 IA：
Opening、Hero、Story、Dance Invite、Rhythm Game、Heart Card、Footer。

視覺方向：
日系角色官網、Cream、Momo Pink、Berry Red、Dark Plum、
大型繁中排版、紙張與卡片層次、Playful but polished。

請先提供：

1. Website Plan
2. IA
3. Component Structure
4. Design System
5. Animation Direction

先不要 Coding。
```

工作流程從 `Prompt → Code` 改成：

```text
Plan
↓
Review
↓
Code
```

## 13. 加入單一 GSAP 動畫

網站架構完成後，再針對一個區域加入動畫。

### 原始 Hero 練習

```text
目前網站使用 Vue。

請替 Hero Section 加入 GSAP Entrance Animation。

Heading：
opacity 0 → 1
y 40 → 0

Description：
opacity 0 → 1
y 30 → 0

CTA：
opacity 0 → 1
y 20 → 0

使用 GSAP Timeline。
每個元素間隔 0.15 秒。
duration 使用 0.6～0.8 秒。
ease 使用 power3.out。

只處理動畫。
不要修改目前的 Layout、Typography 與 Color。
```

### 星乃モモ Hero 練習

```text
目前網站使用 Vue 3 與 GSAP。

請只調整 Hero 的進場動畫：

Kicker：opacity 0 → 1、y 20 → 0
Heading：opacity 0 → 1、y 40 → 0
Description：opacity 0 → 1、y 24 → 0
Character：opacity 0 → 1、scale 0.94 → 1

使用同一條 GSAP Timeline，
每個階段間隔 0.12 秒，
duration 使用 0.6～0.8 秒，
ease 使用 power3.out。

保留「今天，也要／被可愛／接住。」的階梯式排版。
不要修改文案、圖片、Layout、Typography 與 Color。
請清除元件卸載後的動畫，並支援 prefers-reduced-motion。
```

Prompt 要說清楚可以修改的內容、不能修改的內容與完成條件。

## 14. 把 Reference 轉換成設計規則

Reference 用來觀察與分析，不是直接 Copy。

你可以使用以下 Prompt：

```text
參考：

https://survedaa.com/
https://codetv-gsap-cloud.webflow.io/

我喜歡這些網站的：

- Large Typography
- Scroll-driven Animation
- Image Scale
- Mouse Interaction

請分析這些特徵，
整理成適合目前星乃モモ專案的 Animation Direction。

保留本專案既有角色、文案、色彩與元件結構。
不要直接複製原網站。
先提供分析，不要修改程式。
```

Reference 的正確流程是：

```text
Reference
↓
Observe
↓
Describe
↓
Analyze
↓
建立自己的規則
↓
Implementation
```

不要使用 `Reference → Copy` 的流程。

## 15. 使用 Vue 與 GSAP 實作案例

這堂課不要求你先背完 Vue 或 GSAP 語法。你會從畫面與效果出發，再理解相關程式。

### 取得案例原始碼

在 Terminal 執行：

```bash
git clone https://github.com/zz41354899/kirameki-catch.git
cd kirameki-catch
npm install
npm run dev
```

Vite 會顯示本機網址。預設通常是 `http://127.0.0.1:5173/`。

### 先理解元件和資料

請 Codex 先說明原始碼，不要立刻修改：

```text
請先閱讀 src/App.vue、src/components、src/composables
與 src/data/story.js。

請用初學者可以理解的方式說明：

1. 頁面分成哪些 Vue 元件
2. 角色故事資料放在哪裡
3. GSAP 動畫由哪些 composables 管理
4. 節奏遊戲和心動小卡如何切換
5. 哪些狀態由 App.vue 管理

先不要修改程式。
```

### 課堂實作 A：Hero Entrance

使用第 13 章的 Hero Prompt，調整標題、說明和角色進場。

### 課堂實作 B：Story Scroll Reveal

```text
請分析 StorySection 的捲動行為。

當訪客通過三個捲動階段時，
依序切換 PROFILE、CHARM、DREAM 的文字與圖片。

請維持目前 Layout 和 story.js 資料，
只調整切換動畫與 ScrollTrigger 節奏。

元件卸載時清除動畫。
prefers-reduced-motion 下直接顯示可操作內容。
```

### 課堂實作 C：小遊戲回饋

```text
請保留 RhythmGameModal 的遊戲規則與計分方式。

替成功輸入 Q、W、E、R 的旋律操作加入短暫視覺回饋，
並確認鍵盤、滑鼠與觸控可以完成同一個任務。

不要修改角色文案、關卡長度與解鎖條件。
不要讓動畫造成 layout shift。
```

### 課堂 Debug

不要只要求 Codex「修好動畫」。描述你看到的問題與不能改動的內容：

```text
請先分析，不要立刻重寫。

目前 Hero 動畫太快，
標題、說明和角色幾乎同時出現，
看不出視覺層次。

請檢查 timeline 的 duration、position 與 stagger，
說明原因，再用最小修改調整節奏。

不要修改版面、文案、字體與顏色。
```

## 16. 驗證開發環境與完成結果

上課前在 Terminal 確認：

```bash
node -v
npm -v
codex
```

三個指令都能正常執行，代表課前環境已準備完成。

修改案例後執行：

```bash
npm test
npm run build
git diff --check
```

接著在瀏覽器檢查：

- 桌機版面
- 約 390 px 寬的手機版面
- 開場動畫完成後的 Hero
- 選單開啟與關閉
- PROFILE、CHARM、DREAM 三個 Story 狀態
- Dance Invite 與節奏遊戲
- 心動小卡解鎖流程
- 滑鼠、觸控與鍵盤操作
- `prefers-reduced-motion` 模式
- Console error 與 warning

本機 build 成功不代表 Vercel 已部署。本機原始碼、GitHub 與 Vercel 可能處於不同版本，回報結果時要說明驗證範圍。

## 延伸練習：用 Idol Bloom 設計自己的虛擬偶像

把 Momo 的設計經驗帶到自己的原創角色，從身份、個性與辨識特徵開始，再決定角色如何回應觀眾。主題與畫風由你決定。

- [Skill 指令](./skills/idol-bloom/SKILL.md)：agent 使用的設計流程。
- [Momo 案例](./skills/idol-bloom/references/momo-case-study.md)：角色設定如何連到視覺與互動。
- [學員設計表與四個練習](./skills/idol-bloom/references/student-workbook.md)：可直接填寫與使用的 Prompt。
- [素材與動態規格](./skills/idol-bloom/references/asset-and-motion-guide.md)：主視覺、表情與動作的一致性檢查。
- [主題與場景設計](./skills/idol-bloom/references/theme-and-scene-guide.md)：角色建立後，由身份與活動推導背景，沿用角色畫風、光線與視角。
- [立繪與生圖](./skills/idol-bloom/references/illustration-and-imagegen-guide.md)：可分開做立繪、背景、合成圖與表情，也可依序完成整組。
- [設計參考庫](./skills/idol-bloom/references/reference-library.md)：17 筆官方案例、設計教學與技術文件，每筆附有觀察方向、練習與轉化方法。
- [下載 skill 壓縮包](./artifacts/skill-packages/idol-bloom.zip)：含完整 skill 與參考文件。

### 在自己的 Codex 專案使用

只需要安裝 Idol Bloom 的完整 skill 資料夾，不需要取得整個 Momo 網站。它是 agent 的設計指引，沒有需要在 Vue／Nuxt 程式中 import 的套件。

#### GitHub 案例與 skill 安裝來源

[Momo 案例](./skills/idol-bloom/references/momo-case-study.md)附有已確認的 GitHub 程式、圖片與規劃文件網址，供 agent 查核；這些網址不會自動把原專案匯入你的網站。

本教材提供完整 skill 壓縮包，內含各階段的設計指南。若改從 GitHub 安裝，需先確認實際發布的 repo、ref 與 path，不能把 Momo 案例檔案網址當成 skill 安裝網址。

如果只下載 `SKILL.md`，agent 可以使用核心流程；需要延伸文件時請補齊完整資料夾。沒有網路時仍可使用內附案例摘要完成基本提案，但無法核對線上參考。沒有角色圖片時，可先做繪圖描述；若要求實作，可用標示清楚的佔位素材建立原型。

#### 使用壓縮包或專案內安裝

解壓縮後，把整個 `idol-bloom` 資料夾放到自己專案的 `.agents/skills/`，保留 `agents/` 與 `references/`。目錄應為：

```text
你的專案/
└── .agents/
    └── skills/
        └── idol-bloom/
            ├── SKILL.md
            ├── agents/openai.yaml
            └── references/
```

若要跨專案使用，可放到個人目錄的 `~/.agents/skills/`。Codex 會偵測技能變更；未出現時重新啟動。使用方式依 [OpenAI 官方技能文件](https://learn.chatgpt.com/docs/build-skills)，查核日期為 2026-09-30。

也可以直接把本專案的 `skills/idol-bloom/SKILL.md` 路徑交給 agent，要求它讀取並套用。

### 零基礎學員的第一個 Prompt

```text
請使用 $idol-bloom。
我不會設計、不會畫圖，也不知道要做什麼角色。
請用具體範例帶我開始，不要先叫我填完整設定表。
如果我還是不知道，請推薦一個方向，先完成可修改的入門提案。
這次先做角色介紹、固定外觀、代表台詞與立繪規格。
先不做背景與程式，等角色建立後再討論場景。
```

你只要用生活語言回答，例如「想要陪伴的感覺」「喜歡貓」「不要粉紅色」。agent 會把喜好轉成角色提案，解釋設計理由；看到成果後，再說喜歡什麼、想改什麼。[學員練習](./skills/idol-bloom/references/student-workbook.md)附有具體方向與「完全不知道」時的完整示範。

### 已有角色後，分開做場景

先提供已有角色摘要與實際立繪，再貼上：

```text
請使用 $idol-bloom，這次只做搭配目前角色的官網背景。
先從角色身份與活動構思場景，沿用立繪畫風、光線與視角，
保留人物位置和文案空間，再生成一張無角色的獨立背景。
不要重畫角色或增加表情；請附場景規格與檔案位置。
```

角色與場景可以在不同對話完成。角色階段會附可沿用摘要；換對話時，帶入摘要與圖片，讓 agent 能實際查看。只要場景企劃時，改成「先提供提案與 Prompt，不生圖」。

### 一次提出整組需求，依序生圖

```text
請使用 $idol-bloom。
我不會設計，請以〔我喜歡的主題／由你推薦〕設計一位原創虛擬偶像。
用途是角色官網，想帶給觀眾〔陪伴／活力／幽默〕的感覺。
請先建立角色定位、概略世界觀、固定造型與一張透明全身立繪，
再從角色構思場景，生成一張無角色背景、一張合成主視覺、兩張表情變體。
背景配合已有立繪的畫風、光線與視角，說明場景如何連到角色活動。
每張圖片分開交付，附檔案位置、Prompt 與檢查結果。
沒指定的小細節請做成可修改提案，不必先叫我填表；本次不寫程式。
```

圖片工具可用時，agent 會先建立角色基準，再構思場景並以實際圖片為參照完成其他素材。五張是這個 Prompt 指定的範圍；只做立繪或背景也可以獨立交付。角色圖與場景分開保存，手機需要不同構圖時另外指定；只要企劃時，改成「先提供規格與 Prompt，不生圖」。

### 已有想法時的 Prompt

```text
請使用 $idol-bloom，幫我設計一位原創虛擬偶像。

主題：〔例如森林、海洋、太空或城市〕。
受眾：〔想讓誰喜歡這位角色〕。
想帶給觀眾的感受：〔陪伴、勇氣、幽默或其他〕。
第一個成果：一個角色介紹與互動網頁。

請先整理角色定位、固定辨識特徵、表情素材需求與一個互動流程。
先不要寫程式；未確定的設定請標示為提案。
```

完成後，請同學說出你的角色身份與代表行為，再檢查表情是否一致、操作是否清楚。有實作時檢查手機、鍵盤與減少動態狀態。課程中的角色企劃與網頁原型，和後續直播模型製作分別驗收。

## 這堂課會學到什麼

完成課程後，你可以：

- 解釋 Frontend 與 Backend 的差異
- 使用 IA 整理網站內容
- 建立入門 Design System
- 觀察 Reference 的排版與互動
- 描述動畫的觸發、起點、變化與終點
- 使用 Prompt 和 Context 限定修改範圍
- 使用 Codex 規劃網站與理解原始碼
- 使用 Vue 與 GSAP 完成網頁動畫
- 使用 AI 分析、調整與 Debug
- 驗證 RWD、操作與無障礙狀態

## 你不需要事前具備什麼

這是一堂入門課。你不需要：

- 熟悉完整 JavaScript 語法
- 背誦 Vue 語法
- 背誦 GSAP 語法
- 擅長撰寫長篇 Prompt
- 從零獨立完成整個專案

具備基本 HTML、CSS 與網頁結構概念即可。

## 課程結論

AI 可以加速網站製作，但你仍需要先理解網站、描述設計，並檢查結果。

```text
想法
↓
Goal 和 Target User
↓
IA
↓
Design System
↓
Reference Analysis
↓
Prompt 和 Plan
↓
Vue + GSAP
↓
調整、驗證與優化
```

> 先理解，再描述，最後讓它動起來。

## 教師備註：如何拆分 Prompt

不要在第一堂課把完整專案 Prompt 一次交給學員。依進度拆成六輪：

1. **網站規劃**：Goal、Target User、IA
2. **視覺方向**：Design System、Reference observations
3. **程式架構**：Vue component structure、data flow
4. **單一動畫**：GSAP trigger、from、to、duration、ease
5. **修改限制**：保留 Layout、Typography、Color、copy
6. **驗證條件**：RWD、keyboard、reduced motion、build

每輪都先請學員寫下自己的描述，再與 Codex 的規劃和原始碼比較。
