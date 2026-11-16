# FDA Voices Insights Tracker - AI Agent Guidelines
 
## 🎯 1. 專案目的 (Project Purpose)

這是一個醫療法規知識庫網站。主要目的是將美國 FDA 官方部落格 "FDA Voices" 的文章，自動轉化為結構化的繁體中文摘要。幫助相關從業人員快速掌握 FDA 政策動態。
 
## 🎨 2. 網頁整體風格 (UI/UX Style)

- **色彩計畫**：以美國 FDA 官方藍色 (`#002B70`) 為主色調，背景使用淺灰白 (`#F8FAFC`) 以降低閱讀疲勞。

- **排版風格**：專業、客觀、俐落。使用卡片式 (Card-based) 設計來呈現每一篇文章的摘要。

- **響應式設計**：必須支援手機與電腦版網頁瀏覽 (Mobile-first)。
 
## 📁 3. 專案結構與檔案放置 (File Structure)

專案採用純前端靜態架構，並使用**高擴充性的「單篇獨立 JSON」儲存方案**。請遵守以下檔案結構：

/ (Root)

├── AGENTS.md # 本專案的 AI 規則說明書 (就是本檔案)

├── index.html # 網頁主視圖

├── style.css # 視覺樣式表

├── app.js # 讀取資料與渲染畫面的邏輯 (先讀取 index.json，再批次非同步讀取單篇 JSON)

└── data/

    ├── index.json # 核心索引清單 (只儲存所有文章 id 的字串陣列)

    └── fda-voices-YYYYMMDD.json # 各篇文章的獨立 JSON 資料庫 (以文章發表日與 ID 命名)
 
## 📝 4. 新增內容時要遵守的兩步驟工作流 (Content Updating Workflow)

當使用者提供新的 FDA Voices 文章連結或內文，要求「新增文章」時，你必須執行以下兩個步驟：
 
### 【步驟一：生成獨立文章 JSON】

在 `data/` 資料夾下建立一個全新的檔案，檔名必須為 `fda-voices-YYYYMMDD.json`（YYYYMMDD 需替換為該文章的發表日期）。

內容必須嚴格遵守以下格式，並將所有內容翻譯為**繁體中文**：

```json

{

  "id": "fda-voices-YYYYMMDD",

  "title": "[繁中翻譯標題]",

  "original_title": "[英文原標題]",

  "author": "[作者姓名與職稱, 例如: Robert M. Califf, M.D., FDA 局長]",

  "date": "YYYY-MM-DD",

  "summary": [

    "[重點 1：必須精煉，控制在 50 字以內]",

    "[重點 2：必須精煉，控制在 50 字以內]",

    "[重點 3：必須精煉，控制在 50 字以內]"

  ],

  "link": "[FDA 原始文章網址]"

}

 
