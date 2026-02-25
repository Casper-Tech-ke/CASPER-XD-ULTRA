require('../../setting')

let JSDOM, FormData
try { JSDOM = require('jsdom').JSDOM } catch (e) {}
try { FormData = require('form-data') } catch (e) {}

module.exports = {
    type: 'ai',
    command: ['claudeai'],
    operate: async (context) => {
        const { text, reply, fetch } = context;

        if (!text) return reply(`Enter your question?`)
        reply(global.mess.wait)
        try {
            if (!JSDOM) return reply('❌ JSDOM module is not installed.')
            if (!FormData) return reply('❌ form-data module is not installed.')

            const headers = {
                'Accept': '*/*',
                'Referer': 'https://claudeai.one/',
                'Origin': 'https://claudeai.one',
                'User-Agent': 'Mozilla/5.0'
            }
            const res = await fetch('https://claudeai.one/', { headers })
            const html = await res.text()
            const dom = new JSDOM(html)
            const doc = dom.window.document
            const nonce = doc.querySelector('[data-nonce]')?.getAttribute('data-nonce') || ''
            const postId = doc.querySelector('[data-post-id]')?.getAttribute('data-post-id') || ''
            const botId = doc.querySelector('[data-bot-id]')?.getAttribute('data-bot-id') || ''
            const clientId = html.match(/localStorage\.setItem['"]wpaicg_chat_client_id['"],\s*['"](.+?)['"]/)?.[1] ||
                'JHFiony-' + Math.random().toString(36).substring(2, 12)
            const form = new FormData()
            form.append('_wpnonce', nonce)
            form.append('post_id', postId)
            form.append('url', 'https://claudeai.one')
            form.append('action', 'wpaicg_chat_shortcode_message')
            form.append('message', text)
            form.append('bot_id', botId)
            form.append('chatbot_identity', 'shortcode')
            form.append('wpaicg_chat_history', '[]')
            form.append('wpaicg_chat_client_id', clientId)
            const resPost = await fetch('https://claudeai.one/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: { ...headers, ...form.getHeaders() },
                body: form
            })
            const json = await resPost.json()
            const jawaban = json?.data
            if (!jawaban) return reply('[!] Failed to get reply from Claude.')
            await reply(jawaban)
        } catch (e) {
            await reply('An error occurred:\n' + JSON.stringify(e.message || e, null, 2))
        }
    }
}
