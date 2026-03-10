# ECHO V1.04 推版指南 — Firebase + Google 登入 + Stripe 金流

## 已完成的修改

| 檔案 | 修改內容 |
|------|---------|
| `js/firebase-config.js` | **新增** Firebase 初始化設定 |
| `js/firebase-auth.js` | **新增** Firebase Auth（Email + Google Login） |
| `js/firebase-db.js` | **新增** Firestore 資料層（雲端同步） |
| `js/payment.js` | **新增** Stripe 金流模組（含 Demo 模式） |
| `js/app.js` | 改版 V1.04，串接 Firebase Auth / Firestore / Payment |
| `js/gcal.js` | 修復 `t.deadline` → `task.deadline` Bug |
| `index.html` | 加入 Firebase SDK、Stripe.js、版本號 V1.04 |
| `sw.js` | Cache name → echo-v1.04-cache，新增 precache 檔案 |
| `terms.html` | **新增** 服務條款頁面 |
| `privacy.html` | **新增** 隱私政策頁面 |

---

## Step 1：建立 Firebase 專案

1. 到 https://console.firebase.google.com/
2. 點「新增專案」→ 取名 `echo-app-prod`
3. 啟用 Google Analytics（可選）

### 1.1 啟用 Authentication
1. Firebase Console → Authentication → Sign-in method
2. 啟用 **電子郵件/密碼**
3. 啟用 **Google**
   - 設定專案的支援電子郵件
   - 新增你的 Vercel 網域到「授權網域」

### 1.2 啟用 Firestore
1. Firebase Console → Firestore Database → 建立資料庫
2. 選「測試模式」（POC 階段）
3. 地區選 `asia-east1`（台灣）

### 1.3 取得設定值
1. Firebase Console → 專案設定 → 一般 → 你的應用程式
2. 點「新增應用程式」→ 選「Web」
3. 複製 `firebaseConfig` 物件

### 1.4 貼入設定
打開 `js/firebase-config.js`，替換 `firebaseConfig` 的值：
```js
const firebaseConfig = {
    apiKey: "你的 API Key",
    authDomain: "你的 .firebaseapp.com",
    projectId: "你的 project ID",
    storageBucket: "你的 .firebasestorage.app",
    messagingSenderId: "你的 ID",
    appId: "你的 App ID"
};
```

---

## Step 2：設定 Stripe（金流）

### 2.1 註冊 Stripe
1. 到 https://dashboard.stripe.com/register
2. 完成商家驗證

### 2.2 建立商品
1. Stripe Dashboard → Products → Add Product
2. 名稱：`ECHO PRO 月訂閱`
3. 定價：NT$ 59 / 月（recurring）
4. 複製 Price ID（格式 `price_xxxx`）

### 2.3 貼入設定
打開 `js/payment.js`，替換：
```js
STRIPE_PK: 'pk_test_你的Publishable_Key',
...
stripePriceId: 'price_你的Price_ID',
```

### 2.4 後端 API（生產環境需要）
POC 階段使用 Demo 模式（模擬付款彈窗，不實際扣款）。
生產環境需要 Cloud Function 建立 Checkout Session：
```
YOUR_BACKEND_URL/api/create-checkout-session
```

---

## Step 3：推版到 GitHub + Vercel

```powershell
cd C:\Users\Administrator\Claude\ECHO

git add js/firebase-config.js js/firebase-auth.js js/firebase-db.js js/payment.js
git add js/app.js js/gcal.js index.html sw.js
git add terms.html privacy.html
git add ECHO_V1.04_推版指南.md

git commit -m "V1.04 — Firebase Auth + Firestore + Stripe Payment"

git push origin main
```

Vercel 會自動偵測 push 並重新部署。

---

## Step 4：部署後驗證清單

- [ ] 登入頁面顯示「● 雲端模式」（Firebase 已連線）
- [ ] Email + 密碼可以註冊/登入
- [ ] Google 按鈕可以完成 OAuth 登入
- [ ] 建立任務後，重新整理頁面資料不會消失
- [ ] 訂閱頁面點「升級 PRO」出現付款確認彈窗
- [ ] 版本號顯示 V1.04
- [ ] 服務條款、隱私政策連結可以開啟
