/* ==============================================
   ECHO Streak System V1.05
   連續冒險系統 — 借鑒 Duolingo Streak 機制
   ============================================== */

const EchoStreak = {
    // ===== CORE STREAK LOGIC =====

    /**
     * Get today's date string (local timezone, no time)
     */
    _today() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    },

    /**
     * Parse a date string "YYYY-M-D" to Date object at midnight
     */
    _parseDate(str) {
        if (!str) return null;
        const parts = str.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    },

    /**
     * Calculate day difference between two date strings
     */
    _dayDiff(dateStr1, dateStr2) {
        const d1 = this._parseDate(dateStr1);
        const d2 = this._parseDate(dateStr2);
        if (!d1 || !d2) return Infinity;
        return Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
    },

    /**
     * Check and update streak on task completion.
     * Called whenever a task is confirmed complete.
     * Returns { streakCount, isNew, wasBroken, usedFreeze }
     */
    onTaskCompleted(account) {
        if (!account) return null;
        const today = this._today();

        // Initialize streak fields if missing
        if (!account.streakCount) account.streakCount = 0;
        if (!account.streakFreezeCount) account.streakFreezeCount = 0;

        // Already recorded streak today
        if (account.streakLastActiveDate === today) {
            return { streakCount: account.streakCount, isNew: false, wasBroken: false, usedFreeze: false };
        }

        const diff = this._dayDiff(today, account.streakLastActiveDate);

        if (diff === 1) {
            // Consecutive day — extend streak
            account.streakCount++;
            account.streakLastActiveDate = today;
            return { streakCount: account.streakCount, isNew: true, wasBroken: false, usedFreeze: false };
        } else if (diff === 2 && account.streakFreezeCount > 0) {
            // Missed 1 day but has freeze — auto-use freeze
            account.streakFreezeCount--;
            account.streakCount++; // Continue streak
            account.streakLastActiveDate = today;
            return { streakCount: account.streakCount, isNew: true, wasBroken: false, usedFreeze: true };
        } else if (diff === 0 || !account.streakLastActiveDate) {
            // First ever task or same day
            account.streakCount = 1;
            account.streakLastActiveDate = today;
            return { streakCount: 1, isNew: true, wasBroken: false, usedFreeze: false };
        } else {
            // Streak broken
            const oldStreak = account.streakCount;
            account.streakCount = 1;
            account.streakLastActiveDate = today;
            return { streakCount: 1, isNew: true, wasBroken: oldStreak > 1, usedFreeze: false };
        }
    },

    /**
     * Check streak on app open (enterApp).
     * Does NOT extend streak — only checks if it's still alive.
     * Returns current streak status for UI display.
     */
    checkStreakStatus(account) {
        if (!account) return { streakCount: 0, isAlive: false, needsAction: true };
        if (!account.streakCount) account.streakCount = 0;

        const today = this._today();

        if (account.streakLastActiveDate === today) {
            // Already active today
            return { streakCount: account.streakCount, isAlive: true, needsAction: false };
        }

        const diff = this._dayDiff(today, account.streakLastActiveDate);

        if (diff === 1) {
            // Yesterday was active — streak alive but needs today's task
            return { streakCount: account.streakCount, isAlive: true, needsAction: true };
        } else if (diff === 2 && account.streakFreezeCount > 0) {
            // 2 days ago — freeze can save it
            return { streakCount: account.streakCount, isAlive: true, needsAction: true, hasFreeze: true };
        } else if (diff > 1) {
            // Streak is dead (will reset on next task)
            return { streakCount: 0, isAlive: false, needsAction: true };
        }

        return { streakCount: account.streakCount, isAlive: account.streakCount > 0, needsAction: true };
    },

    /**
     * Buy a Streak Freeze (shield potion) — max 3
     */
    buyStreakFreeze(account) {
        if (!account) return { success: false, reason: 'no_account' };
        const cost = 100;
        const maxFreezes = 3;

        if (!account.streakFreezeCount) account.streakFreezeCount = 0;
        if (account.streakFreezeCount >= maxFreezes) return { success: false, reason: 'max_reached' };
        if (account.points < cost) return { success: false, reason: 'insufficient_funds' };

        account.points -= cost;
        account.streakFreezeCount++;
        return { success: true, freezeCount: account.streakFreezeCount, cost };
    },

    // ===== STREAK MILESTONES =====
    MILESTONES: [
        { days: 3, icon: '🔥', title: '三日火種', reward: 10, xp: 15 },
        { days: 7, icon: '🔥', title: '一週烈焰', reward: 30, xp: 50 },
        { days: 14, icon: '🔥', title: '雙週不滅', reward: 50, xp: 100 },
        { days: 30, icon: '💎', title: '月之守護', reward: 100, xp: 200 },
        { days: 60, icon: '💎', title: '雙月傳說', reward: 200, xp: 400 },
        { days: 100, icon: '👑', title: '百日王者', reward: 500, xp: 1000 },
        { days: 365, icon: '🏆', title: '永恆之焰', reward: 1000, xp: 2000 },
    ],

    /**
     * Check if a milestone was just reached
     */
    checkMilestone(streakCount) {
        return this.MILESTONES.find(m => m.days === streakCount) || null;
    },

    /**
     * Get the next milestone target
     */
    getNextMilestone(streakCount) {
        return this.MILESTONES.find(m => m.days > streakCount) || null;
    },

    // ===== UI RENDERING =====

    /**
     * Render streak badge HTML for HUD
     */
    renderStreakBadge(account) {
        const status = this.checkStreakStatus(account);
        const count = status.streakCount || 0;
        const alive = status.isAlive;
        const needsAction = status.needsAction;
        const freezeCount = account ? (account.streakFreezeCount || 0) : 0;

        const fireColor = alive ? (count >= 30 ? '#FFD700' : count >= 7 ? '#FF6B00' : '#FF4757') : '#666';
        const pulseClass = (alive && needsAction) ? 'streak-pulse' : '';
        const next = this.getNextMilestone(count);
        const nextText = next ? `下一里程碑：${next.days} 天` : '已達最高！';

        return `
            <div class="streak-badge ${pulseClass}" onclick="EchoStreak.showStreakDetail()" style="
                display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:16px;
                background: ${alive ? 'linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,71,87,0.12))' : 'rgba(100,100,100,0.1)'};
                border: 1px solid ${alive ? 'rgba(255,107,0,0.25)' : 'rgba(100,100,100,0.15)'};
                cursor: pointer; transition: all 0.3s; position: relative;">
                <span style="font-size:20px; filter:drop-shadow(0 2px 4px ${fireColor}40);">
                    ${alive ? '🔥' : '❄️'}
                </span>
                <div style="display:flex; flex-direction:column; line-height:1.2;">
                    <span style="font-size:16px; font-weight:900; color:${fireColor};">${count}</span>
                    <span style="font-size:9px; color:var(--text3); font-weight:700;">連續天</span>
                </div>
                ${freezeCount > 0 ? `<span style="font-size:11px; position:absolute; top:-4px; right:-4px; background:#00E5FF; color:#000; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-weight:900; border:2px solid var(--bg);">🛡️</span>` : ''}
            </div>
        `;
    },

    /**
     * Show streak detail modal
     */
    showStreakDetail() {
        const a = me();
        if (!a) return;
        const status = this.checkStreakStatus(a);
        const count = status.streakCount || 0;
        const alive = status.isAlive;
        const freezeCount = a.streakFreezeCount || 0;
        const next = this.getNextMilestone(count);

        // Build milestones progress
        const milestonesHtml = this.MILESTONES.map(m => {
            const reached = count >= m.days;
            return `<div style="display:flex; align-items:center; gap:8px; padding:8px 0; opacity:${reached ? '1' : '0.5'};">
                <span style="font-size:20px;">${reached ? '✅' : m.icon}</span>
                <div style="flex:1;">
                    <div style="font-weight:800; font-size:13px; color:${reached ? 'var(--primary)' : 'var(--text)'};">${m.title}</div>
                    <div style="font-size:11px; color:var(--text3);">${m.days} 天連續冒險</div>
                </div>
                <div style="font-size:11px; font-weight:900; color:${reached ? '#10B981' : 'var(--text3)'};">
                    ${reached ? '已達成' : `+${m.reward} 💰`}
                </div>
            </div>`;
        }).join('');

        const modalHtml = `
            <div style="text-align:center; margin-bottom:16px;">
                <div style="font-size:48px; margin-bottom:8px;">${alive ? '🔥' : '❄️'}</div>
                <div style="font-size:32px; font-weight:900; color:${alive ? '#FF6B00' : '#666'};">${count} 天</div>
                <div style="font-size:13px; color:var(--text2); margin-top:4px;">
                    ${alive ? (status.needsAction ? '今天還沒完成任務！快去冒險！' : '今日冒險已完成！') : '連續冒險中斷了...重新開始吧！'}
                </div>
            </div>
            <div style="display:flex; justify-content:center; gap:12px; margin-bottom:16px;">
                <div style="background:rgba(0,229,255,0.1); border:1px solid rgba(0,229,255,0.2); border-radius:12px; padding:8px 16px; text-align:center;">
                    <div style="font-size:9px; color:var(--text3); font-weight:700;">護盾藥水</div>
                    <div style="font-size:18px; font-weight:900; color:#00E5FF;">🛡️ ${freezeCount}</div>
                </div>
                <div style="background:rgba(255,215,0,0.1); border:1px solid rgba(255,215,0,0.2); border-radius:12px; padding:8px 16px; text-align:center;">
                    <div style="font-size:9px; color:var(--text3); font-weight:700;">下個目標</div>
                    <div style="font-size:14px; font-weight:900; color:#FFD700;">${next ? next.days + ' 天' : '🏆 MAX'}</div>
                </div>
            </div>
            <div style="border-top:1px solid var(--border); padding-top:12px;">
                <div style="font-weight:900; font-size:14px; margin-bottom:8px;">🏆 里程碑</div>
                ${milestonesHtml}
            </div>
        `;

        // Use existing modal system
        const modal = document.getElementById('streak-detail-modal');
        if (modal) {
            document.getElementById('streak-detail-content').innerHTML = modalHtml;
            modal.style.display = 'flex';
        }
    },

    closeStreakDetail() {
        const modal = document.getElementById('streak-detail-modal');
        if (modal) modal.style.display = 'none';
    }
};
