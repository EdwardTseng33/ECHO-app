/**
 * ECHO Payment Module — POC Edition
 * ===================================
 * 🌸 蘇菲的金庫管理 — PAYUNi 金流預備
 *
 * 架構：
 * 1. POC 階段使用 Demo 模式（模擬付款，不實際扣款）
 * 2. 正式版將串接 PAYUNi UPP 整合式支付頁
 * 3. 使用者點擊「升級 PRO」→ Demo 確認彈窗 → 解鎖 PRO
 *
 * 正式版 TODO：
 * - PAYUNi MerchantID / MerKey / MerIV 設定於 Cloud Function
 * - AES 加密交易參數 → 呼叫 PAYUNi UPP API
 * - ReturnURL / NotifyURL 處理付款回調
 * - 信用卡 / 超商代碼 / ATM 轉帳支援
 */

const EchoPayment = {

    // === PAYUNi 設定（正式版填入） ===
    PAYUNI_CONFIG: {
        merchantId: 'REPLACE_WITH_MERCHANT_ID',
        // ⚠️ MerKey / MerIV 不可放前端！僅供 Cloud Function 使用
        apiUrl: 'https://api.payuni.com.tw/api/upp',        // 正式環境
        sandboxUrl: 'https://sandbox-api.payuni.com.tw/api/upp', // 測試環境
        useSandbox: true,
    },

    // 定價方案
    PLANS: {
        pro_monthly: {
            name: 'ECHO PRO 30天通行證',
            price: 59, // NTD
            currency: 'TWD',
            duration: 30, // 天
            features: [
                '無限任務派發',
                '語音回聲錄音',
                '全家族組隊模式',
                '傳說級裝備解鎖',
                '賢者之眼成長分析',
                '至尊級支援服務'
            ]
        }
    },

    isReady: false,

    /**
     * 初始化付款模組
     */
    init() {
        const cfg = this.PAYUNI_CONFIG;
        if (!cfg.merchantId.includes('REPLACE')) {
            this.isReady = true;
            console.log('[EchoPayment] ✅ PAYUNi 設定就緒（' + (cfg.useSandbox ? '沙箱' : '正式') + '模式）');
        } else {
            console.warn('[EchoPayment] PAYUNi 未設定，使用 Demo 模式');
        }
    },

    /**
     * 開始付款流程
     */
    async startCheckout(planId = 'pro_monthly') {
        const plan = this.PLANS[planId];
        if (!plan) { showToast('方案不存在'); return; }

        const uid = (typeof EchoAuth !== 'undefined' && EchoAuth.getUid) ? EchoAuth.getUid() : null;
        if (!uid) { showToast('請先登入！'); return; }

        // 檢查是否已是 PRO
        const a = globalData.accounts[uid];
        if (a && a.subscription === 'pro' && a.subscriptionEnd > Date.now()) {
            showToast('你已經是 PRO 會員！');
            return;
        }

        if (this.isReady) {
            // 正式版：呼叫後端 Cloud Function → 取得 PAYUNi UPP 表單資料 → 跳轉
            await this._payuniCheckout(plan, uid);
        } else {
            // POC Demo 模式
            this._demoCheckout(plan, uid);
        }
    },

    /**
     * PAYUNi UPP 正式流程（待實作）
     * 流程：前端 → Cloud Function 加密 → PAYUNi UPP 託管頁面 → 回調
     */
    async _payuniCheckout(plan, uid) {
        showToast('⏳ 正在準備付款頁面...');

        try {
            // 呼叫後端 Cloud Function 建立交易
            // Cloud Function 負責 AES 加密（MerKey + MerIV）
            const response = await fetch('/api/create-payuni-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: 'pro_monthly',
                    userId: uid,
                    amount: plan.price,
                    productName: plan.name,
                    returnUrl: window.location.origin + '/?payment=success',
                    notifyUrl: window.location.origin + '/api/payuni-notify',
                })
            });

            const data = await response.json();

            if (data.formHtml) {
                // PAYUNi UPP：後端回傳自動提交表單 HTML → 注入頁面跳轉
                const container = document.createElement('div');
                container.innerHTML = data.formHtml;
                document.body.appendChild(container);
                container.querySelector('form')?.submit();
            } else if (data.paymentUrl) {
                // 或直接跳轉
                window.location.href = data.paymentUrl;
            } else {
                showToast('建立付款失敗，請稍後再試');
            }
        } catch (err) {
            console.error('[EchoPayment] PAYUNi 結帳失敗:', err);
            showToast('付款服務暫時無法使用');
        }
    },

    /**
     * Demo 模式：模擬付款確認彈窗
     * POC 展示用，不實際扣款
     */
    _demoCheckout(plan, uid) {
        const modal = document.createElement('div');
        modal.id = 'payment-demo-modal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);';
        modal.innerHTML = `
            <div style="background:var(--bg,#fff);border-radius:24px;padding:32px 24px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size:48px;margin-bottom:16px;">💳</div>
                <h3 style="font-size:20px;font-weight:900;color:var(--text,#1a1a2e);margin-bottom:8px;">確認購買</h3>
                <p style="font-size:14px;color:var(--text2,#666);margin-bottom:24px;line-height:1.6;">
                    你即將購買 <strong>${plan.name}</strong><br>
                    <strong style="color:#6366F1;font-size:18px;">NT$ ${plan.price}</strong> / ${plan.duration} 天
                </p>

                <div style="background:var(--surface,#f5f5f5);border-radius:16px;padding:16px;margin-bottom:24px;text-align:left;">
                    <div style="font-size:12px;font-weight:800;color:var(--text2,#666);margin-bottom:8px;">包含以下特權：</div>
                    ${plan.features.map(f => `<div style="font-size:13px;color:var(--text,#333);padding:4px 0;"><span style="color:#6366F1;margin-right:6px;">✦</span>${f}</div>`).join('')}
                </div>

                <div style="background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.3);border-radius:12px;padding:10px;margin-bottom:20px;">
                    <div style="font-size:11px;color:#F59E0B;font-weight:800;">🔧 POC 展示模式</div>
                    <div style="font-size:11px;color:var(--text3,#999);">此為模擬付款，不會產生實際扣款</div>
                </div>

                <button onclick="EchoPayment._confirmDemoPayment('${uid}')"
                    style="width:100%;padding:14px;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-size:16px;font-weight:900;border:none;border-radius:16px;cursor:pointer;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
                    👑 確認購買 — NT$ ${plan.price}
                </button>
                <button onclick="document.getElementById('payment-demo-modal').remove()"
                    style="width:100%;padding:12px;background:transparent;color:var(--text2,#666);font-size:14px;font-weight:700;border:none;cursor:pointer;margin-top:8px;">
                    先繼續免費冒險
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    },

    /**
     * Demo 付款確認
     */
    async _confirmDemoPayment(uid) {
        document.getElementById('payment-demo-modal')?.remove();

        const a = globalData.accounts[uid];
        if (!a) return;

        a.subscription = 'pro';
        a.subscriptionStart = Date.now();
        a.subscriptionEnd = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 天
        a.points += 200; // PRO 禮包

        saveGlobal();

        // 同步到 Firestore
        if (typeof EchoDb !== 'undefined' && EchoDb.isReady()) {
            await EchoDb.saveSubscription(uid, {
                plan: 'pro',
                startDate: a.subscriptionStart,
                endDate: a.subscriptionEnd
            });
        }

        closePaywall();
        showCelebration('👑', '歡迎加入 PRO！', '獲得 200 回聲金幣禮包 + 全部特權解鎖');
        setTimeout(() => {
            refreshAll();
            refreshSubPage();
        }, 2600);
    },

    /**
     * 檢查 URL 參數處理付款回調（PAYUNi ReturnURL）
     */
    handlePaymentCallback() {
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');

        if (paymentStatus === 'success') {
            const a = me();
            if (a) {
                a.subscription = 'pro';
                a.subscriptionStart = Date.now();
                a.subscriptionEnd = Date.now() + (30 * 24 * 60 * 60 * 1000);
                a.points += 200;
                saveGlobal();
                showCelebration('👑', '付款成功！', '歡迎加入 ECHO PRO，所有特權已解鎖！');
            }
            window.history.replaceState({}, '', window.location.pathname);
        } else if (paymentStatus === 'cancel') {
            showToast('付款已取消，你可以隨時再試');
            window.history.replaceState({}, '', window.location.pathname);
        }
    },

    /**
     * 檢查 PRO 是否到期
     */
    checkExpiry(uid) {
        const a = globalData.accounts[uid];
        if (!a || a.subscription !== 'pro') return;

        if (a.subscriptionEnd && Date.now() > a.subscriptionEnd) {
            a.subscription = 'free';
            saveGlobal();
            console.log('[EchoPayment] PRO 已到期，恢復免費版');
        }
    }
};
