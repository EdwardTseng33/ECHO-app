/**
 * ECHO Firebase Auth Module
 * ==========================
 * 🔥 卡西法的認證守門 — 處理 Email/Password + Google 登入
 *
 * 取代原本 simpleHash 的 POC 認證方式
 */

const EchoAuth = {
    currentUser: null,
    _onAuthReady: null,

    /**
     * 初始化 Auth 監聽器
     * 返回 Promise：首次 auth state 確認後 resolve
     */
    async init() {
        if (!firebaseAuth) {
            console.warn('[EchoAuth] Firebase Auth not available, falling back to local mode');
            this._authChecked = true;
            return null;
        }

        // 處理 Google Redirect 回調（手機 PWA 場景）
        try {
            const redirectResult = await firebaseAuth.getRedirectResult();
            if (redirectResult && redirectResult.user) {
                console.log('[EchoAuth] Redirect 登入成功:', redirectResult.user.email);
            }
        } catch (e) {
            if (e.code !== 'auth/no-auth-event') {
                console.warn('[EchoAuth] Redirect result error:', e.code);
            }
        }

        return new Promise((resolve) => {
            let firstCheck = true;
            firebaseAuth.onAuthStateChanged(async (user) => {
                this.currentUser = user;
                if (user) {
                    console.log('[EchoAuth] 使用者已登入:', user.email);
                    await this._handleAuthSuccess(user);
                    // 自動導入 app（如果還在 auth 畫面）
                    if (firstCheck) {
                        const a = me();
                        if (a && a.name && a.name !== '冒險者') {
                            enterApp();
                        } else {
                            showScreen('screen-auth-step2');
                        }
                    }
                } else {
                    console.log('[EchoAuth] 使用者未登入');
                }
                this._authChecked = true;
                if (firstCheck) {
                    firstCheck = false;
                    resolve(user);
                }
                if (this._onAuthReady) {
                    this._onAuthReady(user);
                    this._onAuthReady = null;
                }
            });
        });
    },

    /**
     * Email + Password 登入 / 註冊
     * 先嘗試登入，失敗則自動註冊
     */
    async loginWithEmail(email, password) {
        if (!firebaseAuth) return this._fallbackLogin(email, password);

        try {
            // 先嘗試登入
            const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
            showToast(`歡迎回來，${result.user.displayName || '冒險者'}！`);
            return { success: true, user: result.user, isNew: false };
        } catch (loginErr) {
            if (loginErr.code === 'auth/user-not-found' ||
                loginErr.code === 'auth/invalid-credential') {
                // 帳號不存在 → 自動註冊
                try {
                    const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
                    showToast('契約已建立！請完成你的冒險者檔案');
                    return { success: true, user: result.user, isNew: true };
                } catch (regErr) {
                    return this._handleAuthError(regErr);
                }
            } else {
                return this._handleAuthError(loginErr);
            }
        }
    },

    /**
     * Google 登入
     */
    async loginWithGoogle() {
        if (!firebaseAuth) {
            showToast('⚠️ Firebase 尚未設定，無法使用 Google 登入');
            return { success: false };
        }

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            provider.setCustomParameters({ prompt: 'select_account' });

            let result;
            try {
                // 優先使用 Popup（桌面瀏覽器）
                result = await firebaseAuth.signInWithPopup(provider);
            } catch (popupErr) {
                // Popup 被阻擋（常見於手機 PWA）→ 改用 Redirect
                if (popupErr.code === 'auth/popup-blocked' ||
                    popupErr.code === 'auth/cancelled-popup-request' ||
                    popupErr.code === 'auth/operation-not-supported-in-this-environment') {
                    console.log('[EchoAuth] Popup 不支援，改用 Redirect');
                    await firebaseAuth.signInWithRedirect(provider);
                    return { success: true, pending: true };
                }
                throw popupErr;
            }

            const isNew = result.additionalUserInfo?.isNewUser || false;

            if (isNew) {
                showToast('Google 契約建立成功！請完成你的冒險者檔案');
            } else {
                showToast(`歡迎回來，${result.user.displayName || '冒險者'}！`);
            }

            return { success: true, user: result.user, isNew };
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                showToast('登入已取消');
                return { success: false };
            }
            return this._handleAuthError(err);
        }
    },

    /**
     * 登出
     */
    async logout() {
        if (firebaseAuth) {
            await firebaseAuth.signOut();
        }
        globalData.activeId = null;
        saveGlobal();
        document.getElementById('main-nav').style.display = 'none';
        showScreen('screen-auth');
    },

    /**
     * 取得當前使用者 UID（用於 Firestore document ID）
     */
    getUid() {
        return this.currentUser?.uid || globalData.activeId || null;
    },

    /**
     * Auth 成功後的共用處理邏輯
     */
    async _handleAuthSuccess(user) {
        const uid = user.uid;

        // 確保 globalData 有此帳號
        if (!globalData.accounts[uid]) {
            globalData.accounts[uid] = defaultAccount(user.displayName || '冒險者');
            globalData.accounts[uid].email = user.email;
            // 不自動使用 Google 照片 — 統一使用角色預設頭像
            // Google photoURL 保留備用但不覆蓋角色頭像
            if (user.photoURL) {
                globalData.accounts[uid].googlePhotoUrl = user.photoURL;
            }
        }

        // 更新 email（Google 登入可能有更新）
        globalData.accounts[uid].email = user.email;
        globalData.activeId = uid;
        saveGlobal();

        // 嘗試從 Firestore 載入資料
        if (typeof EchoDb !== 'undefined' && EchoDb.isReady()) {
            await EchoDb.loadUserData(uid);
        }
    },

    /**
     * 處理 Auth 錯誤
     */
    _handleAuthError(err) {
        const messages = {
            'auth/email-already-in-use': '此 Email 已被其他冒險者使用！',
            'auth/weak-password': '密碼太弱了！至少需要 6 個字元',
            'auth/invalid-email': 'Email 格式不正確',
            'auth/wrong-password': '❌ 密碼錯誤，請重新輸入！',
            'auth/too-many-requests': '嘗試太多次了，請稍後再試',
            'auth/network-request-failed': '網路連線失敗，請檢查網路',
            'auth/invalid-credential': '❌ 密碼錯誤，請重新輸入！',
        };
        const msg = messages[err.code] || `登入失敗：${err.message}`;
        showToast(msg);
        console.error('[EchoAuth] Error:', err.code, err.message);
        return { success: false, error: err };
    },

    /**
     * Fallback：Firebase 未設定時使用本地模式（維持原始行為）
     */
    _fallbackLogin(email, password) {
        console.warn('[EchoAuth] 使用本地 fallback 模式');

        let accId = null;
        for (const [id, acc] of Object.entries(globalData.accounts)) {
            if (acc.email === email) { accId = id; break; }
        }

        if (accId) {
            const acc = globalData.accounts[accId];
            if (acc.p_hash && acc.p_hash !== '***' && acc.p_hash !== simpleHash(password)) {
                showToast('❌ 密碼錯誤，請重新輸入！');
                return { success: false };
            }
            globalData.activeId = accId;
            saveGlobal();
            return { success: true, isNew: false, user: { uid: accId, email } };
        } else {
            accId = 'U' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
            globalData.accounts[accId] = defaultAccount('冒險者');
            globalData.accounts[accId].email = email;
            globalData.accounts[accId].p_hash = simpleHash(password);
            globalData.activeId = accId;
            saveGlobal();
            return { success: true, isNew: true, user: { uid: accId, email } };
        }
    }
};
