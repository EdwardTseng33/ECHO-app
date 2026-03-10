/**
 * ECHO Firestore Data Layer
 * ==========================
 * 🔥 卡西法的資料庫引擎 — Firestore + localStorage 雙層同步
 *
 * 策略：
 * - Firestore 為主要資料源（雲端同步、跨裝置）
 * - localStorage 為離線快取（斷網時仍可使用）
 * - 寫入時同步更新兩者
 * - 讀取時優先 Firestore，失敗時降級 localStorage
 */

const EchoDb = {
    _ready: false,
    _unsubscribers: [],

    isReady() {
        return this._ready && !!firebaseDb;
    },

    /**
     * 初始化 Firestore 連線
     */
    init() {
        if (!firebaseDb) {
            console.warn('[EchoDb] Firestore not available, using localStorage only');
            return;
        }
        this._ready = true;
        console.log('[EchoDb] ✅ Firestore 資料層就緒');
    },

    /**
     * 從 Firestore 載入使用者資料 → 合併到 globalData
     */
    async loadUserData(uid) {
        if (!this.isReady() || !uid) return false;

        try {
            const doc = await firebaseDb.collection('users').doc(uid).get();
            if (doc.exists) {
                const cloudData = doc.data();
                // 合併雲端資料到本地（雲端優先）
                if (cloudData.account) {
                    globalData.accounts[uid] = {
                        ...defaultAccount('冒險者'),
                        ...globalData.accounts[uid],
                        ...cloudData.account
                    };
                }
                if (cloudData.tasks && cloudData.tasks.length > 0) {
                    // 合併任務：以雲端為主，補充本地獨有的
                    const cloudTaskIds = new Set(cloudData.tasks.map(t => t.id));
                    const localOnly = globalData.tasks.filter(t => !cloudTaskIds.has(t.id));
                    globalData.tasks = [...cloudData.tasks, ...localOnly];
                }
                if (cloudData.rewards) {
                    globalData.rewards = cloudData.rewards;
                }
                if (cloudData.guilds) {
                    globalData.guilds = { ...globalData.guilds, ...cloudData.guilds };
                }
                if (cloudData.echoes) {
                    globalData.echoes = { ...globalData.echoes, ...cloudData.echoes };
                }
                saveGlobal(); // 同步到 localStorage
                console.log('[EchoDb] ✅ 雲端資料已載入');
                return true;
            } else {
                // 雲端沒有資料 → 將本地資料上傳
                console.log('[EchoDb] 雲端無資料，上傳本地資料...');
                await this.saveUserData(uid);
                return true;
            }
        } catch (err) {
            console.error('[EchoDb] 載入失敗，使用 localStorage:', err);
            return false;
        }
    },

    /**
     * 儲存使用者資料到 Firestore
     */
    async saveUserData(uid) {
        if (!this.isReady() || !uid) return false;

        try {
            const account = globalData.accounts[uid] || null;
            if (!account) return false;

            await firebaseDb.collection('users').doc(uid).set({
                account: account,
                tasks: globalData.tasks || [],
                rewards: globalData.rewards || [],
                guilds: globalData.guilds || {},
                echoes: globalData.echoes || {},
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('[EchoDb] ✅ 資料已同步到雲端');
            return true;
        } catch (err) {
            console.error('[EchoDb] 儲存失敗:', err);
            return false;
        }
    },

    /**
     * 即時監聽使用者資料變更（跨裝置同步）
     */
    listenToUserData(uid, callback) {
        if (!this.isReady() || !uid) return;

        const unsub = firebaseDb.collection('users').doc(uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    if (callback) callback(data);
                }
            }, (err) => {
                console.error('[EchoDb] 監聽錯誤:', err);
            });

        this._unsubscribers.push(unsub);
    },

    /**
     * 儲存訂閱狀態
     */
    async saveSubscription(uid, subscriptionData) {
        if (!this.isReady() || !uid) return false;

        try {
            await firebaseDb.collection('users').doc(uid).update({
                'account.subscription': subscriptionData.plan,
                'account.subscriptionId': subscriptionData.subscriptionId || null,
                'account.subscriptionStart': subscriptionData.startDate || Date.now(),
                'account.subscriptionEnd': subscriptionData.endDate || null,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (err) {
            console.error('[EchoDb] 訂閱儲存失敗:', err);
            return false;
        }
    },

    /**
     * 停止所有監聽
     */
    cleanup() {
        this._unsubscribers.forEach(unsub => unsub());
        this._unsubscribers = [];
    }
};
