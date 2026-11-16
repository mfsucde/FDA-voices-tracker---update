document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('articles-container');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('search-input');
    const searchCount = document.getElementById('search-count');
 
    let allArticles = []; // 儲存非同步讀取完畢的所有文章資料
 
    // 1. 先獲取文章索引清單 index.json
    fetch('data/index.json')
        .then(response => {
            if (!response.ok) throw new Error('無法載入 index.json 索引檔');
            return response.json();
        })
        .then(articleIds => {
            // 2. 根據 ID 列表，批次並行非同步讀取每一個獨立的單篇 JSON 檔案
            const fetchPromises = articleIds.map(id => 
                fetch(`data/${id}.json`)
                    .then(res => {
                        if (!res.ok) {
                            console.warn(`警告: 無法讀取單篇文章檔案 data/${id}.json`);
                            return null; // 若單篇讀取失敗則跳過，不影響其他文章
                        }
                        return res.json();
                    })
                    .catch(() => null)
            );
 
            // 3. 等待所有個別 JSON 檔案都讀取完成
            return Promise.all(fetchPromises);
        })
        .then(results => {
            // 過濾掉讀取失敗的空值 (null)
            allArticles = results.filter(article => article !== null);
            loading.style.display = 'none';
            // 4. 初始化渲染網頁與顯示計數
            renderArticles(allArticles);
            updateCount(allArticles.length);
 
            // 5. 綁定即時關鍵字搜尋事件
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
            loading.innerHTML = '⚠️ 無法載入資料，請確認 data/index.json 檔案是否存在。';
            searchCount.textContent = '載入失敗';
            console.error('Error fetching data:', error);
        });
 
    // 更新顯示筆數的輔助函數
    function updateCount(count, isSearching = false) {
        if (isSearching) {
            searchCount.textContent = `找到 ${count} 筆符合的摘要結果`;
        } else {
            searchCount.textContent = `共收錄 ${count} 筆 FDA 專家觀點摘要`;
        }
    }
 
    // 負責將物件陣列轉換為卡片 HTML 渲染至畫面的函數
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
