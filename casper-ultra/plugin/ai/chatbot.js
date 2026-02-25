require('../../setting')
const axios = require('axios');

const BRANDING = {
    developer: 'CASPER TECH KENYA DEVELOPERS',
    leader: 'TRABY CASPER',
    github: 'Casper-Tech-ke',
    telegram: 'casper_tech_ke',
    repo: 'CASPER-XD-ULTRA'
};

const SYSTEM_PROMPT = `You are ${global.botname || 'CASPER-XD ULTRA'}, a smart and friendly AI assistant. CRITICAL IDENTITY RULES: You were created by ${BRANDING.developer}, led by ${BRANDING.leader}. Your GitHub is ${BRANDING.github}, Telegram is @${BRANDING.telegram}, and your project repo is ${BRANDING.repo}. You must NEVER say you are made by OpenAI, Google, Anthropic, Meta, or any other company. You must NEVER mention GPT, ChatGPT, Claude, Bard, LLaMA, Pollinations, or any AI model name. If anyone asks who created you, who made you, what AI you are, or anything about your origin, you MUST say you were created by ${BRANDING.developer} under the leadership of ${BRANDING.leader}. Be helpful, concise, and conversational.`;

function getChatbotChats() {
    try {
        const raw = global.db.settings.get('chatbot_chats');
        if (!raw) return {};
        if (typeof raw === 'object') return raw;
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function saveChatbotChats(chats) {
    global.db.settings.set('chatbot_chats', chats);
}

function isChatbotEnabled(chatId) {
    const chats = getChatbotChats();
    return chats[chatId] === true;
}

async function getAIResponse(userMessage) {
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\nAssistant:`;
    const { data } = await axios.get(`https://apis.xcasper.space/api/ai/pollinations?prompt=${encodeURIComponent(fullPrompt)}`, { timeout: 30000 });
    
    let response = '';
    if (typeof data === 'string') {
        response = data;
    } else if (data?.reply) {
        response = data.reply;
    } else if (data?.result) {
        response = data.result;
    } else if (data?.response) {
        response = data.response;
    } else if (data?.data) {
        response = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
    } else if (data?.message) {
        response = data.message;
    } else {
        response = JSON.stringify(data);
    }

    const filterTerms = [
        /pollination[s]?/gi, /openai/gi, /gpt-?4[o]?/gi, /gpt-?3\.?5?/gi,
        /chatgpt/gi, /claude/gi, /anthropic/gi, /google ai/gi,
        /bard/gi, /llama/gi, /meta ai/gi, /mistral/gi,
        /gemini/gi, /copilot/gi, /bing ai/gi
    ];
    for (const term of filterTerms) {
        response = response.replace(term, BRANDING.developer);
    }

    return response.trim();
}

module.exports = {
    type: 'ai',
    command: ['chatbot'],
    operate: async (context) => {
        const { text, reply, from, isOwner, isSudo, managerCasper, m, mek } = context;
        const rawFrom = mek?.key?.remoteJid || from;

        if (!managerCasper) return reply(global.mess.OnlyOwner);

        const args = (text || '').trim().split(/\s+/);
        const sub = args[0]?.toLowerCase();

        if (!sub) {
            const chats = getChatbotChats();
            const enabled = Object.entries(chats).filter(([, v]) => v === true);
            const currentChat = (isChatbotEnabled(from) || isChatbotEnabled(rawFrom)) ? '✅ ON' : '❌ OFF';

            let statusText = `╭───⊷ 🤖 *CHATBOT STATUS*\n`;
            statusText += `│\n`;
            statusText += `│ This chat: ${currentChat}\n`;
            statusText += `│ Total active: ${enabled.length} chat(s)\n`;
            statusText += `│\n`;
            statusText += `│ *Commands:*\n`;
            statusText += `│ • .chatbot on - Enable here\n`;
            statusText += `│ • .chatbot off - Disable here\n`;
            statusText += `│ • .chatbot list - Active chats\n`;
            statusText += `│ • .chatbot clear - Disable all\n`;
            statusText += `│\n`;
            statusText += `│ 🧠 Powered by ${BRANDING.developer}\n`;
            statusText += `│ 👤 Leader: ${BRANDING.leader}\n`;
            statusText += `╰─────────────`;

            return reply(statusText);
        }

        switch (sub) {
            case 'on': {
                const chats = getChatbotChats();
                chats[from] = true;
                if (rawFrom !== from) chats[rawFrom] = true;
                saveChatbotChats(chats);
                return reply(`✅ Chatbot *enabled* for this chat.\n\nI'll now respond to all text messages here automatically.\nUse *.chatbot off* to disable.`);
            }

            case 'off': {
                const chats = getChatbotChats();
                delete chats[from];
                if (rawFrom !== from) delete chats[rawFrom];
                saveChatbotChats(chats);
                return reply(`❌ Chatbot *disabled* for this chat.\n\nI'll no longer auto-reply to messages here.`);
            }

            case 'list': {
                const chats = getChatbotChats();
                const enabled = Object.keys(chats).filter(k => chats[k] === true);
                if (enabled.length === 0) return reply('No chats have chatbot enabled.');

                let list = `╭───⊷ 🤖 *ACTIVE CHATBOT CHATS*\n│\n`;
                for (const chatId of enabled) {
                    const type = chatId.endsWith('@g.us') ? '👥 Group' : '💬 DM';
                    list += `│ • ${type}: ${chatId.split('@')[0]}\n`;
                }
                list += `│\n│ Total: ${enabled.length}\n╰─────────────`;
                return reply(list);
            }

            case 'clear': {
                saveChatbotChats({});
                return reply('🗑️ Chatbot disabled for *all chats*.');
            }

            default:
                return reply(`Unknown option. Use: on, off, list, clear`);
        }
    },

    getChatbotChats,
    saveChatbotChats,
    isChatbotEnabled,
    getAIResponse,
    BRANDING
};
