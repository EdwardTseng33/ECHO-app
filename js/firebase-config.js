/**
 * ECHO Firebase Configuration
 * ============================
 * 🔥 卡西法的爐火核心 — Firebase 初始化模組
 *
 * ⚠️ 請將下方 firebaseConfig 替換為你的 Firebase 專案設定
 *    Firebase Console → 專案設定 → 一般 → 你的應用程式 → SDK 設定
 */

const firebaseConfig = {
    apiKey: "AIzaSyCY8sF0PZc_BGhp3sgZpx64tZnDyBwa6Tg",
    authDomain: "beyond-business-ca9da.firebaseapp.com",
    projectId: "beyond-business-ca9da",
    storageBucket: "beyond-business-ca9da.firebasestorage.app",
    messagingSenderId: "233160072382",
    appId: "1:233160072382:web:a8f3d66bc77322add912ef",
    measurementId: "G-9EH6WXYMQD"
};

// Initialize Firebase
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

function initFirebase() {
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();

        // Enable offline persistence for Firestore
        firebaseDb.enablePersistence({ synchronizeTabs: true })
            .catch(err => {
                if (err.code === 'failed-precondition') {
                    console.warn('[ECHO Firebase] Multiple tabs open — offline persistence only in one tab.');
                } else if (err.code === 'unimplemented') {
                    console.warn('[ECHO Firebase] Browser does not support offline persistence.');
                }
            });

        // Auth language
        firebaseAuth.languageCode = 'zh-TW';

        console.log('[ECHO Firebase] ✅ 初始化成功');
        return true;
    } catch (err) {
        console.error('[ECHO Firebase] ❌ 初始化失敗:', err);
        return false;
    }
}

// Check if Firebase is properly configured (not using placeholder keys)
function isFirebaseConfigured() {
    return firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('DEMO_REPLACE');
}
