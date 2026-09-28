# 課程案例規劃：用 Vue + GSAP 打造星乃モモ互動網站

## 案例定位

本課程不只示範「如何寫出一段動畫」，而是帶學員走完一次完整的 AI 網頁製作流程：

```text
模糊想法
↓
網站目標與使用者
↓
Reference 觀察與拆解
↓
IA 資訊架構
↓
Design System
↓
Vue 元件規劃
↓
GSAP 動畫規劃
↓
使用 Codex 實作與修改
↓
RWD、無障礙與驗證
```

貫穿課程的實作案例是「星乃モモ互動舞台」：一個使用 Vue 3、Vite 與 GSAP 製作的原創角色互動網站。

## 案例網址

- 線上成果：[星乃モモ互動舞台](https://kirameki-catch.vercel.app/)
- 完整原始碼：[GitHub — zz41354899/kirameki-catch](https://github.com/zz41354899/kirameki-catch)

課堂先看線上成果，再進入 GitHub 對照原始碼。這個順序先訓練觀察和描述，避免學員一開始就被程式碼牽著走。

這個案例適合教學，因為它同時包含：

- 清楚的角色與網站目標。
- Hero、角色介紹、舞台、卡片與 Footer 等常見頁面結構。
- Entrance、Scroll、Hover、Mouse／Pointer 與 Timeline 動畫。
- 桌機、手機、鍵盤與減少動態模式。
- 可以拆成多個階段，不必一次把整站做完。

## 課程成果

完成課程後，學員應該能夠：

1. 分辨 Frontend 與 Backend 的需求。
2. 把模糊想法整理成網站目標、Target User 與 IA。
3. 從參考網站觀察排版、互動與動畫，而不是直接複製。
4. 建立簡單且一致的 Design System。
5. 把頁面拆成合理的 Vue 元件。
6. 用自然語言描述 GSAP 動畫的觸發、起點、終點、時間與緩動。
7. 使用 Codex 規劃、實作、修改與 Debug。
8. 知道哪些內容可以改、哪些內容應保留。
9. 檢查 RWD、鍵盤操作、減少動態模式與 Console 錯誤。

## Reference 與案例網址

Vercel 網址是案例成果，GitHub 網址是實作證據。Survedaa、CodeTV GSAP 等外部網站才是設計 Reference。課堂應清楚區分三種用途。

網址加入後，課堂只分析下列面向：

- Hero 的視覺層級與版面比例。
- 文字、圖片與留白如何安排。
- 捲動時有哪些元素開始移動。
- 動畫由什麼事件觸發。
- 元素的位移、縮放、旋轉、透明度與先後順序。
- 哪些設計原則適合移植到星乃モモ案例。
- 哪些品牌、角色、文案或版面不應複製。

分析結果應轉換成規則，例如：

```text
觀察：主視覺圖片會在捲動時逐漸放大。

規則：在自己的 Hero 使用小幅度 scale 動畫，
讓角色靠近觀眾，但不複製原網站的圖片與構圖。

實作描述：當 Hero 從畫面頂部離開時，
角色圖片從 scale 1 緩慢變成 1.08，
動畫進度與捲動位置同步。
```

## 原本課程內容如何放進案例

| 原本教學主題 | 在星乃モモ案例中的用途 | 學員產出 |
| --- | --- | --- |
| Frontend／Backend | 判斷角色切換、動畫與字幕是否需要後端 | 功能分類表 |
| IA | 整理開場、Hero、Story、遊戲與心動小卡 | 網站樹狀圖 |
| Design System | 定義奶油白、粉紅、莓果紅、字體、間距與動畫節奏 | Design tokens |
| Reference | 分析提供的網址與其他互動網站 | Reference observation |
| Prompt 與 Context | 把設計規則和修改限制交代給 Codex | 第一版專案 Prompt |
| Vue | 把頁面拆成元件與資料 | 元件結構 |
| GSAP | 製作 Hero、捲動與舞台時間線 | 三種動畫案例 |
| Debug | 調整過快、重疊、跳動或沒有清除的動畫 | 修改 Prompt |
| RWD／Accessibility | 檢查手機、鍵盤與 reduced motion | 驗證清單 |

## 案例背景

### 網站目標

讓第一次看到星乃モモ的訪客，在短時間內理解角色個性，並透過點擊、捲動與舞台演出參與她的角色世界。

### Target User

- 喜歡日系角色、動畫與可愛視覺風格的訪客。
- 想瀏覽角色設定與動作圖鑑的人。
- 對互動式角色官網感興趣的設計或前端初學者。

### 使用者感受

```text
收到邀請
↓
認識角色
↓
產生互動
↓
觀看舞台
↓
收藏喜歡的姿勢
↓
願意再次體驗
```

## 案例 IA

```text
Home
├── Opening Screen／愛心放大開場
├── Site Header／品牌與選單
├── Hero／今天，也要被可愛接住。
├── Story／PROFILE、CHARM、DREAM
├── Dance Invite／舞蹈與遊戲邀請
├── Rhythm Game Modal／Q、W、E、R 旋律節奏遊戲
├── Heart Card Modal／心動小卡
└── Footer／導覽與收尾文案
```

### 每個區域的責任

| 區域 | 主要內容 | 主要互動 | 教學重點 |
| --- | --- | --- | --- |
| Opening | 愛心放大與品牌開場 | 自動完成、reduced motion | GSAP Timeline、背景鎖定 |
| Hero | 角色主視覺、標題與說明 | Pointer、捲動 | Entrance、stagger、pointer feedback |
| Story | PROFILE、CHARM、DREAM | 捲動或直接選擇 | Vue state、ScrollTrigger、同步內容 |
| Dance Invite | 遊戲邀請與角色舞台 | 開始遊戲、打開小卡 | CTA 動態、狀態門檻 |
| Rhythm Game | Q、W、E、R 旋律節奏操作 | 鍵盤、滑鼠、觸控 | 遊戲狀態、計分、焦點管理 |
| Heart Card | 完成遊戲後的回饋 | 關閉、再次遊玩 | Modal、解鎖流程 |
| Footer | 回到首頁、角色介紹或遊戲 | 區段導覽 | 收尾節奏、導覽一致性 |

## Design System

### Color

```text
Cream Background  奶油白
Momo Pink         角色粉紅
Berry Red         重點與操作色
Dark Plum         主要文字與線條
Lemon Yellow      星星與少量高光
```

### Typography

- 繁體中文是主要資訊層級。
- 日文只作為角色氣氛與小標。
- Hero 可使用大字，但手機版必須保持自然換行。
- 內文維持可讀的行高與段落寬度。

### Spacing

```text
8 / 12 / 16 / 24 / 32 / 48 / 64 / 96
```

### Shape

- 卡片使用柔和圓角與紙張層次。
- 按鈕保持清楚邊界與可辨識狀態。
- 裝飾可使用蝴蝶結、愛心、星星與手帳元素，但不能干擾閱讀。

### Motion

```text
Fast feedback    0.15～0.25s
UI transition    0.3～0.5s
Entrance         0.6～0.8s
Story moment     1.0s 以上，以 timeline 組合
Default ease     power3.out
Stagger          0.08～0.15s
```

## 建議課程流程

## Part 1：先看完成案例，不先看程式碼

展示網站，請學員回答：

- 這個網站的目標是什麼？
- 首先看到什麼？
- 哪些地方可以操作？
- 哪些動畫是在引導操作？
- 哪些動畫只是裝飾？

教學重點：先學會觀察與描述，再談實作方式。

## Part 2：比較「沒有規劃」與「先規劃」的 Prompt

### 不完整 Prompt

```text
請用 Vue 幫我做一個很可愛的動漫角色網站，
加入很多 GSAP 動畫，直接完成整個網站。
```

帶學員討論 AI 還需要自行決定哪些事情：

- 網站目標。
- Target User。
- IA。
- 文案與角色設定。
- 顏色與排版。
- 動畫目的與範圍。
- 手機版與無障礙規則。

### 規劃 Prompt

```text
我要製作一個原創角色互動網站。

網站目標：
讓第一次看到星乃モモ的訪客快速理解角色個性，
並透過互動舞台參與她的角色世界。

Target User：
喜歡日系角色與互動網頁的訪客。

IA：
Opening、Hero、Character、Stage、Gallery、Footer。

視覺方向：
奶油白、粉紅、莓果紅、日系角色官網、紙張與卡片層次。

請先提供：
1. Website Plan
2. IA
3. Component Structure
4. Design System
5. Animation Direction

先不要寫程式。
```

教學重點：讓 Codex 先提供可檢查的計畫，再進入 Coding。

## Part 3：分析 Reference 網址

取得網址後，課堂共同完成以下表格：

| 畫面／互動 | 觀察到的行為 | 動畫觸發 | 可轉用的原則 | 不應複製的部分 |
| --- | --- | --- | --- | --- |
| Hero | 待分析 | Load／Scroll／Pointer | 待整理 | 品牌、圖片、文案 |
| Section | 待分析 | Scroll | 待整理 | 原版面比例 |
| CTA | 待分析 | Hover／Click | 待整理 | 原造型與文字 |

接著請 Codex 把觀察結果整理成適合本案例的 Animation Direction，先不要直接修改程式。

## Part 4：Vue 元件與資料

先從靜態結構開始，讓學員看見：

```text
內容資料
↓
Vue state
↓
元件畫面
↓
使用者操作
↓
畫面更新
```

第一階段只完成：

- Hero 結構。
- 一個角色狀態切換。
- 一組故事卡片。
- 基本 RWD。

不要一開始就加入所有動畫。

## Part 5：加入三種 GSAP 動畫

### 練習 A：Hero Entrance

```text
請只替 Hero 加入進場動畫。

Heading：opacity 0 → 1、y 40 → 0
Description：opacity 0 → 1、y 30 → 0
CTA：opacity 0 → 1、y 20 → 0
Character：opacity 0 → 1、scale 0.94 → 1

使用 GSAP Timeline，間隔 0.12 秒，
duration 0.6～0.8 秒，ease power3.out。

不要修改 Layout、Typography、Color 與文案。
```

### 練習 B：Scroll Reveal

```text
請替角色故事卡加入 ScrollTrigger reveal。

卡片進入 viewport 約 75% 時開始，
opacity 0 → 1、y 36 → 0，依序 stagger。

請處理元件卸載清理，
並在 prefers-reduced-motion 下直接顯示內容。
不要修改卡片版面。
```

### 練習 C：角色互動

```text
當使用者點擊「心動」時，
切換到比心姿勢並更新旁邊的短句。

先更新 Vue state，再用 GSAP 製作輕微 scale 與 rotate 回饋。
動畫必須支援滑鼠、觸控與鍵盤，
不能造成版面位移。
```

## Part 6：從動畫問題學 Debug

刻意示範幾個常見問題：

- 動畫太快，看不清楚內容。
- 所有元素一起動，沒有層次。
- ScrollTrigger refresh 後跳到錯誤位置。
- 重複進入頁面後動畫疊加。
- 手機畫面出現水平捲動。
- reduced motion 下內容仍然隱藏。

Debug Prompt 範例：

```text
請先分析，不要立刻重寫。

目前 Hero 動畫看起來太快，
標題、文字、按鈕和角色幾乎同時出現，
使用者無法感受到視覺層次。

請檢查 timeline 的 duration、position 與 stagger，
說明問題原因，再用最小修改調整節奏。
不要改版面與顏色。
```

## Part 7：驗證與回顧

課堂最後不是停在「看起來可以」，而是完成基本驗證：

```bash
npm test
npm run build
git diff --check
```

瀏覽器檢查：

- 桌機版。
- 約 390px 手機版。
- 滑鼠、觸控與鍵盤。
- 開場跳過與重播。
- 捲動動畫與舞台控制。
- `prefers-reduced-motion`。
- Console error／warning。

## 課堂檔案的使用方式

- `COURSE-CASE-PLAN.md`：教師用的案例流程與教學節奏。
- `CODEX-PROMPT.md`：交給 Codex 的完整專案規則與長期 Context。
- `README.md`：完成案例的功能、啟動方式與技術說明。
- `ASSET-PROMPT.md`：角色圖像與動畫圖集的生成紀錄。

實際上課時，不建議一開始就把完整 `CODEX-PROMPT.md` 全部展示給學員。可以依課程進度逐步組合：

```text
第一輪：Goal + Target User + IA
第二輪：Design System + Reference observations
第三輪：Component structure
第四輪：單一 GSAP 動畫需求
第五輪：限制條件 + 驗證方式
```

這樣學員會看見 Prompt 是如何隨著理解增加而變完整，而不是把「很長的 Prompt」誤認為唯一解法。

## 網址搭配方式

1. 開啟 Vercel 成果，請學員只用畫面描述網站。
2. 請學員畫出 IA，指出每段動畫的觸發與目的。
3. 打開 GitHub，比較推測的元件結構和實際原始碼。
4. 從 `CODEX-PROMPT.md` 取出單一需求，請 Codex 修改一個效果。
5. 完成本機測試與 build，再比較本機結果和既有 Vercel 版本。

本機修改不代表公開網址已更新。課堂回報需要區分本機、GitHub 與 Vercel 狀態。

最終課程主軸應保持為：

> 先理解網站，再描述設計與動畫，最後使用 Codex、Vue 與 GSAP 把它實作出來。
