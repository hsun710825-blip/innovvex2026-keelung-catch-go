# InnoVEX 2026 智匯基隆 Catch & Go（AR 互動導覽版）

現場問答闖關 PWA：AR 鏡頭 + GPS 圍欄 + 攤位 QR 三引擎解鎖，含拍照相框與 Google 試算表票選。

---

## 正式網址（展場請用這個）

| 用途 | 網址 |
|------|------|
| **正式上線** | https://innovvex2026-keelung-catch-go.vercel.app |
| **GitHub 原始碼** | https://github.com/hsun710825-blip/innovvex2026-keelung-catch-go |
| **Vercel 後台** | https://vercel.com/hsun710825-blips-projects/innovvex2026-keelung-catch-go |

> 相機、GPS 必須用 **HTTPS 正式網址**，不要用本機 `192.168.x.x`。

---

## 攤位 QR Code 連結（引擎 A）

將以下網址分別產生 QR，貼於各攤位：

```text
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=1   杭特電子
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=2   茁思科技
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=3   順易利
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=4   台續
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=5   智慧光
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=6   蔡技企業
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=7   佳音醫療
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=8   和平島地質公園
https://innovvex2026-keelung-catch-go.vercel.app/?vendor=9   森田生技
```

**引擎 C（AR 鏡頭掃描）** QR 純文字內容：`vendor_1`～`vendor_9`

---

## 換筆電 / 展場修正流程

### 第一次在新筆電（約 10 分鐘）

```powershell
git clone https://github.com/hsun710825-blip/innovvex2026-keelung-catch-go.git
cd innovvex2026-keelung-catch-go
```

用 Cursor 或 VS Code 開啟資料夾。需登入同一 GitHub 帳號才能 `git push`。

### 每次修改（標準 4 步）

```powershell
cd innovvex2026-keelung-catch-go
git pull
# …編輯 index.html / style.css / app.js …
git add .
git commit -m "fix: 展場調整說明"
git push
```

推送後 **1～2 分鐘** Vercel 自動部署。手機測試建議加 `?v=1` 避免快取。

---

## 常改項目速查

| 要改什麼 | 檔案 | 位置 |
|----------|------|------|
| 題目、答案、GPS 座標 | `app.js` | `VENDORS` 陣列 |
| GPS 感應距離（預設 5m） | `app.js` | `PROXIMITY_METERS` |
| 畫面、按鈕 | `index.html` | — |
| 樣式、玻璃效果 | `style.css` | — |
| 拍照相框 | `assets/frame.png` | 替換檔案後 commit |
| 主視覺 | `主視覺.jpg` | 替換檔案後 commit |
| 票選寫入試算表 | `app.js` | `VOTE_SCRIPT_URL` |
| 廠商展版背景 | `assets/vendor_1.jpg`～`vendor_9.jpg` | 選填 |

---

## 三引擎解鎖機制

| 引擎 | 觸發方式 |
|------|----------|
| **A** | 掃描含 `?vendor=N` 或 `?id=N` 的網址 QR |
| **B** | GPS 進入攤位 5 公尺內自動彈題 |
| **C** | AR 鏡頭掃到純文字 `vendor_N` |

答題 Modal 開啟時暫停掃描與 GPS，關閉後恢復。

---

## 展場 Debug

- 網頁頂部 **Debug** 面板可模擬 9 個攤位（無 GPS 時必用）
- 電腦本機測試（備援）：`python -m http.server 8765 --bind 0.0.0.0`
- Android 若連不上本機 IP，請改開 HTTPS 正式網址

---

## 專案結構

```text
index.html      頁面結構、CDN 引用
style.css       AR 全螢幕 + 玻璃 UI
app.js          題庫、三引擎、GPS、票選、拍照
assets/
  frame.png     拍照相框（唯一）
  vendor_1~9.jpg  答題時展版背景（選填）
主視覺.jpg      Hero 主視覺
vercel.json     部署設定
```

---

## 帳號與權限

- **GitHub**：`hsun710825-blip/innovvex2026-keelung-catch-go`
- **Vercel**：已連結 GitHub，`git push` 自動部署
- **Google 試算表票選**：Apps Script Web App（見 `VOTE_SCRIPT_URL`）

展場協作人員需在 GitHub repo → Settings → Collaborators 加入帳號。

---

## 緊急聯絡資訊（可自行填寫）

- 現場負責人：
- 技術支援：

---

*最後更新：2026-05-21 · 南港展覽館 InnoVEX 基隆館*
