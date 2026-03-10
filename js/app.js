/* ==============================================
   ECHO 回聲 V1.08 — CSS Design Token 重構
   + 角色身份統一重構
   + Streak System + Daily Quests
   + Firebase Auth + Firestore + PAYUNi Payment
   + Full Feature Fix + Auth + Guild + Sound
   + Publisher Names + Task Dashboard + AI Humor
   ============================================== */

// ===== CONSTANTS =====
const XP_TABLE = { EASY: 30, MEDIUM: 50, HARD: 80 };
const PTS_RATIO = 0.2;
const LEVEL_CAP = 50;
const FREE_TASK_LIMIT = 999;
const TYPE_LABELS = {
    CHORE: '🧹 領地維護 (家務整理)', LEARNING: '📚 奧術研習 (學術挑戰)',
    ADVENTURE: '🌳 荒野考察 (戶外體育)', KINDNESS: '💖 聖光差事 (善行委託)', CREATIVE: '🎨 煉金工藝 (創意發想)',
    GAME: '🎮 酒館博弈 (互動遊戲)', GOAL: '🏆 傳奇宿命 (成就目標)'
};
const PUBLISHER_PRESETS = ['媽媽', '爸爸', '舅舅', '阿姨', '老師', '哥哥', '姊姊', '同學', '夥伴'];

// 3-TIER CHARACTER SYSTEM: custom art + emoji per tier
// GENERIC ADVENTURE QUOTES for the custom avatar
const ADVENTURE_QUOTES = [
    "今天想去哪裡冒險呢？",
    "每一小步都是成長的大冒險！",
    "準備好迎接新的挑戰了嗎？",
    "你的金幣正在穩定增加中喔！",
    "這是一個適合探索好天氣！",
    "完成委託，解鎖更多驚喜！"
];

// V1.06: Unified identity — tier suffix + charPreset name
// e.g. 選了「戰士」→ 戰士見習 → 青銅戰士 → 白銀戰士 → 黃金戰士 → ...
const CLASS_PATH = [
    { lvl: 1, tier: 1, suffix: '見習', color: '#B0A0D0' },
    { lvl: 5, tier: 2, suffix: '青銅', color: '#CD7F32' },
    { lvl: 12, tier: 3, suffix: '白銀', color: '#C0C0C0' },
    { lvl: 20, tier: 4, suffix: '黃金', color: '#FFD700' },
    { lvl: 30, tier: 5, suffix: '傳奇', color: '#00E5FF' },
    { lvl: 40, tier: 6, suffix: '聖域', color: '#F472B6' },
    { lvl: 50, tier: 7, suffix: '永恆', color: '#FFFFFF' },
];

const DEFAULT_REWARDS = [
    { sku: 'EQ1', title: '🗡️ 新手鐵劍', desc: '+5 攻擊力', cost: 150, icon: '🗡️', type: 'EQUIP', atk: 5, def: 0, stock: 5, custom: false },
    { sku: 'EQ2', title: '🛡️ 木板盾牌', desc: '+5 防禦力', cost: 150, icon: '🛡️', type: 'EQUIP', atk: 0, def: 5, stock: 5, custom: false },
    { sku: 'EQ3', title: '🔥 烈焰法杖', desc: '+15 攻擊力', cost: 500, icon: '🔥', type: 'EQUIP', atk: 15, def: 0, stock: 2, custom: false },
    { sku: 'R0', title: '🧪 治療藥水', desc: '恢復 100% 總血量，挑戰魔王必備！', cost: 15, icon: '<i class="ph-bold ph-flask"></i>', type: 'POTION', stock: 10, custom: false },
    { sku: 'R1', title: '🍦 冰淇淋兌換券', desc: '兌換一支冰淇淋', cost: 80, icon: '🍦', stock: 3, custom: false },
    { sku: 'R2', title: '📖 故事書一本', desc: '家長陪讀一本故事書', cost: 50, icon: '📖', stock: 10, custom: false },
    { sku: 'R3', title: '🎮 30分鐘遊戲時間', desc: '額外30分鐘螢幕時間', cost: 100, icon: '🎮', stock: 5, custom: false },
    { sku: 'R4', title: '🌟 神秘驚喜盒', desc: '家長準備的驚喜小禮物', cost: 200, icon: '🎁', stock: 2, custom: false },
    { sku: 'R5', title: '🏕️ 週末戶外冒險', desc: '家長帶你去戶外探險', cost: 300, icon: '🏕️', stock: 1, custom: false },
    // V1.05: New streak & boost items
    { sku: 'SF1', title: '🛡️ 護盾藥水', desc: '保護連續冒險紀錄 1 天不中斷（最多持有 3 個）', cost: 100, icon: '🛡️', type: 'STREAK_FREEZE', stock: 10, custom: false },
    { sku: 'XP2', title: '⚡ 雙倍 XP 藥劑', desc: '接下來 1 小時內所有任務 XP 加倍！', cost: 150, icon: '⚡', type: 'XP_BOOST', stock: 5, custom: false },
];

const ACHIEVEMENTS = [
    { id: '3tasks', icon: '🦄', name: '好事成三', desc: '勇於嘗試！發布或是進行3個委託', check: s => { const myT = s.tasks.filter(t => t.creatorId === s.id || t.claimedBy === s.id); return myT.length >= 3; }, reward: { name: '彩虹小馬', emoji: '🦄', atk: 5, def: 5, desc: '充滿魔力的小夥伴，會為你提振士氣！' } },
    { id: 'done5', icon: '🥉', name: '見習生', desc: '達成5個委託', check: s => s.completedCount >= 5 },
    { id: 'done20', icon: '🥈', name: '熟練者', desc: '達成20個委託', check: s => s.completedCount >= 20 },
    { id: 'done50', icon: '🥇', name: '委託大師', desc: '達成50個委託', check: s => s.completedCount >= 50 },
    { id: 'boss1', icon: '💀', name: '首戰告捷', desc: '打贏1次魔王', check: s => s.battlesWon >= 1 },
    { id: 'boss10', icon: '👑', name: '魔王剋星', desc: '打贏10次魔王', check: s => s.battlesWon >= 10 },
    { id: 'rich', icon: '<i class="ph-bold ph-coin"></i>', name: '大富翁', desc: '累積獲得500金幣', check: s => s.points >= 500 },
    { id: 'lvl5', icon: '⭐', name: '漸入佳境', desc: '達到等級5', check: s => s.level >= 5 },
    { id: 'lvl10', icon: '🌟', name: '爐火純青', desc: '達到等級10', check: s => s.level >= 10 },
    { id: 'lvl20', icon: '🏆', name: '黃金傳說', desc: '達到 Lv.20，晉升黃金段位', check: s => s.level >= 20 },
    { id: 'first_blood', icon: '🩸', name: '第一滴血', desc: '第一次達成委託', check: s => s.completedCount >= 1 },
    { id: 'shopaholic', icon: '🛍️', name: '購物狂', desc: '兌換過3次獎勵', check: s => (s.redemptions || []).length >= 3 },
    // V1.05: Streak achievements
    { id: 'streak7', icon: '🔥', name: '七日烈焰', desc: '連續冒險 7 天', check: s => (s.streakCount || 0) >= 7 },
    { id: 'streak30', icon: '💎', name: '月之守護', desc: '連續冒險 30 天', check: s => (s.streakCount || 0) >= 30 },
    { id: 'streak100', icon: '👑', name: '百日王者', desc: '連續冒險 100 天', check: s => (s.streakCount || 0) >= 100 }
];

// MONSTER POOL for daily battles
const MONSTERS = [
    { name: '史萊姆', emoji: '🟢', hp: 60, atk: 8, xp: 25, pts: 5 },
    { name: '骷髏兵', emoji: '💀', hp: 80, atk: 12, xp: 35, pts: 8 },
    { name: '毒蘑菇', emoji: '🍄', hp: 50, atk: 15, xp: 30, pts: 6 },
    { name: '火焰蜥蜴', emoji: '🦎', hp: 100, atk: 14, xp: 45, pts: 10 },
    { name: '寒冰哥布林', emoji: '🧊', hp: 90, atk: 13, xp: 40, pts: 9 },
    { name: '暗影蝙蝠', emoji: '🦇', hp: 70, atk: 16, xp: 35, pts: 7 },
    { name: '石頭巨人', emoji: '🗿', hp: 150, atk: 10, xp: 60, pts: 15 },
    { name: '幽靈騎士', emoji: '👻', hp: 120, atk: 18, xp: 55, pts: 12 },
];

// AI TASK TEMPLATES (local, no API needed)
const AI_TEMPLATES = {
    CHORE: [
        { title: '整理書桌 (領地維護)', desc: '將混亂的書桌陣地重新布署，確保每一卷卷軸都各就各位！', location: '書房營地', checklist: ['清空桌面所有物品', '擦拭桌面', '文具放回筆筒', '課本按大小排好', '垃圾丟到垃圾桶'] },
        { title: '廚房小幫手', desc: '幫忙把餐桌上的碗盤收到水槽，並把桌子擦乾淨。', location: '廚房', checklist: ['收集所有碗盤', '放到水槽裡', '擦拭餐桌', '椅子推回原位'] },
        { title: '衣服王國整理術', desc: '把衣櫃裡的衣服重新摺好整齊排列！', location: '臥室', checklist: ['把衣服全部拿出來', '按種類分好', '每件衣服仔細摺好', '放回衣櫃排整齊'] },
        { title: '玩具歸位大作戰', desc: '把散落的玩具按類別放回玩具箱或櫃子裡。', location: '客廳', checklist: ['收集所有散落玩具', '按類別分類', '放回對應位置', '地板清空完畢'] },
    ],
    LEARNING: [
        { title: '英文單字 (奧術語法)', desc: '研習 10 個古代奧術單字（英文），並將其編入你的施法句式中。', location: '奧術實驗室', checklist: ['選出10個新單字', '每個字寫3遍', '每個字造一個句子', '找家長聽寫驗收'] },
        { title: '數學習題 (奧金算力)', desc: '完成數學習題練習，挑戰 100% 奧力精準度！', location: '算力工坊', checklist: ['打開數學習作', '完成指定頁數', '自己先檢查一遍', '找家長批改'] },
        { title: '閱讀繪本 (解讀古卷)', desc: '認真研讀一本繪本卷軸，隨後向長老（家長）匯報心得。', location: '英雄酒館', checklist: ['選一本繪本', '安靜閱讀15分鐘', '想想故事在說什麼', '跟家長分享心得'] },
    ],
    ADVENTURE: [
        { title: '公園自然觀察家', desc: '到公園觀察三種不同的植物或昆蟲，並畫下來。', location: '附近公園', checklist: ['帶上畫冊和色鉛筆', '觀察第一種生物', '觀察第二種生物', '觀察第三種生物', '把觀察畫在畫冊上'] },
        { title: '社區探險地圖', desc: '在社區散步一圈，畫一張簡單的社區地圖。', location: '社區', checklist: ['帶上紙和筆', '走一圈社區', '記住重要地標', '回家畫出地圖'] },
    ],
    KINDNESS: [
        { title: '寫一張感謝卡', desc: '親手寫一張感謝卡給家人或朋友，告訴他們你很感謝他們。', location: '家裡', checklist: ['準備卡紙和彩色筆', '想想要感謝誰', '寫下感謝的話', '裝飾卡片', '交給對方'] },
        { title: '鄰里問候 (友好聖工)', desc: '主動向鄰里冒險者致意，並施展援助之手幫忙提物或按梯。', location: '領地廊道', checklist: ['準備好微笑', '主動打招呼', '詢問需要幫忙嗎', '幫忙完成一件小事'] },
    ],
    CREATIVE: [
        { title: '自由畫一幅畫', desc: '用畫筆畫一幅你今天最開心的事！', location: '書桌', checklist: ['準備畫具', '想一個主題', '畫出草稿', '上色完成', '簽上名字 and 日期'] },
        { title: '手作小禮物', desc: '用家裡現有的材料做一個小手工禮物。', location: '家裡', checklist: ['收集材料', '構思設計', '動手製作', '裝飾完成', '送給你想送的人'] },
    ],
    GAME: [
        { title: '快問快答挑戰', desc: '跟爸爸或媽媽進行一場5分鐘的快問快答。', location: '客廳', checklist: ['準備5個問題', '邀請家長', '設定計時器', '完成問答', '分享心得'] },
        { title: '室內尋寶遊戲', desc: '在客廳藏3個小東西，讓家長來找！', location: '客廳', checklist: ['選定3個寶物', '趁家長不注意藏好', '設計簡單提示', '引導家長尋寶', '公佈答案'] },
    ],
    GOAL: [
        { title: '本週飲水計畫', desc: '每天喝足 5 杯水，持續一整週。', location: '家裡', checklist: ['準備專屬水杯', '早上喝1杯', '中午喝2杯', '下午喝1杯', '晚上喝1杯'] },
        { title: '早睡早起好身體', desc: '連續三天晚上 10 點前睡覺。', location: '臥室', checklist: ['設定睡前提醒', '刷牙洗臉', '換好睡衣', '準時躺上床', '紀錄達成天數'] },
    ],
};

// ===== SFX MANAGER (Web Audio API) =====
const SoundManager = {
    ctx: null,
    init: function () {
        if (!this.ctx) {
            try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { console.warn('Web Audio API not supported'); }
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    play: function (type) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        // Retro sound synthesis rules
        if (type === 'click') {
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'attack') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'skill') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.1);
            osc.frequency.linearRampToValueAtTime(200, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'heal') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now); osc.stop(now + 0.4);
        } else if (type === 'win') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.setValueAtTime(400, now + 0.1);
            osc.frequency.setValueAtTime(500, now + 0.2);
            osc.frequency.setValueAtTime(600, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.6);
            osc.start(now); osc.stop(now + 0.6);
        } else if (type === 'levelUp') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(500, now + 0.15);
            osc.frequency.setValueAtTime(600, now + 0.3);
            osc.frequency.setValueAtTime(800, now + 0.45);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.8);
            osc.start(now); osc.stop(now + 0.8);
        }
    }
};

// ===== GLOBAL STATE (shared tasks across accounts) =====
let globalData = loadGlobal();
function defaultGlobal() {
    return {
        accounts: {},    // accountId -> account state
        activeId: null,  // current active account ID
        tasks: [],       // shared task pool
        rewards: [...DEFAULT_REWARDS],
        echoes: {},
        familyMembers: [],
    };
}
function defaultAccount(name) {
    return {
        name, charPreset: 'mage',
        points: 0, level: 1, totalXP: 0, completedCount: 0,
        achievements: [], redemptions: [], activeSub: null,
        battlesWon: 0, lastBattleDate: null, potions: 0,
        consecutiveLogins: 0, lastDailyClaim: null,
        equipment: [], avatarUrl: null, tasksPublished: 0,
        // V1.05 Streak System
        streakCount: 0, streakLastActiveDate: null, streakFreezeCount: 0,
        // V1.05 Daily Quests
        dailyQuests: null, dailyQuestsDate: null, dailyQuestsProgress: {}, dailyQuestsAllClaimed: false,
        // V1.05 XP Boost
        xpBoostUntil: null
    };
}
function loadGlobal() {
    try { const r = localStorage.getItem('echo3'); if (r) return JSON.parse(r); } catch (e) { }
    return defaultGlobal();
}
function saveGlobal() {
    localStorage.setItem('echo3', JSON.stringify(globalData));
    // Debounced cloud sync (avoid excessive writes)
    _debouncedCloudSync();
}

let _cloudSyncTimer = null;
function _debouncedCloudSync() {
    if (_cloudSyncTimer) clearTimeout(_cloudSyncTimer);
    _cloudSyncTimer = setTimeout(() => {
        const uid = (typeof EchoAuth !== 'undefined') ? EchoAuth.getUid() : null;
        if (uid && typeof EchoDb !== 'undefined' && EchoDb.isReady()) {
            EchoDb.saveUserData(uid).catch(err => {
                console.warn('[ECHO] Cloud sync failed:', err);
            });
        }
    }, 2000); // 2 seconds debounce
}

// Simple password hash (POC level - not production crypto)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
}

// Active account helper
function me() { return globalData.accounts[globalData.activeId] || null; }
function myId() { return globalData.activeId; }

function getPlayerStats(acc) {
    if (!acc) return { atk: 0, def: 0, pets: [] };
    let atk = 15 + acc.level * 2;
    let def = 5 + acc.level * 1;
    let pets = [];

    // Add pet bonuses from unlocked achievements
    for (const achId of acc.achievements) {
        const achDef = ACHIEVEMENTS.find(x => x.id === achId);
        if (achDef && achDef.reward) {
            atk += (achDef.reward.atk || 0);
            def += (achDef.reward.def || 0);
            pets.push(achDef.reward);
        }
    }

    // Add Equipment bonuses
    if (acc.equipment) {
        for (const eq of acc.equipment) {
            atk += (eq.atk || 0);
            def += (eq.def || 0);
        }
    }

    return { atk, def, pets };
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Firebase (if configured)
    const fbReady = (typeof initFirebase === 'function') ? initFirebase() : false;
    const fbConfigured = (typeof isFirebaseConfigured === 'function') ? isFirebaseConfigured() : false;

    // Firebase status: log only, no UI indicator
    console.log(`[ECHO] Firebase: ${fbReady && fbConfigured ? '雲端模式' : '本地模式'}`);

    // 2. Initialize Firestore
    if (typeof EchoDb !== 'undefined') {
        EchoDb.init();
    }

    // 3. Initialize Auth module (waits for first auth state check)
    let firebaseUser = null;
    if (typeof EchoAuth !== 'undefined') {
        // init() 返回 Promise，等待 Firebase Auth 確認使用者狀態
        // 如果 Firebase 已登入，會自動 enterApp() 或導向 step2
        firebaseUser = await EchoAuth.init();
    }

    // 4. Initialize Payment (PAYUNi / Demo)
    if (typeof EchoPayment !== 'undefined') {
        EchoPayment.init();
        EchoPayment.handlePaymentCallback();
        const uid = (typeof EchoAuth !== 'undefined' && EchoAuth.getUid) ? EchoAuth.getUid() : null;
        if (uid) EchoPayment.checkExpiry(uid);
    }

    // 5. No demo data — real users start with a clean slate

    // 6. Data Migration: ensure rewards have stock
    globalData.rewards.forEach(r => {
        if (r.stock === undefined) r.stock = 5;
    });

    // 7. Check existing session (only if Firebase didn't already handle it)
    if (!firebaseUser && globalData.activeId && me()) {
        const a = me();
        if (!a.name || a.name === '冒險者') {
            showScreen('screen-auth-step2');
        } else {
            enterApp();
        }
    }
    initWheel();
});

function seedDemoTasks() {
    const uid = 'demo_child';
    globalData.tasks = [
        { id: 'T_demo1', title: '幫忙收拾玩具', desc: '把客廳散落的玩具放回玩具箱裡，分類整齊！', type: 'CHORE', difficulty: 'EASY', creator: '媽媽', creatorId: 'mom', status: 'PUBLISHED', claimedBy: null, createdAt: Date.now() - 3600000, deadline: null, location: '客廳', checklist: [{ text: '收集散落玩具', done: false }, { text: '按類別分類', done: false }, { text: '放回玩具箱', done: false }] },
        { id: 'T_demo2', title: '背誦九九乘法 7 的段', desc: '完整背誦不能偷看！背完後找媽媽驗收。', type: 'LEARNING', difficulty: 'MEDIUM', creator: '爸爸', creatorId: 'dad', status: 'CLAIMED', claimedBy: uid, claimedAt: Date.now() - 1800000, createdAt: Date.now() - 7200000, deadline: null, location: '書房', checklist: [{ text: '熟讀7的段', done: true }, { text: '不看課本背一遍', done: true }, { text: '找家長驗收', done: false }] },
        { id: 'T_demo3', title: '到公園找三種不同的葉子', desc: '去附近的公園散步，撿三種不同形狀的葉子帶回來觀察！', type: 'ADVENTURE', difficulty: 'HARD', creator: '舅舅', creatorId: 'uncle', status: 'PUBLISHED', claimedBy: null, createdAt: Date.now() - 10800000, deadline: null, location: '社區公園', checklist: [{ text: '帶上袋子和放大鏡', done: false }, { text: '找到第一種葉子', done: false }, { text: '找到第二種葉子', done: false }] },
        { id: 'T_demo4', title: '寫一張感謝卡給老師', desc: '親手寫一張感謝卡，謝謝老師的辛苦教導！', type: 'KINDNESS', difficulty: 'EASY', creator: '阿姨', creatorId: 'aunt', status: 'COMPLETED_PENDING_CONFIRM', claimedBy: uid, completedAt: Date.now() - 600000, createdAt: Date.now() - 14400000, deadline: null, location: '家裡', checklist: [{ text: '準備卡紙', done: true }, { text: '寫感謝的話', done: true }, { text: '裝飾卡片', done: true }] },
        { id: 'T_demo5', title: '和家人一起玩桌遊30分鐘', desc: '選一款桌遊和家人一起玩！記錄誰贏了。', type: 'GAME', difficulty: 'EASY', creator: '姊姊', creatorId: 'sis', status: 'PUBLISHED', claimedBy: null, createdAt: Date.now() - 5400000, deadline: null, location: '客廳', checklist: [{ text: '選一款桌遊', done: false }, { text: '邀請家人', done: false }, { text: '玩30分鐘', done: false }] },
    ];
    saveGlobal();
}

// ===== AUTH =====
async function doLoginStep1() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    if (!email) { showToast('請輸入冒險者聯絡 Email！'); return; }
    if (!password) { showToast('請輸入密碼！'); return; }
    if (password.length < 6) { showToast('密碼至少需要 6 個字元！'); return; }

    // Disable button during auth
    const btn = document.getElementById('auth-login-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="ph-bold ph-spinner"></i> 登入中...'; }

    try {
        const result = await EchoAuth.loginWithEmail(email, password);

        if (result.success) {
            if (result.isNew) {
                showScreen('screen-auth-step2');
            } else {
                const a = me();
                if (a && (!a.name || a.name === '冒險者' || !a.avatarUrl)) {
                    showScreen('screen-auth-step2');
                } else {
                    enterApp();
                }
            }
        }
    } catch (err) {
        console.error('Login error:', err);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="ph-bold ph-sign-in"></i> 登入 / 註冊'; }
    }
}

async function completeRegistration() {
    const name = document.getElementById('auth-name').value.trim();
    const age = parseInt(document.getElementById('auth-age').value) || 0;
    const loc = document.getElementById('auth-loc').value.trim();
    if (!name) { showToast('請輸入冒險者名稱！'); return; }

    const a = me();
    a.name = name;
    if (age) a.age = age;
    if (loc) a.location = cleanLocation(loc);
    if (currentAvatarUrl) {
        a.avatarUrl = currentAvatarUrl;
    } else {
        // Save selected character preset
        a.charPreset = selectedCharPreset;
        const preset = CHAR_PRESETS.find(c => c.id === selectedCharPreset);
        if (preset) a.avatarUrl = preset.img;
    }

    saveGlobal();

    // 同步到 Firestore（若已連線）
    const uid = (typeof EchoAuth !== 'undefined') ? EchoAuth.getUid() : null;
    if (uid && typeof EchoDb !== 'undefined' && EchoDb.isReady()) {
        await EchoDb.saveUserData(uid);
        console.log('[ECHO] 冒險者資料已同步到雲端');
    }

    // 更新 Firebase displayName（若使用 Firebase Auth）
    if (typeof EchoAuth !== 'undefined' && EchoAuth.currentUser) {
        try {
            await EchoAuth.currentUser.updateProfile({ displayName: name });
        } catch (e) { console.warn('[ECHO] 更新 displayName 失敗:', e); }
    }

    const className = getClassName(a.level, a);
    showCelebration('📸', `歡迎 ${className} ${name}！`, '冒險即將開始…');
    setTimeout(() => enterApp(), 2500);
}

function cleanLocation(loc) {
    if (!loc) return '';
    let s = loc.trim();
    // Fix "TaipeiTaipei" or "台北台北" type of duplication
    if (s.length >= 4) {
        const half = s.length / 2;
        if (Number.isInteger(half)) {
            const part1 = s.substring(0, half);
            const part2 = s.substring(half);
            if (part1 === part2) return part1;
        }
    }
    // Fix "Taipei Taipei" or "台北 台北" duplicated words
    const words = s.split(/[,，\s]+/);
    const unique = [];
    words.forEach(w => { if (w && !unique.includes(w)) unique.push(w); });
    return unique.join(', ');
}

// Legacy doLogin for backward compatibility
function doLogin() { doLoginStep1(); }

async function doGoogleLogin() {
    const btn = document.getElementById('auth-google-btn');
    if (btn) { btn.disabled = true; btn.textContent = '登入中...'; }

    try {
        const result = await EchoAuth.loginWithGoogle();

        if (result.success) {
            if (result.isNew) {
                showScreen('screen-auth-step2');
            } else {
                const a = me();
                if (a && (!a.name || a.name === '冒險者')) {
                    showScreen('screen-auth-step2');
                } else {
                    enterApp();
                }
            }
        }
    } catch (err) {
        console.error('Google login error:', err);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<svg viewBox="0 0 48 48" width="20" height="20"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.9 23.9 0 000 24c0 3.77.9 7.34 2.44 10.51l8.09-5.92z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-8.09 5.92C6.51 42.62 14.62 48 24 48z"/></svg> 使用 Google 登入'; }
    }
}

function loginAs(name) {
    let accId = null;
    for (const [id, acc] of Object.entries(globalData.accounts)) {
        if (acc.name === name) { accId = id; break; }
    }
    if (!accId) {
        accId = 'demo_child';
        globalData.accounts[accId] = defaultAccount(name);
    }
    globalData.activeId = accId;
    saveGlobal();
    if (!me().avatarUrl) {
        showScreen('screen-auth-step2');
        showToast(`歡迎，${name}！完成你的冒險者檔案！`);
    } else {
        enterApp();
        showToast(`歡迎回來，${name}！`);
    }
}

async function doLogout() {
    // Sync data to cloud before logout
    const uid = EchoAuth.getUid();
    if (uid && typeof EchoDb !== 'undefined' && EchoDb.isReady()) {
        await EchoDb.saveUserData(uid);
    }
    // Firebase logout
    if (typeof EchoAuth !== 'undefined') {
        await EchoAuth.logout();
    } else {
        globalData.activeId = null;
        saveGlobal();
        document.getElementById('main-nav').style.display = 'none';
        showScreen('screen-auth');
    }
}

// ===== CHARACTER =====
// ===== AVATAR SYSTEM =====
let currentAvatarUrl = null;
let talkTmr = null;

function charTalk(text, targetId, bubbleId) {
    if (!text) return;
    const target = document.getElementById(targetId);
    const bubble = document.getElementById(bubbleId);
    if (!target || !bubble) return;

    bubble.textContent = text;
    bubble.classList.add('show');
    target.classList.add('talking');

    // Play sound if available
    if (window.soundManager) soundManager.play('click');

    clearTimeout(talkTmr);
    talkTmr = setTimeout(() => {
        bubble.classList.remove('show');
        target.classList.remove('talking');
    }, 4000);
}

async function handleProfileAvatarUpload(event) {
    await handleAvatarUpload(event, true);
    if (currentAvatarUrl) {
        me().avatarUrl = currentAvatarUrl;
        saveGlobal();
        refreshProfile();
        refreshHUD();
        showToast('✨ 冒險者頭像已更新！');
    }
}

function openCharPresetPicker() {
    const a = me(); if (!a) return;
    const current = a.charPreset || 'mage';
    let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:8px 0;">';
    CHAR_PRESETS.forEach(c => {
        const sel = c.id === current;
        html += `<div onclick="applyCharPreset('${c.id}')" style="cursor:pointer;text-align:center;padding:10px 4px;border-radius:16px;border:3px solid ${sel ? 'var(--primary)' : 'transparent'};background:${sel ? 'rgba(99,102,241,0.08)' : 'var(--surface)'};transition:all 0.2s;">
            <img src="${c.img}" style="width:52px;height:52px;object-fit:contain;border-radius:50%;${sel ? 'filter:drop-shadow(0 0 8px rgba(99,102,241,0.5))' : ''}">
            <div style="font-size:11px;font-weight:800;color:${sel ? 'var(--primary)' : 'var(--text2)'};margin-top:4px;">${c.name}</div>
        </div>`;
    });
    html += '</div>';
    const overlay = document.createElement('div');
    overlay.id = 'char-preset-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;';
    overlay.innerHTML = `<div style="background:var(--bg);border-radius:24px;padding:24px;max-width:360px;width:100%;max-height:80vh;overflow-y:auto;">
        <div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:12px;">🎭 轉職 — 選擇你的職業</div>
        ${html}
        <button onclick="document.getElementById('char-preset-overlay').remove()" style="margin-top:12px;width:100%;padding:12px;border-radius:12px;background:var(--surface);color:var(--text2);font-weight:800;border:none;cursor:pointer;">取消</button>
    </div>`;
    document.body.appendChild(overlay);
}

function applyCharPreset(id) {
    const a = me(); if (!a) return;
    const preset = CHAR_PRESETS.find(c => c.id === id);
    if (!preset) return;
    a.charPreset = id;
    a.avatarUrl = preset.img;
    saveGlobal();
    refreshProfile();
    refreshHUD();
    const overlay = document.getElementById('char-preset-overlay');
    if (overlay) overlay.remove();
    const fullTitle = getClassName(a.level, a);
    showToast(`✨ 角色已轉職為「${fullTitle}」！`);
}

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function handleAvatarUpload(event, isProfile = false) {
    const file = event.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('upload-status');
    const previewEl = document.getElementById(isProfile ? 'prof-char-avatar' : 'avatar-preview');

    if (statusEl) statusEl.style.display = 'block';

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            let src = e.target.result;

            // Show initial preview
            if (previewEl) {
                if (isProfile) {
                    previewEl.innerHTML = `<img src="${src}" class="avatar-animated" style="width:120px;height:120px;object-fit:contain; border-radius:50%">`;
                } else {
                    previewEl.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;">`;
                }
            }

            // Remove background
            const bgLib = typeof imglyRemoveBackground !== 'undefined' ? imglyRemoveBackground :
                (typeof removeBackground !== 'undefined' ? removeBackground : null);

            if (bgLib) {
                try {
                    const blob = await bgLib(src);
                    src = await blobToBase64(blob); // Convert to Base64 for persistence
                    console.log("Background removed and converted to base64");
                } catch (err) {
                    console.error("BG Removal failed, using original:", err);
                }
            }

            currentAvatarUrl = src;

            if (isProfile) {
                me().avatarUrl = src;
                saveGlobal();
                refreshProfile();
                showToast('✨ 頭像已更新！');
            } else {
                if (previewEl) previewEl.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;">`;
            }

            if (statusEl) statusEl.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } catch (err) {
        console.error("Upload failed:", err);
        if (statusEl) statusEl.style.display = 'none';
        showToast('上傳失敗，請重試');
    }
}
function getCharEmoji(charDef, level) {
    return '🧙'; // Generic fallback emoji
}
const DEFAULT_AVATAR = 'img/chars/mage.png';

// Character selection presets
const CHAR_PRESETS = [
    { id: 'mage', name: '法師', img: 'img/chars/mage.png' },
    { id: 'warrior', name: '戰士', img: 'img/chars/warrior.png' },
    { id: 'ranger', name: '弓箭手', img: 'img/chars/ranger.png' },
    { id: 'elf', name: '精靈', img: 'img/chars/elf.png' },
    { id: 'ninja', name: '忍者', img: 'img/chars/ninja.png' },
    { id: 'dragon', name: '龍族', img: 'img/chars/dragon.png' },
    { id: 'charmander', name: '小火龍', img: 'img/chars/charmander.png' },
    { id: 'slime', name: '史萊姆', img: 'img/chars/slime.png' },
];
let selectedCharPreset = 'mage';

function renderCharSelectGrid() {
    const grid = document.getElementById('char-select-grid');
    if (!grid) return;
    grid.innerHTML = CHAR_PRESETS.map(c => `
        <div onclick="selectCharPreset('${c.id}')" style="cursor:pointer; text-align:center; padding:8px 4px; border-radius:16px; border:3px solid ${selectedCharPreset === c.id ? 'var(--primary)' : 'transparent'}; background:${selectedCharPreset === c.id ? 'rgba(99,102,241,0.08)' : 'var(--surface)'}; transition:all 0.2s;">
            <img src="${c.img}" style="width:56px;height:56px;object-fit:contain;border-radius:50%;${selectedCharPreset === c.id ? 'filter:drop-shadow(0 0 8px rgba(99,102,241,0.5))' : ''}">
            <div style="font-size:11px;font-weight:800;color:${selectedCharPreset === c.id ? 'var(--primary)' : 'var(--text2)'};margin-top:4px;">${c.name}</div>
        </div>
    `).join('');
}

function selectCharPreset(id) {
    selectedCharPreset = id;
    const preset = CHAR_PRESETS.find(c => c.id === id);
    if (preset) currentAvatarUrl = null; // Clear custom upload if selecting preset
    renderCharSelectGrid();
}

function getCharImg(charDef, size = 48, level = 1, isAnimated = true) {
    const a = typeof charDef === 'string' ? globalData.accounts[charDef] : charDef;
    const src = (a && a.avatarUrl) ? a.avatarUrl : (a && a.charPreset ? CHAR_PRESETS.find(c => c.id === a.charPreset)?.img || DEFAULT_AVATAR : DEFAULT_AVATAR);
    const animClass = isAnimated ? 'avatar-animated' : '';
    return `<img src="${src}" class="${animClass}" style="width:${size}px;height:${size}px;object-fit:contain; border-radius:50%">`;
}
function getClassName(level, account) {
    let cls = CLASS_PATH[0];
    for (const c of CLASS_PATH) { if (level >= c.lvl) cls = c; }
    // V1.06: Combine tier suffix + character preset name
    const a = typeof account === 'string' ? globalData.accounts[account] : account;
    const presetId = (a && a.charPreset) ? a.charPreset : 'mage';
    const preset = CHAR_PRESETS.find(c => c.id === presetId);
    const charName = preset ? preset.name : '冒險者';
    // Tier 1 = "法師見習", Tier 2 = "青銅法師", etc.
    return cls.tier === 1 ? `${charName}見習` : `${cls.suffix}${charName}`;
}
function getClassColor(level) {
    let cls = CLASS_PATH[0];
    for (const c of CLASS_PATH) { if (level >= c.lvl) cls = c; }
    return cls.color;
}

function getCharTier(level) {
    let tier = 0;
    for (let i = 0; i < CLASS_PATH.length; i++) {
        if (level >= CLASS_PATH[i].lvl) tier = i;
    }
    return tier;
}

// ===== ENTER APP =====
let dialogueInterval = null;

function enterApp() {
    document.getElementById('main-nav').style.display = 'flex';
    showScreen('screen-home');
    refreshAll();

    // V1.05: Initialize Daily Quests
    if (typeof EchoDailyQuests !== 'undefined') {
        EchoDailyQuests.initQuests(me());
        EchoDailyQuests.refreshQuestsUI();
    }

    checkDailyLogin();

    // Setup Random Character Dialogues
    if (dialogueInterval) clearInterval(dialogueInterval);
    dialogueInterval = setInterval(() => {
        if ((currentScreen === 'screen-home' || currentScreen === 'screen-character') && Math.random() > 0.4) {
            showCharacterQuote();
        }
    }, 6000); // 6 seconds

    // Auto-create family guild for new users
    const a = me();
    if (a && (!a.guildId || !getMyGuild())) {
        const guilds = getGuilds();
        const guildId = 'G_default_' + myId();
        if (!guilds[guildId]) {
            guilds[guildId] = {
                id: guildId,
                name: a.name + '的冒險小隊',
                icon: '🏰',
                code: String(Math.floor(100000 + Math.random() * 900000)),
                ownerId: myId(),
                createdAt: Date.now(),
                members: [{ id: myId(), name: a.name, emoji: '🧙', roleTitle: '隊長' }]
            };
        }
        a.guildId = guildId;
        saveGlobal();
    }
}

function showCharacterQuote() {
    const a = me(); if (!a) return;
    const quotes = ADVENTURE_QUOTES;
    if (!quotes || quotes.length === 0) return;

    if (dialogueInterval) clearInterval(dialogueInterval);
    dialogueInterval = setInterval(() => {
        if (currentScreen !== 'screen-home' && currentScreen !== 'screen-character') return;
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        const targetId = currentScreen === 'screen-home' ? 'hud-char-icon' : 'prof-char';
        const bubbleId = currentScreen === 'screen-home' ? 'hud-char-bubble' : 'prof-char-bubble';
        charTalk(q, targetId, bubbleId);
    }, 15000 + Math.random() * 10000);
}

// ===== DAILY LOGIN =====
const DAILY_REWARDS = [
    { day: 1, icon: '💎', label: '10 金幣', action: a => a.points += 10 },
    { day: 2, icon: '<i class="ph-bold ph-flask"></i>', label: '1 藥水', action: a => a.potions = (a.potions || 0) + 1 },
    { day: 3, icon: '⚡', label: '50 XP', action: a => { a.totalXP += 50; a.level = calcLevel(a.totalXP); } },
    { day: 4, icon: '💎', label: '30 金幣', action: a => a.points += 30 },
    { day: 5, icon: '<i class="ph-bold ph-flask"></i>', label: '2 藥水', action: a => a.potions = (a.potions || 0) + 2 },
    { day: 6, icon: '⚡', label: '200 XP', action: a => { a.totalXP += 200; a.level = calcLevel(a.totalXP); } },
    { day: 7, icon: '🎁', label: '神秘大獎', action: a => { a.points += 100; a.potions = (a.potions || 0) + 3; } }
];

function checkDailyLogin() {
    const a = me();
    if (!a) return;

    const now = new Date();
    const todayStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

    if (a.lastDailyClaim === todayStr) return; // Already claimed today

    // Check if yesterday was claimed to maintain streak
    let isStreak = false;
    if (a.lastDailyClaim) {
        const lastDate = new Date(a.lastDailyClaim);
        const diffTime = Math.abs(now - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) { // 1 day difference
            isStreak = true;
        }
    }

    if (isStreak) {
        a.consecutiveLogins = (a.consecutiveLogins || 0) + 1;
    } else {
        a.consecutiveLogins = 1;
    }

    // Cap at 7 for UI logic
    let displayStreak = a.consecutiveLogins % 7;
    if (displayStreak === 0) displayStreak = 7;

    const countEl = document.getElementById('daily-streak-count');
    if (countEl) countEl.textContent = displayStreak;

    const gridEl = document.getElementById('daily-rewards-grid');
    if (gridEl) {
        gridEl.innerHTML = DAILY_REWARDS.map(r => `
            <div style="background:${r.day === displayStreak ? 'rgba(255,215,0,0.1)' : 'var(--bg)'}; border: 2px solid ${r.day === displayStreak ? 'var(--primary)' : 'var(--border)'}; border-radius: 12px; padding: 12px 8px; text-align: center; position: relative; opacity:${r.day < displayStreak ? '0.5' : '1'}; ">
                ${r.day < displayStreak ? '<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:24px; z-index:2; text-shadow:0 0 4px #fff;">✅</div>' : ''}
                <div style="font-size:10px; font-weight:800; color:var(--text2); margin-bottom:4px">Day ${r.day}</div>
                <div style="font-size:24px; margin-bottom:4px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${r.icon}</div>
                <div style="font-size:11px; font-weight:900; color:var(--text);">${r.label}</div>
                ${r.day === 7 ? '<div style="position:absolute; top:-8px; right:-8px; background:#FF4757; color:#fff; font-size:9px; padding:2px 6px; border-radius:10px; font-weight:900;">大獎！</div>' : ''}
            </div>
        `).join('');
    }

    document.getElementById('daily-login-modal').style.display = 'flex';
}

function claimDailyReward() {
    const a = me();
    if (!a) return;

    const now = new Date();
    const todayStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    a.lastDailyClaim = todayStr;

    let displayStreak = a.consecutiveLogins % 7;
    if (displayStreak === 0) displayStreak = 7;

    const reward = DAILY_REWARDS[displayStreak - 1];
    if (reward) {
        reward.action(a);
        showCelebration(reward.icon, '簽到成功！', `獲得 ${reward.label}！連續登入 ${a.consecutiveLogins} 天！`);
    }

    saveGlobal();
    refreshAll();

    document.getElementById('daily-login-modal').style.display = 'none';
}

// ===== NAVIGATION =====
let currentScreen = 'screen-auth';
let detailReturnScreen = 'screen-home';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('hidden', s.id !== id));
    currentScreen = id;
    if (id === 'screen-home') { refreshHUD(); renderTaskFeed(); refreshDailyBanner(); refreshWheelHint(); if (typeof EchoDailyQuests !== 'undefined') EchoDailyQuests.refreshQuestsUI(); }
    if (id === 'screen-dashboard') { renderDashboard('week'); }
    if (id === 'screen-mytasks') renderMyTasks();
    if (id === 'screen-rewards') { renderRewards(); }
    if (id === 'screen-character') refreshProfile();
    if (id === 'screen-subscription') refreshSubPage();
    if (id === 'screen-create') resetCreateForm();
    if (id === 'screen-auth-step2') renderCharSelectGrid();
}
function nav(id, btn) {

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    showScreen(id);
}

// ===== REFRESH =====
function refreshAll() { refreshHUD(); renderTaskFeed(); checkAchievements(); }

function refreshHome() { refreshHUD(); renderTaskFeed(); }

function refreshHUD() {
    const a = me(); if (!a) return;
    const stats = getPlayerStats(a);

    const elIcon = document.getElementById('hud-char-icon');
    if (elIcon) elIcon.innerHTML = getCharImg(a, 90, a.level, false);

    const elName = document.getElementById('hud-charname');
    if (elName) elName.textContent = a.name;

    const elLvl = document.getElementById('hud-level');
    if (elLvl) elLvl.textContent = a.level;

    const elPts = document.getElementById('hud-points');
    if (elPts) elPts.textContent = a.points;

    const elAtk = document.getElementById('hud-atk');
    if (elAtk) elAtk.textContent = stats.atk;

    const elDef = document.getElementById('hud-def');
    if (elDef) elDef.textContent = stats.def;

    const elDone = document.getElementById('hud-done');
    if (elDone) elDone.textContent = a.completedCount;

    const elStreak = document.getElementById('streak-val');
    if (elStreak) elStreak.textContent = a.consecutiveLogins;

    // V1.05: Streak badge in HUD
    const streakBadgeEl = document.getElementById('hud-streak-badge');
    if (streakBadgeEl && typeof EchoStreak !== 'undefined') {
        streakBadgeEl.innerHTML = EchoStreak.renderStreakBadge(a);
    }

    const xpCur = xpForLevel(a.level);
    const xpNxt = xpForLevel(a.level + 1);
    const pct = xpNxt > xpCur ? ((a.totalXP - xpCur) / (xpNxt - xpCur)) * 100 : 100;

    const elXpFill = document.getElementById('xp-fill');
    if (elXpFill) elXpFill.style.width = Math.min(pct, 100) + '%';

    const elXpCur = document.getElementById('xp-current');
    if (elXpCur) elXpCur.textContent = `${a.totalXP} / ${xpNxt} XP`;

    const elXpNxt = document.getElementById('xp-next');
    if (elXpNxt) elXpNxt.textContent = a.level >= LEVEL_CAP ? 'MAX' : `→ Lv.${a.level + 1}`;

    // Guild badge in home profile
    const guildBadge = document.getElementById('hud-guild-badge');
    if (guildBadge) {
        const guild = a.guildId && globalData.guilds ? globalData.guilds[a.guildId] : null;
        if (guild) {
            const member = guild.members.find(m => m.id === globalData.activeId);
            const roleTitle = member ? member.roleTitle || '成員' : '成員';
            guildBadge.innerHTML = `${guild.icon} ${guild.name} · ${roleTitle}`;
            guildBadge.style.display = 'inline-flex';
        } else {
            guildBadge.style.display = 'none';
        }
    }
}

function refreshProfile() {
    const a = me(); if (!a) return;
    const tierIdx = getCharTier(a.level);
    const stats = getPlayerStats(a);

    const bigEl = document.getElementById('prof-char');
    const bubbleEl = document.getElementById('prof-char-bubble');
    if (bigEl) {
        bigEl.innerHTML = getCharImg(a, 130, a.level, false);
        bigEl.className = 'char-big';
        bigEl.style.cursor = 'pointer';
        bigEl.onclick = () => {
            const quote = ADVENTURE_QUOTES[Math.floor(Math.random() * ADVENTURE_QUOTES.length)];
            charTalk(quote, 'prof-char', 'prof-char-bubble');
        };
    }

    // Show pet icons overlay if any
    if (stats.pets && stats.pets.length > 0) {
        const petsHtml = stats.pets.map((p, i) => `<div style="position:absolute; bottom:${-10 + i * 15}px; right:${-10 - i * 5}px; font-size:24px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5)); animation: charFloat ${2 + i * 0.5}s ease-in-out infinite;">${p.emoji}</div>`).join('');
        bigEl.innerHTML += petsHtml;
    }

    // Set avatar ring color based on class
    const ringEl = document.querySelector('.avatar-neon-ring');
    const glowEl = document.querySelector('.avatar-neon-glow');
    const ringColor = getClassColor(a.level);
    if (ringEl) ringEl.style.background = `conic-gradient(from var(--angle), ${ringColor}, #a855f7, #ec4899, ${ringColor})`;
    if (glowEl) glowEl.style.background = `conic-gradient(from var(--angle), ${ringColor}, #a855f7, #ec4899, ${ringColor})`;

    document.getElementById('prof-name').textContent = a.name;
    const cn = getClassName(a.level, a);
    document.getElementById('prof-classname').textContent = cn;
    document.getElementById('prof-class-badge').innerHTML = `⭐ Lv.${a.level} ${cn}`;
    document.getElementById('prof-class-badge').style.color = ringColor;
    document.getElementById('p-level').textContent = a.level;
    document.getElementById('p-xp').textContent = a.totalXP;

    // Stats inject
    const pAtk = document.getElementById('p-atk');
    if (pAtk) pAtk.textContent = stats.atk;
    const pDef = document.getElementById('p-def');
    if (pDef) pDef.textContent = stats.def;

    // --- Menu Guild Label Sync ---
    const menuLabel = document.getElementById('menu-guild-label');
    if (menuLabel) {
        const guild = getMyGuild();
        if (guild) {
            menuLabel.innerHTML = `<span style="color:var(--primary);font-weight:800;">${guild.icon} ${esc(guild.name)}</span> <i class="ph ph-caret-right"></i>`;
        } else {
            menuLabel.innerHTML = '尚未加入 <i class="ph ph-caret-right"></i>';
        }
    }

    // Guild info
    const g = getMyGuild();
    const gIcon = document.getElementById('profile-guild-icon');
    const gName = document.getElementById('profile-guild-name');
    const gDesc = document.getElementById('profile-guild-desc');

    if (g) {
        if (gIcon) gIcon.textContent = g.icon || '🛡️';
        if (gName) gName.textContent = g.name;
        const member = g.members.find(m => m.id === myId());
        const role = member ? member.roleTitle || '成員' : '成員';
        if (gDesc) gDesc.textContent = `你的職位：${role}`;
    } else {
        if (gIcon) gIcon.textContent = '🏰';
        if (gName) gName.textContent = '加入公會';
        if (gDesc) gDesc.textContent = '加入或是建立你的公會，解鎖更多任務！';
    }

    // Equip rendering
    const eqGrid = document.getElementById('equip-grid');
    if (eqGrid) {
        if (!a.equipment || a.equipment.length === 0) {
            eqGrid.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:12px;width:100%;grid-column:span 2">尚未裝備任何物品</div>';
        } else {
            eqGrid.innerHTML = a.equipment.map(eq => `
                <div class="card flex items-center gap-2" style="padding: 12px; border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.02)">
                    <span style="font-size:32px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.1))">${eq.emoji}</span>
                    <div style="flex:1">
                        <div style="font-weight:900; font-size:14px; color:var(--text); line-height:1.2; margin-bottom:2px;">${eq.name}</div>
                        <div style="font-size:11px; color:var(--text2); display:flex; gap:6px;">
                            ${eq.atk ? `<span style="color:#FF6B00"><i class="ph-bold ph-sword"></i> +${eq.atk}</span>` : ''}
                            ${eq.def ? `<span style="color:#00E5FF"><i class="ph-bold ph-shield"></i> +${eq.def}</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Account UI Update
    const accUser = document.getElementById('acc-username');
    if (accUser) accUser.textContent = a.name;
    const accAge = document.getElementById('acc-age');
    if (accAge) accAge.textContent = a.age || 10;
    const emailEl = document.getElementById('acc-email');
    if (emailEl) emailEl.textContent = a.email || 'user@example.com';
    const goo = document.getElementById('acc-google-status');
    if (goo) {
        if (a.googleBound) {
            goo.innerHTML = '<span style="color:#10b981; font-weight:800;">已綁定</span> <i class="ph ph-caret-right"></i>';
        } else {
            goo.innerHTML = '未綁定 <i class="ph ph-caret-right"></i>';
        }
    }
    const locEl = document.getElementById('acc-location');
    if (locEl) locEl.textContent = a.location || '尚未設定';

    const subEl = document.getElementById('menu-sub-label');
    if (subEl) {
        subEl.innerHTML = a.subscription === 'pro'
            ? '<span style="color:#FFD700">Pro</span> <i class="ph ph-caret-right"></i>'
            : '免費版 <i class="ph ph-caret-right"></i>';
    }

    // Update promoted guild card in profile
    const guildCard = document.getElementById('profile-guild-card');
    const guildIcon = document.getElementById('profile-guild-icon');
    const guildName = document.getElementById('profile-guild-name');
    const guildDesc = document.getElementById('profile-guild-desc');
    if (guildCard) {
        const guild = a.guildId && globalData.guilds ? globalData.guilds[a.guildId] : null;
        if (guild) {
            const member = guild.members.find(m => m.id === globalData.activeId);
            const roleTitle = member ? member.roleTitle || '成員' : '成員';
            if (guildIcon) guildIcon.textContent = guild.icon;
            if (guildName) guildName.textContent = guild.name;
            if (guildDesc) guildDesc.innerHTML = `<span style="color:var(--primary);font-weight:800;">${roleTitle}</span> · ${guild.members.length} 位成員`;
        } else {
            if (guildIcon) guildIcon.textContent = '🏰';
            if (guildName) guildName.textContent = '加入公會';
            if (guildDesc) guildDesc.textContent = '加入或建立你的公會，解鎖更多委託！';
        }
    }

    // Guild badge under character name in profile
    const profClassBadge = document.getElementById('prof-class-badge');
    if (profClassBadge) {
        const guild = a.guildId && globalData.guilds ? globalData.guilds[a.guildId] : null;
        let badgeHtml = `⭐ Lv.${a.level} ${cn} `;
        if (guild) {
            const member = guild.members.find(m => m.id === globalData.activeId);
            const roleTitle = member ? member.roleTitle || '成員' : '成員';
            badgeHtml += ` <span class="guild-inline-badge" style="margin-left:6px;margin-top:0;">${guild.icon} ${guild.name}</span> `;
        }
        profClassBadge.innerHTML = badgeHtml;
        profClassBadge.style.color = getClassColor(a.level);
    }

    renderAchievements();
}

function openAccountSettings() {
    showScreen('screen-account');
    const a = me(); if (!a) return;
    // Populate account fields
    const elName = document.getElementById('acc-username');
    const elAge = document.getElementById('acc-age');
    const elEmail = document.getElementById('acc-email');
    const elGoogle = document.getElementById('acc-google-status');
    const elLoc = document.getElementById('acc-location');
    if (elName) elName.textContent = a.name || '冒險者';
    if (elAge) elAge.textContent = a.age || '—';
    if (elEmail) elEmail.textContent = a.email || 'user@echo.com';
    if (elGoogle) {
        if (a.googleBound) {
            elGoogle.innerHTML = '<span style="color:#10b981;font-weight:800;">已綁定</span> <i class="ph ph-caret-right"></i>';
        } else {
            elGoogle.innerHTML = '未綁定 <i class="ph ph-caret-right"></i>';
        }
    }
    if (elLoc) elLoc.textContent = a.location || '尚未設定';
}

function editUsername() {
    const a = me(); if (!a) return;
    const newName = prompt('請輸入新的冒險者名稱：', a.name || '');
    if (newName !== null && newName.trim() !== '') {
        a.name = newName.trim();
        saveGlobal();
        openAccountSettings();
        refreshHUD();
        showToast('名稱已更新為「' + a.name + '」！');
    }
}

function editAge() {
    const a = me(); if (!a) return;
    const newAge = prompt('請輸入年齡：', a.age || '');
    if (newAge !== null && newAge.trim() !== '') {
        const age = parseInt(newAge.trim());
        if (isNaN(age) || age < 1 || age > 150) {
            showToast('請輸入有效的年齡（1-150）');
            return;
        }
        a.age = age;
        saveGlobal();
        openAccountSettings();
        showToast('年齡已更新！');
    }
}

// ===== ACCOUNT SETTINGS LOGIC =====
function toggleGoogleBind() {
    const a = me(); if (!a) return;
    if (a.googleBound) {
        if (confirm('🔒 安全提醒：您確定要解除 Google 契約的連結嗎？這將增加冒險契約遺失的風險。')) {
            a.googleBound = false;
            GCalManager.accessToken = null; // Clear local token
            saveGlobal();
            refreshProfile();
            showToast('已安全解除 Google 契約連結。');
        }
    } else {
        // Real Google Auth Flow via GCalManager
        GCalManager.authenticate(() => {
            a.googleBound = true;
            saveGlobal();
            refreshProfile();
            showCelebration('🌐', '魔法通訊綁定成功', '您的委託將自動同步到 Google 行事曆！');
        });
    }
}

function changePasswordFlow() {
    const a = me(); if (!a) return;
    const oldPass = prompt('🔑 請輸入您的目前密碼：', '');
    if (oldPass === null) return;
    if (oldPass.trim() === '') {
        showToast('❌ 驗證失敗：密碼不正確。'); return;
    }
    const newPass = prompt('🆕 請輸入新的安全密碼：', '');
    if (newPass === null || newPass.trim() === '') return;
    const confirmPass = prompt('✅ 請再次輸入新密碼以確認：', '');
    if (newPass !== confirmPass) {
        showToast('⚠️ 警告：兩次輸入的新密碼不相符！');
        return;
    }
    // Store hashed password
    a.p_hash = simpleHash(newPass);
    saveGlobal();
    showCelebration('🔒', '密碼更新成功', '您的契約現在更安全了！');
}

function editLocation() {
    const a = me(); if (!a) return;
    const newLoc = prompt('請輸入您目前的所在地：', a.location || '台灣, 台北');
    if (newLoc !== null && newLoc.trim() !== '') {
        a.location = cleanLocation(newLoc);
        saveGlobal();
        refreshProfile();
        showToast('所在地已更新！');
    }
}

function refreshSubPage() {
    const a = me(); if (!a) return;
    if (a.subscription === 'pro') {
        document.getElementById('sub-title').textContent = '⭐ 傳奇領主 (PRO)';
        document.getElementById('sub-desc').textContent = '已覺醒所有特權，盡情享受冒險！';
        document.getElementById('sub-title-icon').textContent = '👑';
        document.getElementById('sub-action-btn').textContent = '✅ 已覺醒特權';
        document.getElementById('sub-action-btn').disabled = true;
        document.getElementById('sub-action-btn').style.opacity = '0.5';
    } else {
        document.getElementById('sub-title').textContent = '初級冒險者';
        document.getElementById('sub-desc').textContent = '目前階級：平民冒險家';
        document.getElementById('sub-title-icon').textContent = '🧭';
        document.getElementById('sub-action-btn').textContent = '👑 晉升傳奇領主';
        document.getElementById('sub-action-btn').disabled = false;
        document.getElementById('sub-action-btn').style.opacity = '1';
    }
}

// ===== TASK FEED =====
function renderTaskFeed() {
    const feed = document.getElementById('task-feed');
    const a = me();
    const g = getMyGuild();

    let headHtml = '';
    // Home Screen Guild Card Removed per requirement: "取消於委託看版上顯示"

    const tasks = globalData.tasks.filter(t => t.status === 'PUBLISHED').sort((a, b) => b.createdAt - a.createdAt);
    if (!tasks.length) {
        feed.innerHTML = headHtml + '<div class="text-center text-muted" style="padding:40px"><p>目前沒有可接取的委託！</p></div>';
        return;
    }
    feed.innerHTML = headHtml + tasks.map(t => taskCardHTML(t)).join('');
}

function taskCardHTML(t) {
    let dlStr = '';
    if (t.deadline) {
        const msLeft = new Date(t.deadline).getTime() - Date.now();
        const isUrgent = msLeft > 0 && msLeft < 86400000;
        dlStr = `<div class="reward-chip ${isUrgent ? 'urgent' : ''}"> <i class="ph-fill ph-timer"></i> ${formatDeadline(t.deadline)}${isUrgent ? ' (緊急!)' : ''}</div> `;
    }
    const locStr = t.location ? `<div class="reward-chip"> <i class="ph-fill ph-map-pin"></i> ${esc(t.location)}</div> ` : '';
    const checkCount = t.checklist ? t.checklist.length : 0;
    const checkStr = checkCount ? `<div class="reward-chip"> <i class="ph-bold ph-list-checks"></i> ${checkCount}步驟</div> ` : '';
    return `<div class="card task-card" onclick="openDetail('${t.id}')">
    <div class="flex justify-between items-center mb-2">
      <div class="task-type">${TYPE_LABELS[t.type] || t.type}</div>
      <span class="status-badge status-${t.status.toLowerCase()}">${statusLabel(t.status)}</span>
    </div>
    <h3>${esc(t.title)}</h3>
    <div class="task-desc">${esc(t.desc)}</div>
    <div class="task-meta-flex">
      ${locStr}${dlStr}${checkStr}
    </div>
    <div style="width:100%; height:1px; background:var(--border); margin: 12px 0;"></div>
    <div class="task-meta" style="margin-top:0">
      <span class="task-publisher"><i class="ph-fill ph-user-circle"></i> ${esc(t.creator)} 發布</span>
       <div style="display:flex; gap:8px;">
          <span style="font-weight:900; color:#F59E0B; font-family:monospace; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); padding:4px 10px; border-radius:12px; display:flex; align-items:center; gap:4px;"><i class="ph-bold ph-lightning" style="font-size:14px;"></i> ${XP_TABLE[t.difficulty] || 50} XP</span>
          <span style="font-weight:900; color:var(--primary); font-family:monospace; background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2); padding:4px 10px; border-radius:12px; display:flex; align-items:center; gap:4px;"><i class="ph-bold ph-coin" style="font-size:14px;"></i> ${Math.round((XP_TABLE[t.difficulty] || 50) * PTS_RATIO)}</span>
      </div>
    </div>
  </div>`;
}

function statusLabel(s) {
    return { PUBLISHED: '開放委託', CLAIMED: '冒險中', COMPLETED_PENDING_CONFIRM: '待確認', COMPLETED_CONFIRMED: '冒險達成' }[s] || s;
}

// ===== MY TASKS / PROGRESS =====
let _progressTab = 'active';

function switchProgressTab(tab) {
    _progressTab = tab;
    document.getElementById('ptab-active').classList.toggle('active', tab === 'active');
    document.getElementById('ptab-done').classList.toggle('active', tab === 'done');
    document.getElementById('mytasks-active').classList.toggle('hidden', tab !== 'active');
    document.getElementById('mytasks-done').classList.toggle('hidden', tab !== 'done');
}

function renderMyTasks() {
    const uid = myId();
    const a = me();
    const active = globalData.tasks.filter(t => t.claimedBy === uid && t.status !== 'COMPLETED_CONFIRMED');
    const done = globalData.tasks.filter(t => t.claimedBy === uid && t.status === 'COMPLETED_CONFIRMED');

    // --- Summary Card ---
    const summaryEl = document.getElementById('progress-summary');
    if (summaryEl && a) {
        const xpCur = xpForLevel(a.level);
        const xpNxt = xpForLevel(a.level + 1);
        const xpInLevel = a.totalXP - xpCur;
        const xpNeeded = xpNxt - xpCur;
        const pct = xpNeeded > 0 ? Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100) : 100;

        summaryEl.innerHTML = `
          <div class="progress-summary-card">
            <div class="progress-summary-stats">
              <div class="progress-stat">
                <div class="progress-stat-value">${a.level || 1}</div>
                <div class="progress-stat-label">等級</div>
              </div>
              <div class="progress-stat">
                <div class="progress-stat-value">${a.completedCount || 0}</div>
                <div class="progress-stat-label">已完成</div>
              </div>
              <div class="progress-stat">
                <div class="progress-stat-value">${a.streakCount || 0}<span style="font-size:16px;">🔥</span></div>
                <div class="progress-stat-label">連續天數</div>
              </div>
            </div>
            <div class="progress-xp-bar"><div class="progress-xp-fill" style="width:${pct}%"></div></div>
            <div class="progress-xp-text">
              <span>Lv.${a.level} → Lv.${a.level + 1}</span>
              <span>${xpInLevel} / ${xpNeeded} XP</span>
            </div>
          </div>`;
    }

    // --- Tab Counts ---
    const cActive = document.getElementById('ptab-active-count');
    const cDone = document.getElementById('ptab-done-count');
    if (cActive) cActive.textContent = active.length;
    if (cDone) cDone.textContent = done.length;

    // --- Active Tasks ---
    document.getElementById('mytasks-active').innerHTML = active.length
        ? active.map(t => taskCardHTML(t)).join('')
        : `<div class="progress-empty">
             <div class="progress-empty-icon">🗺️</div>
             <div class="progress-empty-title">尚無進行中的冒險</div>
             <div class="progress-empty-desc">前往任務大廳接取委託，展開你的冒險之旅吧！</div>
             <button class="progress-empty-btn" onclick="showScreen('screen-tasks')">
               <i class="ph-bold ph-compass"></i> 探索任務
             </button>
           </div>`;

    // --- Done Tasks ---
    document.getElementById('mytasks-done').innerHTML = done.length
        ? done.map(t => taskCardHTML(t)).join('')
        : `<div class="progress-empty">
             <div class="progress-empty-icon">🏆</div>
             <div class="progress-empty-title">還沒有完成的冒險</div>
             <div class="progress-empty-desc">完成第一個委託就能獲得經驗值和金幣，解鎖成就勳章！</div>
           </div>`;

    // Restore tab state
    switchProgressTab(_progressTab);
}

// ===== TASK DETAIL =====
function openDetail(taskId, returnTo) {
    detailReturnScreen = returnTo || currentScreen;
    const t = globalData.tasks.find(x => x.id === taskId);
    if (!t) return;
    window._activeTaskId = taskId;

    document.getElementById('det-type').innerHTML = TYPE_LABELS[t.type] || t.type;
    document.getElementById('det-title').textContent = t.title;
    document.getElementById('det-desc').textContent = t.desc;
    document.getElementById('det-creator').textContent = t.creator;
    document.getElementById('det-time').textContent = timeAgo(t.createdAt);
    document.getElementById('det-xp').textContent = XP_TABLE[t.difficulty] || 50;
    document.getElementById('det-pts').textContent = Math.round((XP_TABLE[t.difficulty] || 50) * PTS_RATIO);

    const badge = document.getElementById('det-badge');
    badge.className = 'status-badge status-' + t.status.toLowerCase();
    badge.textContent = statusLabel(t.status);

    // Extra meta (time, location)
    let metaHTML = '';
    if (t.deadline) metaHTML += `<div class="reward-chip mb-2"><i class="ph ph-timer" style="color:var(--orange)"></i> 截止：${formatDeadline(t.deadline)}</div>`;
    if (t.location) metaHTML += `<div class="reward-chip mb-2"><i class="ph-fill ph-map-pin" style="color:var(--secondary)"></i> ${esc(t.location)}</div>`;
    document.getElementById('det-meta-extra').innerHTML = metaHTML ? `<div class="flex gap-2 flex-wrap">${metaHTML}</div>` : '';

    // Checklist
    const checkEl = document.getElementById('det-checklist');
    if (t.checklist && t.checklist.length) {
        const isClaimer = t.claimedBy === myId();
        checkEl.innerHTML = `<h3 class="mb-2" style="font-size:14px;font-weight:900">📝 委託內容</h3>` +
            t.checklist.map((item, i) => `
            <div class="flex items-center gap-2 mb-2" style="padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;cursor:${isClaimer ? 'pointer' : 'default'}"
          ${isClaimer ? `onclick="toggleCheckItem('${t.id}',${i})"` : ''}>
          <span style="font-size:18px">${item.done ? '✅' : '⬜'}</span>
          <span style="font-size:13px;font-weight:700;${item.done ? 'text-decoration:line-through;color:var(--text3)' : ''}">${esc(item.text)}</span>
        </div>
        `).join('');
    } else { checkEl.innerHTML = ''; }

    // Actions
    const acts = document.getElementById('detail-actions');
    const echoSec = document.getElementById('echo-section');
    const recSec = document.getElementById('record-section');
    echoSec.style.display = 'none'; recSec.style.display = 'none';

    const uid = myId();
    const isMine = t.creatorId === uid;
    let html = '';

    if (t.status === 'PUBLISHED')
        html = `<button class="btn btn-primary btn-block" onclick="claimTask('${t.id}')"><i class="ph-bold ph-hand-grabbing"></i> 承接此項委託！</button>`;
    else if (t.status === 'CLAIMED' && t.claimedBy === uid)
        html = `<button class="btn btn-magic btn-block" onclick="submitComplete('${t.id}')"><i class="ph-bold ph-check-circle"></i> 委託達成！提交驗收</button>`;
    else if (t.status === 'CLAIMED' && isMine)
        html = `<p class="text-center text-muted text-sm">冒險者正在執行委託…</p>`;
    else if (t.status === 'COMPLETED_PENDING_CONFIRM' && isMine) {
        const hasEcho = globalData.echoes[t.id];
        if (hasEcho) {
            echoSec.style.display = 'block';
            renderEchoPlayer(t.id);
            recSec.style.display = 'none'; // Keep recorder hidden if we already have an echo to play
        } else {
            recSec.style.display = 'none';
        }
        html = `<div class="flex gap-2"><button class="btn btn-green" style="flex:1" onclick="confirmComplete('${t.id}')"><i class="ph-bold ph-seal-check"></i> ✅ 通過！</button><button class="btn btn-secondary" style="flex:1;border-color:var(--red);color:var(--red)" onclick="rejectComplete('${t.id}')"><i class="ph-bold ph-x-circle"></i> ❌ 退回委託</button></div>`;
    } else if (t.status === 'COMPLETED_PENDING_CONFIRM' && !isMine)
        html = `<p class="text-center text-muted text-sm">已提交，等待 ${esc(t.creator)} 確認…</p>`;
    else if (t.status === 'COMPLETED_CONFIRMED') {
        html = `<p class="text-center font-bold" style="color:var(--green);margin-bottom:12px;"><i class="ph-fill ph-check-circle"></i> 冒險完成！已領取獎勵</p>`;
        if (globalData.echoes[t.id]) {
            echoSec.style.display = 'block';
            renderEchoPlayer(t.id);
        }
        recSec.style.display = 'none';
    }
    acts.innerHTML = html;
    showScreen('screen-detail');
}

function goBackFromDetail() { showScreen(detailReturnScreen); }

function toggleCheckItem(taskId, index) {
    const t = globalData.tasks.find(x => x.id === taskId);
    if (!t || !t.checklist || t.claimedBy !== myId()) return;
    const wasChecked = t.checklist[index].done;
    t.checklist[index].done = !t.checklist[index].done;
    saveGlobal();
    // V1.05: Daily Quests — checklist check event (only on check, not uncheck)
    if (!wasChecked && t.checklist[index].done && typeof EchoDailyQuests !== 'undefined') {
        EchoDailyQuests.notifyEvent('checklist_check', 1);
    }
    openDetail(taskId);
}

// ===== TASK CREATE (Enhanced) =====
let createChecklist = [];

function resetCreateForm() {
    createChecklist = [];
    renderCreateChecklist();
    document.getElementById('c-title').value = '';
    document.getElementById('c-desc').value = '';
    document.getElementById('c-deadline').value = '';
    document.getElementById('c-location').value = '';
}

function renderCreateChecklist() {
    const el = document.getElementById('checklist-items');
    el.innerHTML = createChecklist.map((item, i) => `
        <div class="flex items-center gap-2 mb-2" style="padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <span style="font-size:13px;font-weight:700;flex:1">${i + 1}. ${esc(item)}</span>
      <button class="icon-btn" style="width:28px;height:28px;font-size:14px;color:var(--red)" onclick="removeChecklistItem(${i})"><i class="ph-bold ph-x"></i></button>
    </div>
        `).join('');
}

function addChecklistItem() {
    const input = document.getElementById('checklist-input');
    const val = input.value.trim();
    if (!val) return;
    createChecklist.push(val);
    input.value = '';
    renderCreateChecklist();
}

function removeChecklistItem(i) {
    createChecklist.splice(i, 1);
    renderCreateChecklist();
}

function aiGenerateTask() {
    const type = document.getElementById('c-type').value;
    const templates = AI_TEMPLATES[type] || AI_TEMPLATES.CHORE;
    const tpl = templates[Math.floor(Math.random() * templates.length)];

    document.getElementById('c-title').value = tpl.title;
    document.getElementById('c-desc').value = tpl.desc;
    if (tpl.location) document.getElementById('c-location').value = tpl.location;
    createChecklist = [...tpl.checklist];
    renderCreateChecklist();
    showToast('✨ AI 已為你生成委託內容！');
}

function publishTask() {
    const title = document.getElementById('c-title').value.trim();
    const desc = document.getElementById('c-desc').value.trim();
    const type = document.getElementById('c-type').value;
    const diff = document.getElementById('c-diff').value;
    const deadline = document.getElementById('c-deadline').value || null;
    const location = document.getElementById('c-location').value.trim() || null;
    if (!title) { showToast('請輸入委託名稱！'); return; }
    if (!desc) { showToast('請輸入委託說明！'); return; }

    const a = me();
    if (a.subscription === 'free' && a.tasksPublished >= FREE_TASK_LIMIT) {
        document.getElementById('paywall-modal').classList.add('show');
        return;
    }

    const taskId = gid();
    const newTask = {
        id: taskId, title, desc, type, difficulty: diff,
        creator: a.name, creatorId: myId(),
        status: 'PUBLISHED', claimedBy: null, createdAt: Date.now(),
        deadline, location,
        checklist: createChecklist.map(text => ({ text, done: false })),
    };
    globalData.tasks.unshift(newTask);

    // Auto-sync to Google Calendar if bound
    if (a.googleBound && GCalManager.accessToken) {
        GCalManager.syncTask(newTask).then(success => {
            if (success) showToast('📅 已同步至 Google 行事曆！');
        });
    }

    // Handle optional voice reward
    if (creationRecordedBlob) {
        const reader = new FileReader();
        const duration = creationRecordSec;
        reader.onloadend = () => {
            globalData.echoes[taskId] = { audio: reader.result, duration: duration, preRecorded: true };
            saveGlobal();
        };
        reader.readAsDataURL(creationRecordedBlob);

        // UI Reset for recording (since we are leaving the screen)
        clearTaskCreationRecording();
    }

    a.tasksPublished++;
    saveGlobal();
    showToast('🎉 委託已發布！');
    checkAchievements();
    // V1.05: Daily Quests — task publish event
    if (typeof EchoDailyQuests !== 'undefined') EchoDailyQuests.notifyEvent('task_publish', 1);
    showScreen('screen-home');
}

// ===== TASK LIFECYCLE =====
function claimTask(id) {
    const t = globalData.tasks.find(x => x.id === id);
    if (!t || t.status !== 'PUBLISHED') return;

    // Guild Check
    const isMine = t.creatorId === myId();
    if (!isMine && !requireGuild('接取任務')) return;
    t.status = 'CLAIMED'; t.claimedBy = myId(); t.claimedAt = Date.now();
    saveGlobal();
    showToast('💪 委託已接取！加油！');
    // V1.05: Daily Quests — task claim event
    if (typeof EchoDailyQuests !== 'undefined') EchoDailyQuests.notifyEvent('task_claim', 1);
    openDetail(id);
}

function submitComplete(id) {
    const t = globalData.tasks.find(x => x.id === id);
    if (!t || t.status !== 'CLAIMED') return;
    t.status = 'COMPLETED_PENDING_CONFIRM'; t.completedAt = Date.now();
    saveGlobal();
    showToast('📤 已提交！等待確認！');
    openDetail(id);
}

function confirmComplete(id) {
    const t = globalData.tasks.find(x => x.id === id);
    if (!t || t.status !== 'COMPLETED_PENDING_CONFIRM') return;
    t.status = 'COMPLETED_CONFIRMED'; t.confirmedAt = Date.now();

    // Award XP+Points to the claimer
    const claimerAcc = globalData.accounts[t.claimedBy];
    if (claimerAcc) {
        let xpG = XP_TABLE[t.difficulty] || 50;
        // V1.05: XP Boost check
        if (claimerAcc.xpBoostUntil && Date.now() < claimerAcc.xpBoostUntil) {
            xpG *= 2;
        }
        const ptsG = Math.round(xpG * PTS_RATIO);
        claimerAcc.totalXP += xpG;
        claimerAcc.points += ptsG;
        claimerAcc.completedCount++;
        const oldLvl = claimerAcc.level;
        claimerAcc.level = calcLevel(claimerAcc.totalXP);
        if (claimerAcc.level > oldLvl) {
            const pStats = getPlayerStats(claimerAcc);
            claimerAcc.currentHp = 100 + claimerAcc.level * 10 + (pStats.def * 2); // Level up heals to full
            if (t.claimedBy === myId()) {
                showCelebration('🎊', `升級！→ Lv.${claimerAcc.level} `, `血量全滿！ +${xpG} XP + ${ptsG} 金幣`);
            }
        }
    }

    // V1.05: Update Streak on task completion
    if (typeof EchoStreak !== 'undefined' && claimerAcc) {
        const streakResult = EchoStreak.onTaskCompleted(claimerAcc);
        if (streakResult && streakResult.isNew) {
            // Check milestone
            const milestone = EchoStreak.checkMilestone(streakResult.streakCount);
            if (milestone) {
                claimerAcc.points += milestone.reward;
                claimerAcc.totalXP += milestone.xp;
                claimerAcc.level = calcLevel(claimerAcc.totalXP);
                setTimeout(() => {
                    showCelebration(milestone.icon, `🔥 連續冒險 ${milestone.days} 天！`, `${milestone.title} — +${milestone.reward} 金幣 +${milestone.xp} XP`);
                    SoundManager.play('levelUp');
                }, 2800);
            }
            if (streakResult.usedFreeze) {
                setTimeout(() => showToast('🛡️ 護盾藥水自動啟用！Streak 保住了！'), 1500);
            }
        }
    }

    // V1.05: Update Daily Quests progress
    if (typeof EchoDailyQuests !== 'undefined') {
        EchoDailyQuests.notifyEvent('task_complete', 1);
        const earnedXP = claimerAcc ? (XP_TABLE[t.difficulty] || 50) * ((claimerAcc.xpBoostUntil && Date.now() < claimerAcc.xpBoostUntil) ? 2 : 1) : (XP_TABLE[t.difficulty] || 50);
        EchoDailyQuests.notifyEvent('xp_earn', earnedXP);
    }

    saveGlobal(); checkAchievements();
    const xpDisplay = claimerAcc ? (XP_TABLE[t.difficulty] || 50) * ((claimerAcc.xpBoostUntil && Date.now() < claimerAcc.xpBoostUntil) ? 2 : 1) : (XP_TABLE[t.difficulty] || 50);
    const ptsDisplay = Math.round(xpDisplay * PTS_RATIO);
    showCelebration('🎉', '委託確認通過！', `獎勵 + ${xpDisplay} XP + ${ptsDisplay}金幣 已發送`);
    setTimeout(() => openDetail(id), 2600);
}


function rejectComplete(id) {
    const t = globalData.tasks.find(x => x.id === id);
    if (!t || t.status !== 'COMPLETED_PENDING_CONFIRM') return;
    t.status = 'CLAIMED'; // Send back to in-progress
    // Reset checklist
    if (t.checklist) t.checklist.forEach(c => c.done = false);
    saveGlobal();
    showToast('📋 已退回，請重新執行委託！');
    openDetail(id);
}

// ===== GAMIFICATION =====
function xpForLevel(l) { return Math.floor(50 * l * (l - 1) / 2); }
function calcLevel(xp) { return Math.min(Math.floor((Math.sqrt(1 + 8 * xp / 50) - 1) / 2) + 1, LEVEL_CAP); }

// ===== ACHIEVEMENTS =====
function checkAchievements() {
    const a = me(); if (!a) return;
    // Bind state obj for checks
    const s = { ...a, tasks: globalData.tasks, echoes: globalData.echoes };
    for (const ach of ACHIEVEMENTS) {
        if (!a.achievements.includes(ach.id) && ach.check(s)) {
            a.achievements.push(ach.id);
            saveGlobal();
            setTimeout(() => showToast(`🏆 成就解鎖：${ach.name}！`), 300);
        }
    }
}

function renderAchievements() {
    const a = me(); if (!a) return;

    let obtainedHtml = '';
    let lockedHtml = '';

    ACHIEVEMENTS.forEach(ach => {
        const unlocked = a.achievements.includes(ach.id);
        const itemHtml = `<div class="ach-item ${unlocked ? '' : 'locked'}" title="${ach.desc}"><span class="ach-icon">${ach.icon}</span><div class="ach-name">${ach.name}</div></div> `;
        if (unlocked) {
            obtainedHtml += itemHtml;
        } else {
            lockedHtml += itemHtml;
        }
    });

    const finalHtml = `
        <div class="ach-section" style="margin-bottom: 16px;">
            <div class="ach-section-header" onclick="toggleAchievementSection('ach-list-obtained', 'icon-obtained')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:8px 16px; background:var(--surface); border-radius:12px; margin-bottom:8px;">
                <div style="font-size:14px; font-weight:900; color:var(--text);"><i class="ph-fill ph-medal"></i> 已獲得徽章 (${a.achievements.length})</div>
                <i class="ph-bold ph-caret-down" id="icon-obtained" style="transition:transform 0.2s;"></i>
            </div>
            <div id="ach-list-obtained" style="display:block;">
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; padding:0 16px;">
                    ${obtainedHtml || '<div style="grid-column:1/-1; color:var(--text3); font-size:13px; text-align:center; padding:12px;">尚未獲得徽章</div>'}
                </div>
            </div>
        </div>

        <div class="ach-section">
            <div class="ach-section-header" onclick="toggleAchievementSection('ach-list-locked', 'icon-locked')" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding:8px 16px; background:var(--surface); border-radius:12px; margin-bottom:8px;">
                <div style="font-size:14px; font-weight:900; color:var(--text);"><i class="ph-fill ph-trophy"></i> 風雲榜 (未解鎖)</div>
                <i class="ph-bold ph-caret-right" id="icon-locked" style="transition:transform 0.2s; transform:rotate(-90deg);"></i>
            </div>
            <div id="ach-list-locked" style="display:none;">
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; padding:0 16px;">
                    ${lockedHtml || '<div style="grid-column:1/-1; color:var(--green); font-size:13px; text-align:center; padding:12px; font-weight:800;">🎊 太神啦！所有成就皆已解鎖！</div>'}
                </div>
            </div>
        </div>
    `;
    document.getElementById('ach-grid').innerHTML = finalHtml;
    document.getElementById('ach-grid').style.display = 'block';
}

function toggleAchievementSection(contentId, iconId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(iconId);
    if (!content || !icon) return;

    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(-90deg)';
    }
}

function renderClassPath() {
    const a = me(); if (!a) return;
    const presetId = (a && a.charPreset) ? a.charPreset : 'mage';
    const preset = CHAR_PRESETS.find(c => c.id === presetId);
    const charName = preset ? preset.name : '冒險者';
    document.getElementById('class-path').innerHTML = CLASS_PATH.map((tier, i) => {
        const reached = a.level >= tier.lvl;
        const tierTitle = tier.tier === 1 ? `${charName}見習` : `${tier.suffix}${charName}`;
        return `<div class="card flex items-center gap-2" style="${reached ? 'border-color:' + tier.color : 'opacity:.4'}">
      <span style="font-size:36px;filter:${reached ? 'none' : 'grayscale(1)'}">${reached ? '🏆' : '🔒'}</span>
      <div>
        <div style="font-weight:900;color:${reached ? tier.color : 'var(--text3)'}">${tierTitle}</div>
        <div class="text-xs text-muted">Lv.${tier.lvl} ${i === 0 ? '起始' : '進化'}</div>
      </div>
      <span style="margin-left:auto;font-size:18px">${reached ? '✅' : '🔒'}</span>
    </div> `;
    }).join('');
}

// ===== REWARDS =====
function renderRewards() {
    const a = me(); if (!a) return;
    const heroBal = document.getElementById('shop-bal-hero');
    if (heroBal) heroBal.textContent = a.points;

    // Separate featured reward (highest cost or specific item)
    const sortedRewards = [...globalData.rewards].sort((a, b) => b.cost - a.cost);
    const featured = sortedRewards[0]; // Highest cost is featured
    const regular = sortedRewards.slice(1);

    // Render Unclaimed Echo Boxes - Logic Removed as per user request
    let echoBoxesHtml = '';

    // Render Featured
    if (featured) {
        const canAffordF = a.points >= featured.cost;
        const htmlF = echoBoxesHtml + `
        <div class="card" style="padding: 20px; display:flex; flex-direction:row; align-items:center; border: 1px solid ${canAffordF && featured.stock > 0 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(0,0,0,0.06)'}; background: #ffffff; box-shadow: ${canAffordF && featured.stock > 0 ? '0 8px 24px rgba(99, 102, 241, 0.15)' : '0 4px 12px rgba(0,0,0,0.05)'}; position:relative; overflow:hidden;">
            <!--Stock Badge-->
            <div style="position:absolute; top:12px; right:12px; background:${featured.stock > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color:${featured.stock > 0 ? '#10b981' : '#ef4444'}; font-size:11px; font-weight:900; padding:4px 10px; border-radius:10px; border:1px solid ${featured.stock > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};">
                庫存: ${featured.stock}
            </div>
            <div style="font-size:72px; filter:drop-shadow(0 4px 12px rgba(99, 102, 241, 0.2)); transform: scale(1.1); margin-right: 16px; animation: charFloat 3s ease-in-out infinite;">${featured.icon}</div>
            <div style="flex:1;">
                <div style="font-size:11px; font-weight:900; color:var(--primary); margin-bottom:4px; text-transform:uppercase; letter-spacing:1px;">終極大獎</div>
                <h3 style="font-size:18px;font-weight:900;margin-bottom:6px;">${esc(featured.title)}</h3>
                <p class="text-xs text-muted" style="margin-bottom:12px; line-height:1.4;">${esc(featured.desc)}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:900; color:var(--primary); font-size:18px; font-family:monospace; background:rgba(99, 102, 241, 0.08); padding:4px 12px; border-radius:20px; display:flex; align-items:center; gap:4px;"><i class="ph-bold ph-coin"></i> ${featured.cost}</div>
                    <button class="btn ${canAffordF && featured.stock > 0 ? 'btn-magic' : 'btn-secondary'}" style="padding:6px 16px; font-size:14px; border-radius:12px; font-weight:800;" onclick="redeemReward('${featured.sku}')" ${(!canAffordF || featured.stock <= 0) ? 'disabled style="opacity:.5"' : ''}>${featured.stock <= 0 ? '已售罄' : canAffordF ? '兌換！' : '金幣不足'}</button>
                </div>
            </div>
        </div>`;
        document.getElementById('rewards-featured').innerHTML = htmlF;
    }

    // Render Regular List (2-Column Equal Size Layout)
    document.getElementById('rewards-list').innerHTML = `<div style="display:grid; grid-template-columns:repeat(2, 1fr); grid-auto-rows:1fr; gap:16px; width:100%;">` + regular.map(r => {
        const canAfford = a.points >= r.cost && r.stock > 0;
        const outOfStock = r.stock <= 0;
        return `
        <div class="card" style="margin:0 !important; padding:16px; display:flex; flex-direction:column; justify-content:space-between; background:#ffffff; border:1px solid ${canAfford ? 'var(--border)' : 'rgba(0,0,0,0.06)'}; border-radius:20px; ${(!canAfford || outOfStock) ? 'opacity:0.6; filter:grayscale(0.5);' : 'box-shadow:0 8px 24px rgba(0,0,0,0.04); cursor:pointer;'}" ${canAfford ? `onclick="redeemReward('${r.sku}')"` : ''}>

        <!--Stock count-->
        <div style="font-size:10px; font-weight:900; color:${outOfStock ? 'var(--red)' : 'var(--text3)'}; text-align:right; margin-bottom:4px;">
            ${outOfStock ? '已售罄' : `庫存: ${r.stock}`}
        </div>

        <!--Top content: icon + text-->
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px;">
            <div style="width:56px; height:56px; border-radius:50%; background:${canAfford ? 'radial-gradient(circle at top left, rgba(99,102,241,0.15), rgba(99,102,241,0.05))' : 'rgba(0,0,0,0.04)'}; display:flex; justify-content:center; align-items:center; border:1px solid ${canAfford ? 'rgba(99,102,241,0.1)' : 'transparent'};">
                <span style="font-size:32px; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1));">${r.icon}</span>
            </div>
            <h3 style="font-size:14px; font-weight:900; color:var(--text); line-height:1.3; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0; height:18px;">${esc(r.title)}</h3>
            <p style="font-size:12px; color:var(--text2); line-height:1.4; margin:0; height:34px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${esc(r.desc)}</p>
        </div>

        <!--Footer-->
        <div style="padding-top:12px; border-top:1px dashed rgba(0,0,0,0.08); display:flex; justify-content:space-between; align-items:center; width:100%; margin-top:12px;">
            <div style="font-weight:900; color:${canAfford ? 'var(--primary)' : 'var(--text3)'}; font-size:15px; font-family:monospace; display:flex; align-items:center; gap:4px;">
                <i class="ph-bold ph-coin" style="font-size:16px;"></i> ${r.cost}
            </div>
            <button class="btn" style="padding:4px 12px; font-size:13px; font-weight:800; border-radius:10px; border:none; background:${canAfford ? 'var(--primary)' : 'var(--surface)'}; color:${canAfford ? '#fff' : 'var(--text3)'}; pointer-events:none;">
                ${outOfStock ? '售罄' : canAfford ? '兌換' : '<i class="ph-bold ph-lock"></i>'}
            </button>
        </div>
    </div>
        `;
    }).join('') + `</div>`;
}

let pendingPurchaseSku = null;

function redeemReward(sku) {
    const a = me(); if (!a) return;
    if (!requireGuild('兌換獎勵')) return;
    const r = globalData.rewards.find(x => x.sku === sku);
    if (!r || a.points < r.cost) { showToast('金幣不足！'); return; }

    pendingPurchaseSku = sku;
    // Strip HTML from title/icon for clean display if needed, but innerHTML supports emojis
    document.getElementById('pur-icon').innerHTML = r.icon;
    document.getElementById('pur-title').innerHTML = `兌換「${r.title}」？`;
    document.getElementById('pur-desc').innerHTML = r.desc;
    document.getElementById('pur-cost').innerHTML = r.cost;

    document.getElementById('purchase-modal').style.display = 'flex';
}

function closePurchaseModal() {
    document.getElementById('purchase-modal').style.display = 'none';
    pendingPurchaseSku = null;
}

function confirmPurchase() {
    if (!pendingPurchaseSku) return;
    const sku = pendingPurchaseSku;
    closePurchaseModal();

    const a = me(); if (!a) return;
    const r = globalData.rewards.find(x => x.sku === sku);
    if (!r) return;
    if (a.points < r.cost) { showToast('金幣不足！'); return; }
    if (r.stock <= 0) { showToast('該商品已售罄！'); return; }

    // Deduct stock
    r.stock--;

    // V1.05: Streak Freeze
    if (r.type === 'STREAK_FREEZE') {
        if (typeof EchoStreak !== 'undefined') {
            const result = EchoStreak.buyStreakFreeze(a);
            if (!result.success) {
                r.stock++; // Restore stock
                if (result.reason === 'max_reached') showToast('🛡️ 護盾藥水最多持有 3 個！');
                else showToast('金幣不足！');
                return;
            }
        } else {
            a.points -= r.cost;
            a.streakFreezeCount = (a.streakFreezeCount || 0) + 1;
        }
        SoundManager.play('skill');
        showCelebration('🛡️', '護盾藥水入手！', `連續冒險保護器 × ${a.streakFreezeCount || 1}`);
        saveGlobal(); renderRewards();
        if (typeof EchoDailyQuests !== 'undefined') EchoDailyQuests.notifyEvent('reward_redeem', 1);
        return;
    }
    // V1.05: XP Boost
    if (r.type === 'XP_BOOST') {
        a.points -= r.cost;
        a.xpBoostUntil = Date.now() + (60 * 60 * 1000); // 1 hour
        SoundManager.play('skill');
        showCelebration('⚡', '雙倍 XP 啟動！', '接下來 1 小時所有任務 XP 加倍！');
        saveGlobal(); renderRewards();
        if (typeof EchoDailyQuests !== 'undefined') EchoDailyQuests.notifyEvent('reward_redeem', 1);
        return;
    }
    // Potions go into inventory instead of immediate use
    if (r.type === 'POTION' || sku === 'R0') {
        a.points -= r.cost;
        a.potions = (a.potions || 0) + 1;
        SoundManager.play('heal');
        showCelebration('<i class="ph-bold ph-flask"></i>', '獲得治療藥水！', '藥水已放入背包，可在戰鬥中使用！');
    }
    // Equipment goes into inventory
    else if (r.type === 'EQUIP') {
        const hasEquip = (a.equipment || []).find(x => x.sku === sku);
        if (hasEquip) {
            r.stock++; // Restore stock if already owned
            showToast('你已經擁有這個裝備了！'); return;
        }

        a.points -= r.cost;
        if (!a.equipment) a.equipment = [];
        a.equipment.push({ sku: r.sku, name: r.title, emoji: r.icon, atk: r.atk, def: r.def });
        saveGlobal();
        SoundManager.play('win');
        showCelebration(r.icon, '裝備獲得！', `成功裝備 ${r.title}！`);
        setTimeout(() => renderRewards(), 2600);
        return;
    } else {
        a.points -= r.cost;
        a.redemptions.push({ sku, at: Date.now() });
    }

    // V1.05: Daily Quests — reward redeem event
    if (typeof EchoDailyQuests !== 'undefined') EchoDailyQuests.notifyEvent('reward_redeem', 1);
    saveGlobal(); checkAchievements();
    showCelebration(r.icon, '兌換成功！', r.title);
    setTimeout(() => renderRewards(), 2600);
}

function toggleCustomReward() {
    const panel = document.getElementById('custom-reward-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function createCustomReward() {
    const title = document.getElementById('rw-title').value.trim();
    const desc = document.getElementById('rw-desc').value.trim();
    const icon = document.getElementById('rw-icon').value.trim() || '🎁';
    const cost = parseInt(document.getElementById('rw-cost').value) || 0;
    if (!title) { showToast('請輸入獎勵名稱'); return; }
    if (cost < 1) { showToast('金幣至少為 1'); return; }
    globalData.rewards.push({ sku: 'C' + Date.now(), title: icon + ' ' + title, desc, icon, cost, stock: 99, custom: true });
    saveGlobal();
    document.getElementById('rw-title').value = ''; document.getElementById('rw-desc').value = '';
    document.getElementById('rw-icon').value = ''; document.getElementById('rw-cost').value = '';

    showToast('🎁 自訂獎勵已新增！');
    showScreen('screen-rewards');
}

// ===== SUBSCRIPTION & REDEEM =====
function processRedeemCode() {
    const code = document.getElementById('redeem-code-input').value.trim().toUpperCase();
    if (!code) { showToast('請輸入兌換碼'); return; }

    const a = me();
    if (!a) return;

    if (code === 'WELCOME100') {
        a.points += 100;
        showCelebration('🪙', '兌換成功！', '獲得 100 金幣');
    } else if (code === 'LEVELUP') {
        a.totalXP += 500;
        a.level = calcLevel(a.totalXP);
        showCelebration('🌟', '兌換成功！', '獲得 500 經驗值');
    } else if (code === 'CLEARALL') {
        let count = 0;
        globalData.tasks.forEach(t => {
            if ((t.claimedBy === a.id || t.creatorId === a.id) && t.status !== 'COMPLETED_CONFIRMED') {
                t.status = 'COMPLETED_CONFIRMED';
                count++;
            }
        });
        if (count > 0) {
            a.completedCount += count;
            showCelebration('✅', '兌換成功！', `強制達成 ${count} 個委託`);
        } else {
            showToast('目前沒有可執行的委託');
            return;
        }
    } else {
        showToast('無效的兌換碼或已過期');
        return;
    }

    saveGlobal();
    refreshHUD();
    refreshProfile();
    document.getElementById('redeem-code-input').value = '';
}

function activateSubscription() {
    // 使用新的 Payment 模組
    if (typeof EchoPayment !== 'undefined') {
        EchoPayment.startCheckout('pro_monthly');
    } else {
        // Fallback: 原始 POC 模式
        const a = me(); if (!a) return;
        a.subscription = 'pro'; a.points += 200;
        saveGlobal(); closePaywall();
        showCelebration('👑', '歡迎加入 Pro！', '獲得 200 回聲金幣禮包');
        setTimeout(() => refreshAll(), 2600);
    }
}
function closePaywall() { document.getElementById('paywall-modal').classList.remove('active'); }
function openPaywall() { document.getElementById('paywall-modal').classList.add('active'); }

// ===== AUDIO ECHO =====
let mediaRec = null, audioChunks = [], currentRecordedBlob = null, recordSec = 0, recInt = null, isRec = false;
let creationRecordedBlob = null, creationRecordSec = 0; // Separate state for task creation

async function toggleRecording(isCreation = false) { isRec ? stopRec(isCreation) : await startRec(isCreation); }
async function startRec(isCreation = false) {
    const limit = isCreation ? 10 : 60;
    const prefix = isCreation ? 'create-' : '';
    const statusEl = document.getElementById(prefix + 'rec-status');
    const hintEl = document.getElementById(prefix + 'rec-hint');
    const timerEl = document.getElementById(prefix + 'rec-timer');
    const btnEl = document.getElementById(prefix + 'record-btn');
    const iconEl = document.getElementById(prefix + 'rec-icon');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRec = new MediaRecorder(stream); audioChunks = []; recordSec = 0;
        mediaRec.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRec.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            if (isCreation) {
                creationRecordedBlob = blob;
                creationRecordSec = recordSec;
                document.getElementById('create-rec-preview').style.display = 'block';
            } else {
                currentRecordedBlob = blob;
                const recPrev = document.getElementById('rec-preview');
                if (recPrev) recPrev.style.display = 'block';
            }
            stream.getTracks().forEach(t => t.stop());
            if (statusEl) statusEl.textContent = `✅ 錄音完成(${recordSec}秒)`;
        };
        mediaRec.start(); isRec = true;
        if (btnEl) btnEl.classList.add('recording');
        if (iconEl) iconEl.className = 'ph-fill ph-stop';
        if (statusEl) statusEl.textContent = '錄音中…點擊停止';
        recInt = setInterval(() => {
            recordSec++;
            if (timerEl) timerEl.textContent = String(Math.floor(recordSec / 60)).padStart(2, '0') + ':' + String(recordSec % 60).padStart(2, '0');
            if (recordSec >= limit) stopRec(isCreation);
        }, 1000);
    } catch (e) { showToast('無法存取麥克風'); console.error(e); }
}

function stopRec(isCreation = false) {
    if (mediaRec && mediaRec.state !== 'inactive') mediaRec.stop();
    isRec = false; clearInterval(recInt);
    const prefix = isCreation ? 'create-' : '';
    const btnEl = document.getElementById(prefix + 'record-btn');
    const iconEl = document.getElementById(prefix + 'rec-icon');
    if (btnEl) btnEl.classList.remove('recording');
    if (iconEl) iconEl.className = 'ph-fill ph-microphone';
}

// Dedicated helpers for task creation
async function toggleTaskCreationRecording() { await toggleRecording(true); }

function playRecordingPreview(isCreation = true) {
    const blob = isCreation ? creationRecordedBlob : currentRecordedBlob;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play().catch(e => console.error(e));
}

function clearRecording(isCreation = true) {
    if (isCreation) {
        creationRecordedBlob = null;
        creationRecordSec = 0;
        document.getElementById('create-rec-preview').style.display = 'none';
        document.getElementById('create-rec-timer').textContent = '00:00';
        document.getElementById('create-rec-status').textContent = '準備好後點擊錄音';
    } else {
        currentRecordedBlob = null;
        document.getElementById('rec-preview').style.display = 'none';
        document.getElementById('rec-timer').textContent = '00:00';
        document.getElementById('rec-status').textContent = '準備好後點擊錄音';
    }
}

function playTaskCreationPreview() { playRecordingPreview(true); }
function clearTaskCreationRecording() { clearRecording(true); }

function renderEchoPlayer(taskId) {
    const echo = globalData.echoes[taskId]; if (!echo) return;
    const bars = Array.from({ length: 12 }, () => '<div class="bar"></div>').join('');
    document.getElementById('echo-container').innerHTML = `<div class="echo-player"><button class="echo-play-btn" onclick="playEcho('${taskId}')"><i class="ph-fill ph-play" id="epi-${taskId}"></i></button><div><div class="echo-wave paused" id="ew-${taskId}">${bars}</div><div class="text-xs text-muted mt-2">${echo.duration || 0}秒 · 回聲鼓勵</div></div></div>`;
}
let curAudio = null;
function playEcho(tid) {
    const echo = globalData.echoes[tid]; if (!echo || !echo.audio) { showToast('回聲未載入'); return; }
    if (curAudio) { curAudio.pause(); curAudio = null; document.querySelectorAll('.echo-wave').forEach(w => w.classList.add('paused')); return; }
    curAudio = new Audio(echo.audio); document.getElementById('ew-' + tid).classList.remove('paused'); document.getElementById('epi-' + tid).className = 'ph-fill ph-pause';
    curAudio.play().catch(e => console.error(e));
    curAudio.onended = () => { document.getElementById('ew-' + tid).classList.add('paused'); document.getElementById('epi-' + tid).className = 'ph-fill ph-play'; curAudio = null; };
}


// playEchoReward removed - feature deleted


// ===== UI HELPERS =====
let toastTmr;
function showToast(msg) { const el = document.getElementById('toast'); if (!el) return; document.getElementById('toast-msg').textContent = msg; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(toastTmr); toastTmr = setTimeout(() => { el.classList.remove('show'); }, 2200); }
let celTmr;
function showCelebration(icon, title, sub) { document.getElementById('cel-icon').textContent = icon; document.getElementById('cel-title').textContent = title; document.getElementById('cel-sub').textContent = sub; const cel = document.getElementById('celebration'); cel.classList.add('show'); spawnConfetti(); clearTimeout(celTmr); celTmr = setTimeout(() => cel.classList.remove('show'), 2500); }
function spawnConfetti() {
    const cel = document.getElementById('celebration'); const co = ['#FFD700', '#FF6B00', '#7C5CFC', '#39FF14', '#FF3860', '#00E5FF', '#FF6EB4', '#B0A0D0']; for (let i = 0; i < 50; i++) { const p = document.createElement('div'); p.style.cssText = `position: absolute; width:${3 + Math.random() * 7}px; height:${3 + Math.random() * 7}px; background:${co[i % co.length]}; border-radius:${Math.random() > .5 ? '50%' : '2px'}; left:${Math.random() * 100}%; top:${-5 + Math.random() * 25}%; animation:cFall ${1.2 + Math.random() * 2}s ease-out forwards; opacity: .9; pointer-events: none;`; cel.appendChild(p); setTimeout(() => p.remove(), 4000); }
}
const csty = document.createElement('style'); csty.textContent = `@keyframes cFall{ 0% { transform: translateY(0) rotate(0);opacity: 1 }100% { transform: translateY(${window.innerHeight}px) rotate(720deg);opacity: 0 } } `; document.head.appendChild(csty);

function gid() { return 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function timeAgo(ts) { const d = Date.now() - ts; if (d < 60000) return '剛剛'; if (d < 3600000) return Math.floor(d / 60000) + '分鐘前'; if (d < 86400000) return Math.floor(d / 3600000) + '小時前'; return Math.floor(d / 86400000) + '天前'; }
function formatDeadline(dl) {
    if (!dl) return ''; try {
        const d = new Date(dl); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch (e) { return dl; }
}

// ===== ENDLESS BOSS BATTLE SYSTEM =====
let battleState = null;

function getCurrentBoss(layer) {
    const baseM = MONSTERS[(layer - 1) % MONSTERS.length];
    const modifier = 1 + (layer - 1) * 0.25; // 25% stronger per layer
    return {
        name: baseM.name,
        emoji: baseM.emoji,
        hp: Math.floor(baseM.hp * modifier),
        atk: Math.floor(baseM.atk * modifier),
        xp: Math.floor(baseM.xp * (1 + (layer - 1) * 0.1)),
        pts: Math.floor(baseM.pts * (1 + (layer - 1) * 0.1)),
    };
}

function refreshDailyBanner() {
    const a = me(); if (!a) return;
    const layer = (a.battlesWon || 0) + 1;
    const m = getCurrentBoss(layer);
    document.getElementById('daily-monster-name').textContent = `第 ${layer} 層 - ${m.name}`;
    document.getElementById('daily-monster-emoji').textContent = m.emoji;
    document.getElementById('daily-battle-hint').textContent = `強力魔王等著你！`;
    document.getElementById('battle-banner').style.opacity = '1';
}

function startDailyBattle() {
    const a = me(); if (!a) return;
    const layer = (a.battlesWon || 0) + 1;
    const m = getCurrentBoss(layer);

    const pStats = getPlayerStats(a);
    const pMaxHp = 100 + a.level * 10 + (pStats.def * 2);

    // Initialize or clamp HP
    if (a.currentHp === undefined || a.currentHp <= 0) {
        if (a.currentHp <= 0) {
            showToast('⚠️ 血量歸零了！請前往寶庫購買治療藥水恢復 HP');
            return;
        }
        a.currentHp = pMaxHp;
    }
    if (a.currentHp > pMaxHp) a.currentHp = pMaxHp;

    if (!a.bossHp || a.bossHp <= 0) a.bossHp = m.hp; // Reset boss hp if new layer

    battleState = {
        layer,
        monster: { ...m, curHp: a.bossHp },
        player: { hp: a.currentHp, maxHp: pMaxHp, atk: pStats.atk, def: pStats.def, skillUsed: false, healsLeft: 2 },
        log: [`⚔️ 第 ${layer} 層：${m.name} 咆哮著出現了！`],
        done: false
    };
    saveGlobal();

    // Render battle screen
    document.getElementById('bm-sprite').textContent = m.emoji;
    document.getElementById('bm-name').textContent = `Lv.${layer} ${m.name}`;
    document.getElementById('bp-sprite').innerHTML = getCharImg(a, 56, a.level);
    document.getElementById('bp-name').textContent = a.name;
    updateBattleUI();
    showScreen('screen-battle');
}

function updateBattleUI() {
    if (!battleState) return;
    const bs = battleState;
    const mPct = Math.max(0, (bs.monster.curHp / bs.monster.hp) * 100);
    const pPct = Math.max(0, (bs.player.hp / bs.player.maxHp) * 100);
    document.getElementById('bm-hp').style.width = mPct + '%';
    document.getElementById('bm-hp-text').textContent = `HP: ${Math.max(0, bs.monster.curHp)}/${bs.monster.hp}`;
    document.getElementById('bp-hp').style.width = pPct + '%';
    document.getElementById('bp-hp-text').textContent = `HP: ${Math.max(0, bs.player.hp)}/${bs.player.maxHp}`;
    document.getElementById('battle-log').innerHTML = bs.log.map(l => `<div>${l}</div>`).join('');
    document.getElementById('battle-log').scrollTop = 9999;
    // Disable buttons if done
    const a = me();

    // Attack Button
    const btnAttack = document.getElementById('btn-attack');
    btnAttack.className = `btn btn-primary`;
    btnAttack.disabled = bs.done;
    btnAttack.style.opacity = bs.done ? '0.4' : '1';

    // Skill Button
    const btnSkill = document.getElementById('btn-skill');
    btnSkill.innerHTML = `🌟 技能 (${bs.player.skillUsed ? '0' : '1'})`;
    if (bs.done || bs.player.skillUsed) {
        btnSkill.className = `btn`;
        btnSkill.style.background = 'var(--bg)';
        btnSkill.style.color = 'var(--text3)';
        btnSkill.style.borderColor = 'var(--border)';
        btnSkill.disabled = true;
        btnSkill.style.opacity = bs.done ? '0.4' : '0.8';
    } else {
        btnSkill.className = `btn btn-magic`;
        btnSkill.style.background = ''; // reset to class css
        btnSkill.style.color = '';
        btnSkill.style.borderColor = '';
        btnSkill.disabled = false;
        btnSkill.style.opacity = '1';
    }

    // Heal Button
    const btnHeal = document.getElementById('btn-heal');
    const pots = a.potions || 0;
    btnHeal.innerHTML = `<i class="ph-bold ph-flask"></i> 治療(${pots})`;
    if (bs.done || pots <= 0) {
        btnHeal.className = `btn`;
        btnHeal.style.background = 'var(--bg)';
        btnHeal.style.color = 'var(--text3)';
        btnHeal.style.borderColor = 'var(--border)';
        btnHeal.disabled = true;
        btnHeal.style.opacity = bs.done ? '0.4' : '0.8';
    } else {
        btnHeal.className = `btn btn-green`;
        btnHeal.style.background = '';
        btnHeal.style.color = '';
        btnHeal.style.borderColor = '';
        btnHeal.disabled = false;
        btnHeal.style.opacity = '1';
    }
}

function updatePersistentHp() {
    const a = me();
    if (!a || !battleState) return;
    a.currentHp = Math.max(0, battleState.player.hp);
    a.bossHp = Math.max(0, battleState.monster.curHp);
    saveGlobal();
}

function battleAttack() {
    if (!battleState || battleState.done) return;
    SoundManager.play('attack');
    const bs = battleState;
    const dmg = Math.floor(bs.player.atk * (0.8 + Math.random() * 0.4));
    bs.monster.curHp -= dmg;
    bs.log.push(`<span class="log-atk">⚔️ 你攻擊了 ${bs.monster.name}，造成 ${dmg} 傷害！</span>`);
    updatePersistentHp();
    rushAnim('bp-sprite');
    shakeElement('bm-sprite');
    hurtFlash('bm-sprite');
    spawnDmgFloat('monster-area', `- ${dmg} `, 'atk');
    if (bs.monster.curHp <= 0) { battleWin(); } else { setTimeout(() => { monsterTurn(); updateBattleUI(); }, 600); }
    updateBattleUI();
}

function getFunnySkillName() {
    const pool = [
        '💥 瞎貓死耗子劍法', '💥 旋風斬(會頭暈)', '💥 大聲咆哮', '💥 拿劍柄打臉',
        '💥 隨便念個咒語', '💥 好像是火球術', '💥 把怪物變冰紅茶', '💥 鴿子封包召喚',
        '💥 閉著眼睛亂射', '💥 射中怪物膝蓋', '💥 萬劍歸宗(純特效)', '💥 撒石灰粉',
        '💥 愛的抱抱', '💥 閃亮亮攻擊', '💥 超級溫柔的拍打',
        '💥 認真的一擊', '💥 閉眼亂打', '💥 大喊救命', '💥 華麗的摔倒'
    ];
    return pool[Math.floor(Math.random() * pool.length)];
}

function battleSkill() {
    if (!battleState || battleState.done || battleState.player.skillUsed) return;
    SoundManager.play('skill');
    const a = me();
    const bs = battleState;
    bs.player.skillUsed = true;
    const dmg = Math.floor(bs.player.atk * 2.5);
    bs.monster.curHp -= dmg;

    const skillName = getFunnySkillName();
    bs.log.push(`<span class="log-skill">🌟 使用技能！ ${skillName}！造成 ${dmg} 傷害！</span>`);

    updatePersistentHp();
    rushAnim('bp-sprite');

    shakeElement('bm-sprite');
    hurtFlash('bm-sprite');
    spawnDmgFloat('monster-area', `- ${dmg} `, 'crit');
    if (bs.monster.curHp <= 0) { battleWin(); } else { setTimeout(() => { monsterTurn(); updateBattleUI(); }, 1000); }
    updateBattleUI();
}

function battleHeal() {
    const a = me();
    if (!battleState || battleState.done || !a || (a.potions || 0) <= 0) {
        if (!a || (a.potions || 0) <= 0) showToast('沒有治療藥水了！請去幸運轉盤或寶庫獲取。');
        return;
    }
    SoundManager.play('heal');
    const bs = battleState;
    a.potions--;
    saveGlobal();

    // Potion heals 100%
    const heal = bs.player.maxHp - bs.player.hp;
    bs.player.hp = bs.player.maxHp;
    bs.log.push(`<span class="log-heal">💚 使用治療藥水！恢復 ${heal} 生命值！(剩餘 ${a.potions} 瓶)</span>`);
    updatePersistentHp();
    spawnDmgFloat('player-area', `+ ${heal} `, 'heal');
    setTimeout(() => { monsterTurn(); updateBattleUI(); }, 400);
    updateBattleUI();
}

function monsterTurn() {
    if (!battleState || battleState.done) return;
    const bs = battleState;

    // 30% chance to use Boss Skill if layer >= 3
    if (bs.layer >= 3 && Math.random() < 0.3) {
        let dmg = Math.floor(bs.monster.atk * 1.8);
        dmg = Math.max(1, dmg - Math.floor(bs.player.def / 2));
        bs.player.hp -= dmg;
        bs.log.push(`<span class="log-enemy" style="color:var(--red);">🔥 ${bs.monster.name} 使出致命打擊！造成 ${dmg} 傷害！</span>`);
        hurtFlash('bp-sprite');
        shakeElement('bp-sprite');
        spawnDmgFloat('player-area', `- ${dmg} `, 'crit');
    } else {
        let dmg = Math.floor(bs.monster.atk * (0.8 + Math.random() * 0.4));
        dmg = Math.max(1, dmg - Math.floor(bs.player.def / 2)); // Player Defense mitigates damage
        bs.player.hp -= dmg;
        bs.log.push(`<span class="log-enemy">👹 ${bs.monster.name} 反擊！造成 ${dmg} 傷害！</span>`);
        shakeElement('bp-sprite');
        spawnDmgFloat('player-area', `- ${dmg} `, 'atk');
        SoundManager.play('attack');
    }

    updatePersistentHp();
    if (bs.player.hp <= 0) { battleLose(); }
}

function battleWin() {
    SoundManager.play('win');
    const bs = battleState;
    bs.done = true;
    bs.monster.curHp = 0;
    const a = me();
    const xpGain = bs.monster.xp;
    const ptsGain = bs.monster.pts + 10; // User request: +10 pts per boss win
    a.totalXP += xpGain;
    a.points += ptsGain;
    a.battlesWon = (a.battlesWon || 0) + 1;
    a.bossHp = 0; // Clear boss HP so next layer generates full
    updatePersistentHp();
    const oldLvl = a.level;
    a.level = calcLevel(a.totalXP);
    if (a.level > oldLvl) a.currentHp = 100 + a.level * 10 + (bs.player.def * 2); // Free heal on level up
    // V1.05: Daily Quests — battle win event
    if (typeof EchoDailyQuests !== 'undefined') {
        EchoDailyQuests.notifyEvent('battle_win', 1);
        EchoDailyQuests.notifyEvent('xp_earn', xpGain);
    }
    saveGlobal(); checkAchievements();

    bs.log.push(`<span class="log-win">🎉 擊敗了第 ${bs.layer} 層魔王！獲得 + ${xpGain} XP · +${ptsGain} 金幣！</span>`);
    const oldClass = getClassName(oldLvl, a);
    const newClass = getClassName(a.level, a);
    if (newClass !== oldClass) {
        saveGlobal();
        showCelebration('🎊', '職業晉升！', `你現在是 ${newClass}！`);
    } else {
        saveGlobal();
    }
    bs.log.push(`<span class="log-win" style="color:var(--orange)">⚠️ 通往下一層的門開啟中...</span>`);
    setTimeout(() => { showCelebration('🏆', '戰鬥勝利！', `前進下一層...`); }, 500);
    setTimeout(() => {
        if (document.getElementById('screen-battle') && !document.getElementById('screen-battle').classList.contains('hidden')) {
            startDailyBattle();
        }
    }, 2500);
}

function battleLose() {
    const bs = battleState;
    bs.done = true;
    bs.player.hp = 0;
    updatePersistentHp();
    const a = me();
    checkAchievements();
    bs.log.push(`<span class="log-enemy">💔 戰敗了…你的血量歸零了。</span>`);
    bs.log.push(`<span class="log-enemy"> 請至王國祕寶閣使用金幣購買「治療藥水」，或透過達成委託升級來恢復血量！</span>`);
}

function exitBattle() {
    battleState = null;
    refreshHUD();
    refreshDailyBanner();
    showScreen('screen-home');
}

function shakeElement(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('shake-hit');
    void el.offsetWidth;
    el.classList.add('shake-hit');
    setTimeout(() => el.classList.remove('shake-hit'), 500);
}
function rushAnim(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('attack-rush');
    void el.offsetWidth;
    el.classList.add('attack-rush');
    setTimeout(() => el.classList.remove('attack-rush'), 500);
}
function hurtFlash(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('monster-hurt');
    void el.offsetWidth;
    el.classList.add('monster-hurt');
    setTimeout(() => el.classList.remove('monster-hurt'), 400);
}
// ===== UTILS =====
// getCharImg consolidated above


// BACKGROUND REMOVAL logic is now handled in handleAvatarUpload


// Start processing slightly after load to not block UI
setTimeout(() => {
    // initTransparentCharacters removed - handled on upload
}, 200);
function spawnDmgFloat(areaId, text, type) {
    const area = document.getElementById(areaId);
    if (!area) return;
    area.style.position = 'relative';
    const el = document.createElement('div');
    el.className = 'damage-float' + (type === 'heal' ? ' heal' : '') + (type === 'crit' ? ' crit' : '');
    el.textContent = text;
    el.style.left = (30 + Math.random() * 40) + '%';
    el.style.top = '10px';
    area.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

// ===== LUCKY WHEEL =====
const WHEEL_PRIZES = [
    { label: '+10 金幣', icon: '💰', action: a => { a.points += 10; } },
    { label: '+1 治療藥水', icon: '🧪', action: a => { a.potions = (a.potions || 0) + 1; } },
    { label: '+5 金幣', icon: '🪙', action: a => { a.points += 5; } },
    { label: '+30 XP', icon: '🔥', action: a => { a.totalXP += 30; a.level = calcLevel(a.totalXP); } },
    { label: '再轉一次', icon: '🌀', action: () => { } },
    { label: '+2 治療藥水', icon: '🧪', action: a => { a.potions = (a.potions || 0) + 2; } },
    { label: '+50 XP', icon: '💎', action: a => { a.totalXP += 50; a.level = calcLevel(a.totalXP); } },
    { label: '+25 金幣', icon: '🏆', action: a => { a.points += 25; } },
];
const WHEEL_COLORS = ['#FF6B00', '#7C5CFC', '#39FF14', '#FF3860', '#FFD700', '#00E5FF', '#FF6EB4', '#B0A0D0'];
let wheelSpinning = false;

function initWheel() {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    drawWheel(canvas, 0);
}

function drawWheel(canvas, rotation) {
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 8;
    const n = WHEEL_PRIZES.length;
    const arc = (2 * Math.PI) / n;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer glow/shadow for the premium wheel feel
    ctx.save();
    ctx.translate(cx, cy);
    ctx.shadowColor = 'rgba(99, 102, 241, 0.15)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Draw Slices
    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, i * arc, (i + 1) * arc);

        // Add subtle radial gradient to each slice
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, WHEEL_COLORS[i % WHEEL_COLORS.length]);
        grad.addColorStop(1, WHEEL_COLORS[i % WHEEL_COLORS.length]);

        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Text and Icons
        ctx.save();
        ctx.rotate(i * arc + arc / 2);
        ctx.textAlign = 'center';

        // Large Icon
        ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", NotoColorEmoji, sans-serif';
        // Add text shadow for legibility
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fillText(WHEEL_PRIZES[i].icon, r * 0.70, 8);

        // Large Text
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 15px Nunito, PingFang TC, sans-serif';
        // Stroke for text legibility against colors
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeText(WHEEL_PRIZES[i].label, r * 0.40, 6);
        ctx.fillText(WHEEL_PRIZES[i].label, r * 0.40, 6);
        ctx.restore();
    }

    // Center Pin (Premium Dot)
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#6366F1';
    ctx.fill();

    ctx.restore();
}

function openLuckyWheel() {
    const a = me(); if (!a) return;
    const today = new Date().toDateString();
    showScreen('screen-wheel');
    initWheel();

    // Disable button if already spun today
    const btn = document.getElementById('wheel-spin-btn');
    if (btn) {
        if (a.lastWheelDate === today) {
            btn.disabled = true;
            btn.textContent = '今日已領取';
        } else {
            btn.disabled = false;
            btn.innerHTML = `<span style="font-size:20px;margin-right:8px">💫</span> 開始轉動(免費)`;
        }
    }
}

function spinWheel() {
    if (wheelSpinning) return;
    const a = me(); if (!a) return;
    const today = new Date().toDateString();
    if (a.lastWheelDate === today) { showToast('今天已轉過了！'); return; }

    SoundManager.play('click');
    wheelSpinning = true;
    document.getElementById('wheel-spin-btn').disabled = true;
    document.getElementById('wheel-result').textContent = '';
    const canvas = document.getElementById('wheel-canvas');
    const n = WHEEL_PRIZES.length;
    const winIdx = Math.floor(Math.random() * n);
    const arc = (2 * Math.PI) / n;
    const targetAngle = (2 * Math.PI * 5) + (2 * Math.PI - winIdx * arc - arc / 2);
    let currentAngle = 0;
    const duration = 3000;
    const start = performance.now();
    function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        currentAngle = targetAngle * ease;
        drawWheel(canvas, currentAngle);
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            wheelSpinning = false;
            const prize = WHEEL_PRIZES[winIdx];
            prize.action(a);
            a.lastWheelDate = today;
            saveGlobal();
            document.getElementById('wheel-result').textContent = `🎉 獲得：${prize.icon} ${prize.label}！`;
            showCelebration(prize.icon, '轉盤獲獎！', prize.label);
            if (prize.label === '再轉一次') {
                a.lastWheelDate = null; saveGlobal();
                document.getElementById('wheel-spin-btn').disabled = false;
            }
        }
    }
    requestAnimationFrame(animate);
}

function refreshWheelHint() {
    const a = me(); if (!a) return;
    const hint = document.getElementById('wheel-hint');
    if (hint) {
        const today = new Date().toDateString();
        hint.textContent = a.lastWheelDate === today ? '✅ 今天已轉過' : '今天還沒轉！免費一次';
    }
}

// ===== TASK COMPLETION DASHBOARD =====
let currentDashPeriod = 'week';

function switchDashPeriod(period, btn) {
    currentDashPeriod = period;
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderDashboard(period);
}

function renderDashboard(period) {
    const a = me(); if (!a) return;
    const uid = myId();
    const now = new Date();
    // Calculate period start
    let startDate;
    if (period === 'week') {
        const d = new Date(now); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); startDate = d.getTime();
    } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1).getTime();
    } else {
        startDate = 0; // all time
    }
    // Filter tasks for this user in period
    const tasks = globalData.tasks.filter(t => {
        const time = t.completedAt || t.claimedAt || t.createdAt || 0;
        return (t.claimedBy === uid || t.creatorId === uid) && time >= startDate;
    });
    const done = tasks.filter(t => t.status === 'COMPLETED_CONFIRMED' || t.status === 'COMPLETED_PENDING_CONFIRM');
    const failed = tasks.filter(t => t.status === 'FAILED' || t.status === 'EXPIRED');
    const total = tasks.length;
    // Summary
    document.getElementById('dash-summary').innerHTML = `
    <div class="dash-stat stat-done"><span class="ds-val">${done.length}</span><span class="ds-label">✅ 完成</span></div>
        <div class="dash-stat stat-fail"><span class="ds-val">${failed.length}</span><span class="ds-label">❌ 失敗</span></div>
        <div class="dash-stat stat-total"><span class="ds-val">${total}</span><span class="ds-label">📋 總委託</span></div>
`;
    // Type breakdown
    const typeCount = {};
    const typeColors = { CHORE: '#FF6B00', LEARNING: '#7C5CFC', ADVENTURE: '#39FF14', KINDNESS: '#FF6EB4', CREATIVE: '#00E5FF', GAME: '#FFD700', GOAL: '#FF3860' };
    Object.keys(TYPE_LABELS).forEach(k => typeCount[k] = 0);
    done.forEach(t => { if (typeCount[t.type] !== undefined) typeCount[t.type]++; });
    const maxCount = Math.max(1, ...Object.values(typeCount));
    document.getElementById('dash-type-grid').innerHTML = Object.entries(TYPE_LABELS).map(([k, label]) => {
        const c = typeCount[k];
        const pct = (c / maxCount * 100).toFixed(0);
        const color = typeColors[k] || 'var(--primary)';
        return `<div class="dash-type-card">
            <span class="dash-type-icon">${label.split(' ')[0]}</span>
            <div class="dash-type-info">
                <div class="dash-type-name">${label}</div>
                <div class="dash-type-bar"><div class="dash-type-bar-fill" style="width:${pct}%;background:${color}"></div></div>
                <div class="dash-type-count">${c} 個完成</div>
            </div>
        </div> `;
    }).join('');
    // Achievements in this period
    const achList = ACHIEVEMENTS.filter(ach => {
        const s = { completedCount: done.length, tasks: tasks, battlesWon: a.battlesWon || 0, points: a.points, level: a.level, totalXP: a.totalXP, redemptions: a.redemptions || [] };
        try { return ach.check(s); } catch (e) { return false; }
    });
    document.getElementById('dash-achievements').innerHTML = achList.length > 0
        ? `<div class="dash-ach-row"> ${achList.map(a => `<span class="dash-ach-chip">${a.icon} ${a.name}</span>`).join('')}</div> `
        : '<div class="text-muted" style="font-size:12px;padding:8px 0">尚未達成任何成就，繼續加油！</div>';
    // AI humor comment
    const comment = getAIComment(done.length, failed.length, total, typeCount, period);
    document.getElementById('dash-ai-text').textContent = comment;
}

function getAIComment(done, failed, total, typeCount, period) {
    const periodName = { week: '這週', month: '這個月', year: '今年', all: '到目前為止' }[period];
    // No tasks at all
    if (total === 0) {
        const idle = [
            `${periodName} 你完全沒動耶…是在練習「忍術：完全隱身」嗎？🥷`,
            `${periodName} 零委託？你是不是把冒險當觀光在玩？📸`,
            `委託板空空如也，連史萊姆看了都替你著急 🟢💦`,
            `${periodName} 的委託數量跟我銀行餘額一樣——零 😭`,
            `勇者大人，${periodName} 休息夠了吧？該出門冒險了！⚔️`,
        ];
        return idle[Math.floor(Math.random() * idle.length)];
    }
    // All done, none failed
    if (done === total && total > 0) {
        const perfect = [
            `${periodName} 全部完成！你是不是開了外掛？🤖💯`,
            `100 % 完成率！你媽看到一定超驕傲 👩‍👧‍👦✨`,
            `完美表現！這個勇者有前途，連魔王都要怕 🐲💀`,
            `${periodName} 根本是委託粉碎機，給你跪了 🧎‍♂️`,
            `全滿！廢話不多說，直接封你為「${periodName} MVP」🏆`,
            `太猛了吧！你的完成率比珍珠奶茶的珍珠還要滿 🧋`,
        ];
        return perfect[Math.floor(Math.random() * perfect.length)];
    }
    // Mostly failed
    if (failed > done && total > 0) {
        const oof = [
            `${periodName} 失敗比完成多…沒關係，失敗為成功之母，你媽一定也這樣說 👩`,
            `戰績有點慘烈，但至少你有勇氣接委託！比待在村子裡的NPC強多了 🏠`,
            `嗯…成績不太好看，但沒關係，連傳奇冒險者也有低潮期 🛡️`,
            `${periodName} 有點卡關齁？建議你從簡單委託開始，冒險也要循序漸進 📈`,
        ];
        return oof[Math.floor(Math.random() * oof.length)];
    }
    // Some mix
    const rate = total > 0 ? Math.round(done / total * 100) : 0;
    const mixed = [
        `${periodName}達成 ${done} 個委託，完成率 ${rate}%，跟冒險執照考試成績差不多嘛 📝`,
        `${rate}% 完成率！不算差，但離「傳奇冒險者」還有一段距離 🏰`,
        `執行了 ${done} 個委託，CP值不錯👍 下次目標：打敗自己的紀錄！`,
        `${periodName} 的表現就像冒險者酒館的燉菜——外表普通但其實蠻飽滿的 🍲`,
        `達成了 ${done}/${total} 個委託。嗯，有進步的空間，就像冒險地圖的甜度一樣可以調 🗺️`,
        `${rate}%！勇者的道路本來就不容易，至少你沒放棄 💪`,
    ];
    // Bonus for specific types
    // Bonus for specific types (Identify the most common type)
    let bestType = null;
    let highestCount = 0;
    Object.entries(typeCount).forEach(([k, v]) => {
        if (v > highestCount) {
            highestCount = v;
            bestType = k;
        }
    });

    if (bestType === 'KINDNESS') {
        mixed.push(`✨ 善良值 MAX！你做了 ${highestCount} 個善行委託，這世界的發電機都是靠你發電的吧？🌈`);
    } else if (bestType === 'ADVENTURE') {
        mixed.push(`✨ 出門冒險了 ${highestCount} 次！我看連冒險者地圖都要來找你更新圖資了 🗺️🚶`);
    } else if (bestType === 'LEARNING') {
        mixed.push(`✨ 學了 ${highestCount} 個知識挑戰！這個腦容量，賢者議會正在看你的履歷 📶🧠`);
    } else if (bestType === 'CHORE') {
        mixed.push(`✨ 挖！達成了 ${highestCount} 個領地維護委託！家裡乾淨到蟑螂都要滑倒了🧹✨`);
    } else if (bestType === 'CREATIVE') {
        mixed.push(`✨ 發揮了 ${highestCount} 次創意！達文西都要認你做乾爹了 🎨💡`);
    }

    return mixed[Math.floor(Math.random() * mixed.length)];
}

// ===== GUILD SYSTEM =====
const GUILD_ICONS = ['🏰', '⚔️', '🛡️', '🐉', '🦁', '🐺', '🌟', '🔥', '🌈', '🎯', '🏴‍☠️', '👑', '🦅', '🐻', '💎', '🗡️', '🏹', '🧙'];
let selectedGuildIcon = '🏰';

function getGuilds() {
    if (!globalData.guilds) globalData.guilds = {};
    return globalData.guilds;
}

function getMyGuild() {
    const a = me(); if (!a || !a.guildId) return null;
    const guilds = getGuilds();
    return guilds[a.guildId] || null;
}

function isGuildOwner() {
    const g = getMyGuild();
    return g && g.ownerId === myId();
}

// --- Guild Gate: check before claiming tasks or redeeming rewards ---
function requireGuild(actionLabel) {
    const a = me();
    if (!a) return false;
    if (a.guildId && getMyGuild()) return true;
    // Show guild prompt modal
    document.getElementById('modal-guild-prompt').style.display = 'flex';
    return false;
}

function closeGuildPrompt() {
    document.getElementById('modal-guild-prompt').style.display = 'none';
}

// --- Navigation helpers ---
function openGuildJoinScreen() {
    closeGuildPrompt();
    document.getElementById('guild-join-section').style.display = '';
    document.getElementById('guild-create-section').style.display = 'none';
    showScreen('screen-guild-join');
}

function openGuildCreateScreen() {
    closeGuildPrompt();
    document.getElementById('guild-join-section').style.display = 'none';
    document.getElementById('guild-create-section').style.display = '';
    selectedGuildIcon = '🏰';
    document.getElementById('guild-create-icon-preview').textContent = '🏰';
    document.getElementById('guild-create-name').value = '';
    renderGuildIconGrid();
    showScreen('screen-guild-join');
}

function renderGuildIconGrid() {
    const grid = document.getElementById('guild-icon-grid');
    if (!grid) return;
    grid.innerHTML = GUILD_ICONS.map(icon => `
        <div class="guild-icon-option${icon === selectedGuildIcon ? ' selected' : ''}" onclick="selectGuildIcon('${icon}')">${icon}</div>
    `).join('');
}

function selectGuildIcon(icon) {
    selectedGuildIcon = icon;
    document.getElementById('guild-create-icon-preview').textContent = icon;
    renderGuildIconGrid();
}

// --- Create Guild ---
function doCreateGuild() {
    const a = me(); if (!a) return;
    const name = document.getElementById('guild-create-name').value.trim();
    if (!name) { showToast('請輸入公會名稱！'); return; }
    if (name.length < 2) { showToast('公會名稱至少需要 2 個字！'); return; }

    const guilds = getGuilds();
    const guildId = 'G' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code

    guilds[guildId] = {
        id: guildId,
        name: name,
        icon: selectedGuildIcon,
        code: code,
        ownerId: myId(),
        createdAt: Date.now(),
        members: [
            { id: myId(), name: a.name, emoji: getCharEmojiForGuild(a), roleTitle: '會長' }
        ]
    };
    a.guildId = guildId;
    saveGlobal();
    refreshAll();

    SoundManager.play('levelUp');
    showCelebration('🏰', '公會建立成功！', `「${name}」已建立，邀請碼：${code}`);
    setTimeout(() => {
        openGuildDashboard();
    }, 2600);
}

// --- Join Guild ---
function doJoinGuild() {
    const a = me(); if (!a) return;
    const codeValue = document.getElementById('guild-join-code').value.trim();
    if (!codeValue || codeValue.length !== 6) { showToast('請輸入 6 位邀請碼！'); return; }

    const guilds = getGuilds();
    let found = Object.values(guilds).find(g => g.code === codeValue);
    let isNew = false;

    if (!found) {
        showToast('❌ 找不到此邀請碼對應的公會，請確認後重試！');
        return;
    } else {
        if (found.members.some(m => m.id === myId())) {
            showToast('你已經是這個公會的成員了！');
            a.guildId = found.id;
            saveGlobal();
            openGuildDashboard();
            return;
        }
        found.members.push({
            id: myId(), name: a.name, emoji: getCharEmojiForGuild(a), roleTitle: '成員'
        });
    }

    a.guildId = found.id;
    saveGlobal();
    refreshAll();
    SoundManager.play('levelUp');
    showCelebration('🎊', isNew ? '成功創建並加入公會！' : '成功加入公會！', `歡迎加入「${found.name}」`);
    setTimeout(() => { openGuildDashboard(); }, 2600);
}

// --- Leave Guild ---
function doLeaveGuild() {
    const a = me(); if (!a || !a.guildId) return;
    const g = getMyGuild();
    if (!g) { a.guildId = null; saveGlobal(); return; }

    const isOwner = g.ownerId === myId();
    let msg = '確定要退出公會嗎？';
    if (isOwner && g.members.length > 1) {
        msg = '你是會長！退出公會將解散公會，所有成員都會被移除。確定嗎？';
    }

    if (!confirm(msg)) return;

    if (isOwner) {
        // Disband: remove guild from all members
        const guilds = getGuilds();
        g.members.forEach(m => {
            const acc = globalData.accounts[m.id];
            if (acc) acc.guildId = null;
        });
        delete guilds[g.id];
    } else {
        // Just remove self
        g.members = g.members.filter(m => m.id !== myId());
    }
    a.guildId = null;
    saveGlobal();
    showToast('已退出公會');
    showScreen('screen-character');
    refreshProfile();
}

// --- Guild Dashboard ---
function openGuildDashboard() {
    const a = me(); if (!a) return;
    if (!a.guildId || !getMyGuild()) {
        // No guild, open join screen
        openGuildJoinScreen();
        return;
    }

    renderGuildDashboard();
    showScreen('screen-guild');
}

function renderGuildDashboard() {
    const g = getMyGuild();
    if (!g) return;
    const isOwner = g.ownerId === myId();
    const container = document.getElementById('guild-dashboard-content');

    container.innerHTML = `
    <!-- Guild Header -->
        <div class="guild-header-card">
            <div class="guild-icon-big">${g.icon}</div>
            <div class="guild-name-big">${esc(g.name)}</div>
            <div style="color:var(--text2);font-size:12px;font-weight:700;margin-bottom:8px;">邀請碼（點擊複製）</div>
            <div class="guild-code-badge" onclick="copyGuildCode('${g.code}')">
                <i class="ph-bold ph-copy"></i> ${g.code}
            </div>
            <div class="guild-info-row">
                <div class="guild-info-chip"><i class="ph-bold ph-users"></i> ${g.members.length} 成員</div>
                <div class="guild-info-chip"><i class="ph-bold ph-calendar-blank"></i> ${new Date(g.createdAt).toLocaleDateString('zh-TW')}</div>
            </div>
        </div>

        ${isOwner ? `
        <!-- Owner Actions -->
        <div style="display:flex;gap:8px;margin-top:16px;">
            <button class="guild-action-btn" onclick="editGuildName()">
                <i class="ph-bold ph-pencil-simple"></i> 修改名稱
            </button>
            <button class="guild-action-btn" onclick="editGuildIcon()">
                <i class="ph-bold ph-image"></i> 更換圖示
            </button>
        </div>
        ` : ''
        }

        <!-- Members Section -->
        <div style="margin-top:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div style="font-size:15px;font-weight:900;color:var(--text);">👥 公會成員 (${g.members.length})</div>
            </div>
            <div id="guild-members-list">
                ${g.members.map(m => renderGuildMemberCard(m, isOwner, g)).join('')}
            </div>
        </div>

        <!-- Leave Guild -->
    <div style="margin-top:24px;">
        <button class="guild-action-btn danger" style="width:100%;" onclick="doLeaveGuild()">
            <i class="ph-bold ph-sign-out"></i> ${isOwner ? '解散公會' : '退出公會'}
        </button>
    </div>
`;
}

function renderGuildMemberCard(member, isOwner, guild) {
    const isSelf = member.id === myId();
    const isThisOwner = member.id === guild.ownerId;
    let roleBadgeClass = 'member';
    let roleLabel = member.roleTitle || '成員';
    if (isThisOwner) { roleBadgeClass = 'owner'; roleLabel = member.roleTitle || '會長'; }
    else if (roleLabel === '副會長') { roleBadgeClass = 'vice'; }

    const editBtn = (isOwner && !isSelf) ? `
    <button style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:18px;padding:4px;" onclick="editMemberRole('${member.id}')">
        <i class="ph-bold ph-pencil-simple"></i>
        </button>` : '';

    return `
        <div class="guild-member-card">
            <div class="guild-member-avatar">${member.emoji || '🧙'}</div>
            <div class="guild-member-info">
                <div class="guild-member-name">${esc(member.name)}${isSelf ? ' <span style="color:var(--primary);font-size:11px;">(你)</span>' : ''}</div>
                <div class="guild-member-role">
                    <span class="guild-role-badge ${roleBadgeClass}">${isThisOwner ? '👑' : ''} ${roleLabel}</span>
                </div>
            </div>
            ${editBtn}
        </div>
    `;
}

function copyGuildCode(code) {
    navigator.clipboard.writeText(code).then(() => showToast('邀請碼已複製！')).catch(() => showToast(`邀請碼：${code} `));
}

// --- Guild Editing (Owner only) ---
function closeGuildEditModal() {
    document.getElementById('modal-guild-edit').style.display = 'none';
}

function editGuildName() {
    if (!isGuildOwner()) return;
    const g = getMyGuild();
    document.getElementById('guild-edit-modal-title').textContent = '修改公會名稱';
    document.getElementById('guild-edit-modal-body').innerHTML = `
        <div class="form-group" style="margin-bottom:0;">
            <label>新名稱</label>
            <input id="guild-edit-name-input" value="${esc(g.name)}" maxlength="20" placeholder="輸入新的公會名稱">
        </div>
    `;
    const btn = document.getElementById('guild-edit-confirm-btn');
    btn.onclick = () => {
        const newName = document.getElementById('guild-edit-name-input').value.trim();
        if (!newName || newName.length < 2) { showToast('名稱至少需要 2 個字！'); return; }
        g.name = newName;
        saveGlobal();
        closeGuildEditModal();
        renderGuildDashboard();
        showToast('公會名稱已更新！');
    };
    document.getElementById('modal-guild-edit').style.display = 'flex';
}

function editGuildIcon() {
    if (!isGuildOwner()) return;
    const g = getMyGuild();
    selectedGuildIcon = g.icon;
    document.getElementById('guild-edit-modal-title').textContent = '更換公會圖示';
    document.getElementById('guild-edit-modal-body').innerHTML = `<div class="guild-icon-grid" id="guild-edit-icon-grid"></div>`;

    // Render icons in the edit modal
    const grid = document.getElementById('guild-edit-icon-grid');
    if (grid) {
        grid.innerHTML = GUILD_ICONS.map(icon => `
            <div class="guild-icon-option${icon === selectedGuildIcon ? ' selected' : ''}" onclick="selectEditGuildIcon('${icon}')">${icon}</div>
        `).join('');
    }

    const btn = document.getElementById('guild-edit-confirm-btn');
    btn.onclick = () => {
        g.icon = selectedGuildIcon;
        saveGlobal();
        closeGuildEditModal();
        renderGuildDashboard();
        showToast('公會圖示已更新！');
    };
    document.getElementById('modal-guild-edit').style.display = 'flex';
}

function selectEditGuildIcon(icon) {
    selectedGuildIcon = icon;
    const grid = document.getElementById('guild-edit-icon-grid');
    if (grid) {
        grid.innerHTML = GUILD_ICONS.map(i => `
            <div class="guild-icon-option${i === selectedGuildIcon ? ' selected' : ''}" onclick="selectEditGuildIcon('${i}')">${i}</div>
        `).join('');
    }
}

function editMemberRole(memberId) {
    if (!isGuildOwner()) return;
    const g = getMyGuild();
    const member = g.members.find(m => m.id === memberId);
    if (!member) return;

    document.getElementById('guild-edit-modal-title').textContent = `設定「${member.name}」的職稱`;
    document.getElementById('guild-edit-modal-body').innerHTML = `
        <div class="form-group" style="margin-bottom:8px;">
            <label>職稱</label>
            <input id="guild-edit-role-input" value="${esc(member.roleTitle || '成員')}" maxlength="10" placeholder="例：副會長、魔法顧問">
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
            <button class="btn btn-sm" style="background:rgba(99,102,241,0.1);color:var(--primary);border:1px solid rgba(99,102,241,0.2);border-radius:20px;font-size:11px;padding:4px 10px;"
                    onclick="document.getElementById('guild-edit-role-input').value='副會長'">副會長</button>
            <button class="btn btn-sm" style="background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.2);border-radius:20px;font-size:11px;padding:4px 10px;"
                    onclick="document.getElementById('guild-edit-role-input').value='魔法顧問'">魔法顧問</button>
            <button class="btn btn-sm" style="background:rgba(245,158,11,0.1);color:var(--orange);border:1px solid rgba(245,158,11,0.2);border-radius:20px;font-size:11px;padding:4px 10px;"
                    onclick="document.getElementById('guild-edit-role-input').value='戰鬥隊長'">戰鬥隊長</button>
            <button class="btn btn-sm" style="background:rgba(244,114,182,0.1);color:var(--pink);border:1px solid rgba(244,114,182,0.2);border-radius:20px;font-size:11px;padding:4px 10px;"
                    onclick="document.getElementById('guild-edit-role-input').value='任務專員'">任務專員</button>
        </div>`;
    const btn = document.getElementById('guild-edit-confirm-btn');
    btn.onclick = () => {
        const newRole = document.getElementById('guild-edit-role-input').value.trim();
        if (!newRole) { showToast('請輸入職稱！'); return; }
        member.roleTitle = newRole;
        saveGlobal();
        closeGuildEditModal();
        renderGuildDashboard();
        showToast(`已將「${member.name}」的職稱設為「${newRole}」`);
    };
    document.getElementById('modal-guild-edit').style.display = 'flex';
}

function getCharEmojiForGuild(acc) {
    return '🧙';
}

// --- End of Script ---