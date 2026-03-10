/* ==============================================
   ECHO Daily Quests System V1.05
   每日冒險任務 — 借鑒 Duolingo Daily Quests 機制
   系統自動生成每日小任務，無需家長手動發布
   ============================================== */

const EchoDailyQuests = {

    // ===== QUEST DEFINITIONS =====
    // Each quest has a condition check and progress tracker
    QUEST_POOL: [
        {
            id: 'complete_1_task',
            icon: '⚔️',
            title: '完成 1 個委託',
            desc: '今天完成任何一個委託',
            target: 1,
            type: 'task_complete',
            xpReward: 15,
            coinReward: 10
        },
        {
            id: 'complete_2_tasks',
            icon: '🗡️',
            title: '完成 2 個委託',
            desc: '今天完成兩個委託',
            target: 2,
            type: 'task_complete',
            xpReward: 30,
            coinReward: 20
        },
        {
            id: 'earn_50xp',
            icon: '⚡',
            title: '獲得 50 XP',
            desc: '今天累計獲得 50 經驗值',
            target: 50,
            type: 'xp_earn',
            xpReward: 10,
            coinReward: 15
        },
        {
            id: 'earn_100xp',
            icon: '⚡',
            title: '獲得 100 XP',
            desc: '今天累計獲得 100 經驗值',
            target: 100,
            type: 'xp_earn',
            xpReward: 20,
            coinReward: 25
        },
        {
            id: 'win_1_battle',
            icon: '💀',
            title: '打贏 1 場魔王戰',
            desc: '在爬塔挑戰中獲勝',
            target: 1,
            type: 'battle_win',
            xpReward: 20,
            coinReward: 15
        },
        {
            id: 'redeem_1_reward',
            icon: '🛍️',
            title: '兌換 1 個獎勵',
            desc: '到商店兌換任何一個獎勵',
            target: 1,
            type: 'reward_redeem',
            xpReward: 10,
            coinReward: 10
        },
        {
            id: 'claim_1_task',
            icon: '📋',
            title: '接取 1 個委託',
            desc: '從委託看板接取任何委託',
            target: 1,
            type: 'task_claim',
            xpReward: 10,
            coinReward: 5
        },
        {
            id: 'publish_1_task',
            icon: '📝',
            title: '發布 1 個委託',
            desc: '發布一個新委託到看板',
            target: 1,
            type: 'task_publish',
            xpReward: 15,
            coinReward: 10
        },
        {
            id: 'complete_checklist_3',
            icon: '✅',
            title: '完成 3 個清單項目',
            desc: '在委託中勾選 3 個清單項目',
            target: 3,
            type: 'checklist_check',
            xpReward: 10,
            coinReward: 8
        },
    ],

    // Bonus for completing ALL daily quests
    ALL_COMPLETE_BONUS: { xp: 25, coins: 20, icon: '🌟', title: '每日全勤獎勵' },

    // ===== CORE LOGIC =====

    /**
     * Get today's date key
     */
    _today() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    },

    /**
     * Initialize or refresh daily quests for an account.
     * Called on enterApp and when checking quest status.
     */
    initQuests(account) {
        if (!account) return;
        const today = this._today();

        // If quests exist and are for today, keep them
        if (account.dailyQuests && account.dailyQuestsDate === today) {
            return;
        }

        // Generate new quests for today
        account.dailyQuestsDate = today;
        account.dailyQuestsProgress = {};

        // Pick 2 random non-duplicate quests
        const shuffled = [...this.QUEST_POOL].sort(() => Math.random() - 0.5);
        account.dailyQuests = shuffled.slice(0, 2).map(q => q.id);

        // Initialize progress counters
        account.dailyQuests.forEach(qId => {
            account.dailyQuestsProgress[qId] = 0;
        });

        account.dailyQuestsAllClaimed = false;
    },

    /**
     * Record progress for a specific event type.
     * Called from various game events.
     * @param {string} eventType - 'task_complete', 'xp_earn', 'battle_win', 'reward_redeem', 'task_claim', 'task_publish', 'checklist_check'
     * @param {number} amount - Progress amount (default 1)
     * @returns {Array} - List of newly completed quest IDs
     */
    recordProgress(account, eventType, amount = 1) {
        if (!account || !account.dailyQuests) return [];
        const today = this._today();
        if (account.dailyQuestsDate !== today) {
            this.initQuests(account);
        }

        if (!account.dailyQuestsProgress) account.dailyQuestsProgress = {};

        const newlyCompleted = [];

        account.dailyQuests.forEach(qId => {
            const quest = this.QUEST_POOL.find(q => q.id === qId);
            if (!quest || quest.type !== eventType) return;

            const prevProgress = account.dailyQuestsProgress[qId] || 0;
            const newProgress = prevProgress + amount;
            account.dailyQuestsProgress[qId] = newProgress;

            // Check if just completed
            if (prevProgress < quest.target && newProgress >= quest.target) {
                newlyCompleted.push(qId);
            }
        });

        return newlyCompleted;
    },

    /**
     * Claim rewards for completed quests.
     * @returns {{ xp: number, coins: number, allBonus: boolean }}
     */
    claimRewards(account) {
        if (!account || !account.dailyQuests) return { xp: 0, coins: 0, allBonus: false };

        let totalXP = 0;
        let totalCoins = 0;

        account.dailyQuests.forEach(qId => {
            const quest = this.QUEST_POOL.find(q => q.id === qId);
            if (!quest) return;
            const progress = account.dailyQuestsProgress[qId] || 0;
            if (progress >= quest.target && !account['dq_claimed_' + qId]) {
                totalXP += quest.xpReward;
                totalCoins += quest.coinReward;
                account['dq_claimed_' + qId] = true;
            }
        });

        // Check all-complete bonus
        let allBonus = false;
        const allDone = account.dailyQuests.every(qId => {
            const quest = this.QUEST_POOL.find(q => q.id === qId);
            return quest && (account.dailyQuestsProgress[qId] || 0) >= quest.target;
        });

        if (allDone && !account.dailyQuestsAllClaimed) {
            totalXP += this.ALL_COMPLETE_BONUS.xp;
            totalCoins += this.ALL_COMPLETE_BONUS.coins;
            account.dailyQuestsAllClaimed = true;
            allBonus = true;
        }

        // Apply rewards
        if (totalXP > 0) {
            account.totalXP += totalXP;
            account.level = calcLevel(account.totalXP);
        }
        account.points += totalCoins;

        return { xp: totalXP, coins: totalCoins, allBonus };
    },

    /**
     * Get quest status for rendering
     */
    getQuestStatus(account) {
        if (!account || !account.dailyQuests) return [];
        const today = this._today();
        if (account.dailyQuestsDate !== today) return [];

        return account.dailyQuests.map(qId => {
            const quest = this.QUEST_POOL.find(q => q.id === qId);
            if (!quest) return null;
            const progress = Math.min(account.dailyQuestsProgress[qId] || 0, quest.target);
            const completed = progress >= quest.target;
            const claimed = !!account['dq_claimed_' + qId];
            return {
                ...quest,
                progress,
                completed,
                claimed,
                pct: Math.round((progress / quest.target) * 100)
            };
        }).filter(Boolean);
    },

    // ===== UI RENDERING =====

    /**
     * Render the Daily Quests card for home screen
     */
    renderQuestsCard(account) {
        if (!account) return '';
        this.initQuests(account);
        const quests = this.getQuestStatus(account);
        if (quests.length === 0) return '';

        const allDone = quests.every(q => q.completed);
        const allClaimed = account.dailyQuestsAllClaimed;
        const anyUnclaimed = quests.some(q => q.completed && !q.claimed) || (allDone && !allClaimed);

        const questsHtml = quests.map(q => `
            <div style="display:flex; align-items:center; gap:10px; padding:10px 0; ${q.completed ? '' : 'opacity:0.9;'}">
                <div style="width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center;
                    background:${q.completed ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.1)'};
                    border:2px solid ${q.completed ? '#10B981' : 'rgba(99,102,241,0.2)'};
                    font-size:18px;">
                    ${q.completed ? '✅' : q.icon}
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:800; font-size:13px; color:${q.completed ? '#10B981' : 'var(--text)'}; ${q.completed ? 'text-decoration:line-through; opacity:0.7;' : ''}">${q.title}</div>
                    <div style="height:6px; background:var(--surface); border-radius:3px; margin-top:4px; overflow:hidden;">
                        <div style="height:100%; width:${q.pct}%; background:${q.completed ? '#10B981' : 'var(--primary)'}; border-radius:3px; transition:width 0.5s;"></div>
                    </div>
                    <div style="font-size:10px; color:var(--text3); margin-top:2px;">${q.progress}/${q.target} ${q.completed ? '— 完成！' : ''}</div>
                </div>
                <div style="text-align:right; font-size:10px; color:var(--text3); white-space:nowrap;">
                    +${q.xpReward} XP<br>+${q.coinReward} 💰
                </div>
            </div>
        `).join('<div style="border-top:1px solid var(--border);"></div>');

        // All-complete bonus bar
        const bonusHtml = allDone ? `
            <div style="margin-top:8px; padding:8px 12px; background:${allClaimed ? 'rgba(16,185,129,0.08)' : 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,107,0,0.12))'}; border-radius:10px; display:flex; align-items:center; justify-content:space-between;">
                <div>
                    <span style="font-size:14px;">🌟</span>
                    <span style="font-size:12px; font-weight:900; color:${allClaimed ? '#10B981' : '#FFD700'};">${allClaimed ? '全勤獎勵已領取' : '每日全勤獎勵！'}</span>
                </div>
                ${!allClaimed ? `<span style="font-size:10px; color:var(--text2);">+${this.ALL_COMPLETE_BONUS.xp} XP +${this.ALL_COMPLETE_BONUS.coins} 💰</span>` : ''}
            </div>
        ` : '';

        return `
            <div class="card" style="border-color:${anyUnclaimed ? 'rgba(255,215,0,0.4)' : 'var(--border)'}; ${anyUnclaimed ? 'box-shadow:0 4px 16px rgba(255,215,0,0.1);' : ''}">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                    <div style="font-weight:900; font-size:14px; color:var(--primary);">
                        📋 每日冒險任務
                    </div>
                    ${anyUnclaimed ? `<button class="btn btn-magic" style="padding:4px 12px; font-size:11px; border-radius:8px; font-weight:800;" onclick="EchoDailyQuests.claimAndShow()">領取獎勵！</button>` : `<span style="font-size:11px; color:var(--text3);">每日 00:00 重置</span>`}
                </div>
                ${questsHtml}
                ${bonusHtml}
            </div>
        `;
    },

    /**
     * Claim rewards and show celebration
     */
    claimAndShow() {
        const a = me();
        if (!a) return;
        const result = this.claimRewards(a);
        if (result.xp > 0 || result.coins > 0) {
            saveGlobal();
            refreshAll();
            const bonusText = result.allBonus ? ' (含全勤獎勵!)' : '';
            showCelebration('🌟', '每日任務獎勵！', `+${result.xp} XP +${result.coins} 金幣${bonusText}`);
            SoundManager.play('win');
        }
        // Re-render the quests card
        this.refreshQuestsUI();
    },

    /**
     * Refresh the quests card in the DOM
     */
    refreshQuestsUI() {
        const container = document.getElementById('daily-quests-container');
        if (container) {
            container.innerHTML = this.renderQuestsCard(me());
        }
    },

    /**
     * Hook: call this after any game event to update quest progress
     * and auto-render if on home screen.
     */
    notifyEvent(eventType, amount = 1) {
        const a = me();
        if (!a) return;
        const completed = this.recordProgress(a, eventType, amount);
        if (completed.length > 0) {
            saveGlobal();
            // Show mini toast for quest completion
            completed.forEach(qId => {
                const quest = this.QUEST_POOL.find(q => q.id === qId);
                if (quest) {
                    showToast(`📋 每日任務完成：${quest.title}！`);
                }
            });
        }
        // Refresh UI if visible
        this.refreshQuestsUI();
    }
};
