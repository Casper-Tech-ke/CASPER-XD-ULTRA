const REACT_EMOJIS = ['👀', '🔥', '❤️', '😍', '👏', '💯', '🙌', '✨', '💪', '😂', '🤩', '💖', '⭐', '🎉', '💕'];

class AutoViewManager {
    constructor() {
        this.lastViewTime = 0;
        this.rateLimitDelay = 1000;
        this.totalViewed = 0;
        this.totalReacted = 0;
    }

    get enabled() {
        return global.db.settings.get('autoview', 'off') === 'on';
    }

    get reactEnabled() {
        return global.db.settings.get('autoreact', 'off') === 'on';
    }

    setEnabled(val) {
        global.db.settings.set('autoview', val ? 'on' : 'off');
    }

    setReactEnabled(val) {
        global.db.settings.set('autoreact', val ? 'on' : 'off');
    }

    shouldView() {
        if (!this.enabled) return false;
        const now = Date.now();
        if (now - this.lastViewTime < this.rateLimitDelay) return false;
        return true;
    }

    randomEmoji() {
        return REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
    }

    async handleStatus(sock, message) {
        if (!this.enabled) return false;
        if (!this.shouldView()) return false;

        const key = message.key;
        const sender = key.participant || key.remoteJid;

        try {
            await sock.readMessages([key]);
        } catch {
            try {
                const participant = key.participant || sender;
                await sock.sendReceipt(key.remoteJid, participant, [key.id], 'read');
            } catch {
                return false;
            }
        }

        this.lastViewTime = Date.now();
        this.totalViewed++;

        if (this.reactEnabled) {
            try {
                const emoji = this.randomEmoji();
                await sock.sendMessage(key.remoteJid, {
                    react: { text: emoji, key: key }
                }, { statusJidList: [sender] });
                this.totalReacted++;
            } catch {}
        }

        return true;
    }

    getStats() {
        return {
            autoview: this.enabled,
            autoreact: this.reactEnabled,
            totalViewed: this.totalViewed,
            totalReacted: this.totalReacted
        };
    }
}

const autoViewManager = new AutoViewManager();
module.exports = { autoViewManager };
