document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('articles-container');

    const loading = document.getElementById('loading');

    const searchInput = document.getElementById('search-input');

    const searchCount = document.getElementById('search-count');
 
    let allArticles = []; // 儲存非同步讀取完畢的所有文章資料
 
    // 1. 先獲取文章索引清單

    fetch('data/index.json')

        .then(response => {

            if (!response.ok) throw new Error('無法載入 index.json 清單');

            return response.json();

        })

        .then(articleIds => {

            // 2. 根據 ID 列表，批次並行讀取每一個獨立的 JSON 檔案

            const fetchPromises = articleIds.map(id => 

                fetch(`data/${id}.json`)

                    .then(res => {

                        if (!res.ok) {

                            console.warn(`警告: 無法讀取單篇文章檔案 data/${id}.json`);

                            return null; // 若單篇讀取失敗，跳過它，不影響其他文章

                        }

                        return res.json();

                    })

                    .catch(() => null)

            );
 
            // 3. 等待所有檔案都讀取完成

            return Promise.all(fetchPromises);

        })

        .then(results => {

            // 過濾掉讀取失敗的 null 資料

            allArticles = results.filter(article => article !== null);

            loading.style.display = 'none';

            // 4. 初始化渲染與搜尋綁定

            renderArticles(allArticles);

            updateCount(allArticles.length);
 
            searchInput.addEventListener('input', (e) => {

                const keyword = e.target.value.toLowerCase().trim();

                const filtered = allArticles.filter(article => {

                    const matchTitle = article.title.toLowerCase().includes(keyword);

                    const matchOriginalTitle = article.original_title.toLowerCase().includes(keyword);

                    const matchAuthor = article.author.toLowerCase().includes(keyword);

                    const matchSummary = article.summary.some(point => 

                        point.toLowerCase().includes(keyword)

                    );

                    return matchTitle || matchOriginalTitle || matchAuthor || matchSummary;

                });

                renderArticles(filtered);

                updateCount(filtered.length, keyword !== '');

            });

        })

        .catch(error => {

            loading.innerHTML = '⚠️ 無法載入索引資料，請確認 data/index.json 檔案是否存在。';

            console.error('Error fetching data:', error);

        });
 
    function updateCount(count, isSearching = false) {

        if (isSearching) {

            searchCount.textContent = `找到 ${count} 筆符合的摘要結果`;

        } else {

            searchCount.textContent = `共收錄 ${count} 筆 FDA 專家觀點摘要`;

        }

    }
 
    function renderArticles(articles) {

        if (articles.length === 0) {

            container.innerHTML = `
<div style="text-align: center; color: #64748B; padding: 40px;">
<p style="font-size: 1.2rem; margin-bottom: 8px;">🔍 找不到相符的文章摘要</p>
<p style="font-size: 0.9rem;">試試看搜尋其他關鍵字</p>
</div>

            `;

            return;

        }
 
        const htmlString = articles.map(article => `
<article class="article-card">
<h2 class="card-title">${article.title}</h2>
<p class="card-original-title">${article.original_title}</p>
<div class="card-meta">
<span class="meta-author">👤 ${article.author}</span>
<span class="meta-date">📅 ${article.date}</span>
</div>
<div class="summary-title">核心摘要：</div>
<ul class="summary-list">

                    ${article.summary.map(point => `<li>${point}</li>`).join('')}
</ul>
<a href="${article.link}" target="_blank" class="read-more-btn">閱讀原文 →</a>
</article>

        `).join('');
 
        container.innerHTML = htmlString;

    }

});

 
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

    "[重点 2：必須精煉，控制在 50 字以內]",

    "[重點 3：必須精煉，控制在 50 字以內]"

  ],

  "link": "[FDA 原始文章網址]"

}

 
