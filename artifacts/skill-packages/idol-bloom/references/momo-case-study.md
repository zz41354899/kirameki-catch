# Momo：從角色到互動體驗

本案例以 [GitHub：zz41354899/kirameki-catch](https://github.com/zz41354899/kirameki-catch) 的檔案為查核依據。2026-09-30 核對 `main`，版本為 [110e983](https://github.com/zz41354899/kirameki-catch/tree/110e983209c53b21091879b1906c70c6791a642e)。下方檔案連結固定到這個版本，避免案例內容與後續程式更新混用。

本文件是 skill 內附的案例摘要。使用 skill 不需要下載整個 Momo 專案或擁有 Momo 圖片；需要查核時才開啟下方 GitHub 文件。有網路才能讀取線上來源，連結不會自動匯入程式或素材。

## 案例設定與觀察

| 面向 | Momo 的例子 | 可遷移的設計問題 |
| --- | --- | --- |
| 身份 | 星乃モモ，來自月亮的月兔偶像 | 觀眾能用一句話記住誰？ |
| 擅長與喜好 | 唱歌、跳舞，喜歡吃麻糬 | 她能持續產出什麼？日常細節是否可親近？ |
| 輪廓 | 長粉紅雙馬尾與大兔耳 | 縮小後還能認出哪些特徵？ |
| 主視覺 | 紅白粉金的舞台服、蝴蝶結、鈴鐺、流蘇與毛球 | 哪些細節服務世界觀？哪些細節可簡化？ |
| 表情 | 開心、生氣、疑惑、嚇一跳 | 除了微笑，角色如何回應不同情境？ |
| 故事 | 登場 → 魅力 → 月下共舞 | 如何把認識角色轉成參與邀請？ |
| 操作 | 點擊回應、舞蹈、節奏遊戲 | 使用者做一件事後，角色如何回應？ |
| 完成回饋 | 心動小卡、髮型與服裝獎勵 | 完成之後，留下什麼與角色有關的紀念？ |

網站以奶油白、粉紅、莓果紅、深梅色與局部黃色建立介面層級。舞台設定的霓虹粉與月光金，和網站介面的功能色是不同用途，設計時分別說明。

「今天的我／也很可愛。」等角色台詞，讓文字成為個性的一部分。延伸既有角色時應沿用使用者最新確認的原文，而不是由動畫調整順便重寫文案。

## 從設定推出行為

以下包含案例觀察與教學上的設計推導；推導是可選方法：

- **月兔身份**：兔耳與月亮符號讓世界觀能在第一眼出現；學員應找自己的符號。
- **擅長跳舞**：舞蹈邀請連到節拍操作，角色能力成為參與方式。
- **會表達情緒**：使用者的操作會得到不同表情與短句，避免角色只有待機微笑。
- **一起完成演出**：遊戲完成後出現小卡，讓回饋延續角色關係。
- **服裝可延伸**：初登台服與練習服、雙馬尾與側馬尾提供變化；在新角色中先定義哪些特徵必須保留。

不要把這條故事順序、遊戲或獎勵條件當成必做清單。森林歌手可能先邀請訪客選一段環境聲；機器人主持人可能先邀請回答一個小問題。

## 動態素材的實際界線

舞蹈使用八張姿勢圖片，並搭配網頁動態。這是姿勢關鍵幀與補間體驗，不代表已交付高幀率逐張手繪舞蹈。

GitHub 的網格診斷文件記錄以原圖為紋理的 Hero 變形實作。共用網格能讓頭髮與配件產生局部動態，但原圖沒有畫出的側臉或衣服內部，不會因此自動成為完整素材。

模型參數規劃文件說明 PSD 匯入後的變形器與參數設計。規劃文件不能單獨證明完成 Cubism 綁定、直播追蹤或模型平台驗證。介紹案例時把網頁效果、模型素材準備與模型實際驗證分開。

## 如何教學員做自己的版本

請學員保留「設定 → 視覺 → 行為 → 互動 → 驗證」的思考關係，自行決定主題、風格、聲線描述與表現方式。

例：原創「潮汐郵差」以送信和傾聽為核心。浪形帽沿與信封徽章建立辨識；猶豫時握住郵袋，收到回應時展開信紙；第一個原型是選一句想收到的鼓勵，角色回送一張文字卡。這是新設計示例，不是 Momo 既有功能。

## GitHub 檔案依據

以下是原專案的線上參考，不是學員專案需要具備的檔案。網頁版方便檢視，原文連結供 agent 讀取程式或文件；圖片需使用能查看圖像的工具。

| GitHub 檔案 | 用途 | agent 讀取入口 |
| --- | --- | --- |
| [src/data/story.js](https://github.com/zz41354899/kirameki-catch/blob/110e983209c53b21091879b1906c70c6791a642e/src/data/story.js) | 角色介紹與舞台設定 | [原文](https://raw.githubusercontent.com/zz41354899/kirameki-catch/110e983209c53b21091879b1906c70c6791a642e/src/data/story.js) |
| [src/components/HeroSection.vue](https://github.com/zz41354899/kirameki-catch/blob/110e983209c53b21091879b1906c70c6791a642e/src/components/HeroSection.vue) | 表情、回應文字與角色互動 | [原文](https://raw.githubusercontent.com/zz41354899/kirameki-catch/110e983209c53b21091879b1906c70c6791a642e/src/components/HeroSection.vue) |
| [src/data/wardrobe.js](https://github.com/zz41354899/kirameki-catch/blob/110e983209c53b21091879b1906c70c6791a642e/src/data/wardrobe.js) | 髮型、服裝、動作圖片組合 | [原文](https://raw.githubusercontent.com/zz41354899/kirameki-catch/110e983209c53b21091879b1906c70c6791a642e/src/data/wardrobe.js) |
| [src/components/MomoSprite.vue](https://github.com/zz41354899/kirameki-catch/blob/110e983209c53b21091879b1906c70c6791a642e/src/components/MomoSprite.vue) | 依索引呈現姿勢圖片 | [原文](https://raw.githubusercontent.com/zz41354899/kirameki-catch/110e983209c53b21091879b1906c70c6791a642e/src/components/MomoSprite.vue) |
| [public/images/momo-moon-rabbit-hero-v2.webp](https://github.com/zz41354899/kirameki-catch/blob/110e983209c53b21091879b1906c70c6791a642e/public/images/momo-moon-rabbit-hero-v2.webp) | 角色主視覺 | [查看原圖](https://raw.githubusercontent.com/zz41354899/kirameki-catch/110e983209c53b21091879b1906c70c6791a642e/public/images/momo-moon-rabbit-hero-v2.webp) |
| [artifacts/momo-rig-qa/diagnosis.md](https://github.com/zz41354899/kirameki-catch/blob/110e983209c53b21091879b1906c70c6791a642e/artifacts/momo-rig-qa/diagnosis.md) | 網格實作與限制紀錄 | [原文](https://raw.githubusercontent.com/zz41354899/kirameki-catch/110e983209c53b21091879b1906c70c6791a642e/artifacts/momo-rig-qa/diagnosis.md) |
| [artifacts/momo-live2d-source/RIG-PARAMETERS.md](https://github.com/zz41354899/kirameki-catch/blob/110e983209c53b21091879b1906c70c6791a642e/artifacts/momo-live2d-source/RIG-PARAMETERS.md) | 模型參數規劃 | [原文](https://raw.githubusercontent.com/zz41354899/kirameki-catch/110e983209c53b21091879b1906c70c6791a642e/artifacts/momo-live2d-source/RIG-PARAMETERS.md) |

GitHub 網頁或原文無法讀取時，可使用可用的 GitHub 文件讀取工具；若仍無法取得，依本文件的案例摘要完成角色企劃，標示線上內容未讀取。不要在學員專案找上述路徑，也不要替學員建立同名的空檔案。

需要看最新實作時，另讀 [GitHub main](https://github.com/zz41354899/kirameki-catch/tree/main) 並記錄當次版本；更新案例前比對差異。本機修改、GitHub 與部署網站可能不同，不從案例文件推定當前框架、按鍵、路由或部署狀態。
