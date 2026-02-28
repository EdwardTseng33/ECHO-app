# ECHO V1.01 推版指南

## 已完成的修改

以下檔案已在你的本機 `C:\Users\Administrator\Claude\ECHO` 更新：

| 檔案 | 修改內容 |
|------|---------|
| `js/app.js` | 版本號 v3 → V1.01 |
| `index.html` | 版本號 → V1.01 (Build 20260228) |
| `sw.js` | Cache name → echo-v1.01-cache |
| `manifest.json` | theme_color #1a1034 → #6366F1 (淺色主題) |
| `.gitignore` | 新增，排除備份/暫存檔案 |

---

## Step 1：建立 GitHub 新 Repo

1. 到 https://github.com/new
2. Repository name: `ECHO-app` (或你喜歡的名字)
3. 選 **Private** (建議)
4. **不要**勾選 Initialize with README
5. 點 Create repository

---

## Step 2：在你的電腦執行 Git 指令

打開 PowerShell，`cd` 到專案目錄：

```powershell
cd C:\Users\Administrator\Claude\ECHO

# 初始化 Git
git init -b main

# 加入所有檔案
git add .

# 建立第一個 commit
git commit -m "ECHO V1.01 — Initial version control"

# 連接到你的新 GitHub repo（把 YOUR_REPO 換成實際 repo 名稱）
git remote add origin https://github.com/EdwardTseng33/YOUR_REPO.git

# 推送
git push -u origin main
```

---

## Step 3：部署到 Vercel

### 方法 A：連結 GitHub (推薦)
1. 到 https://vercel.com/dashboard
2. Add New → Project
3. Import 你剛建的 GitHub repo
4. Framework Preset: **Other**
5. Build Command: 留空
6. Output Directory: `.`（根目錄）
7. Deploy

### 方法 B：Vercel CLI
```powershell
npm i -g vercel
cd C:\Users\Administrator\Claude\ECHO
vercel --prod
```

---

## 部署後驗證

1. 打開你的 Vercel URL
2. 嘗試輸入 Email + 密碼登入
3. 應該能正常進入 Step 2 (建立冒險者檔案)
4. 確認版本號顯示 V1.01
