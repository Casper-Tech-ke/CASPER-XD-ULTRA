module.exports = {
    type: 'ai',
    command: ['poly-ai'],
    operate: async (context) => {
        const { q, reply, axios } = context;

        if (!q) return reply(`_Ask me anything?_`);
        reply(global.mess.wait)
        async function polybuzzAi(prompt) {
            let data = new URLSearchParams();
            data.append('currentChatStyleId', '1');
            data.append('mediaType', '2');
            data.append('needLive2D', '2');
            data.append('secretSceneId', 'wHp7z');
            data.append('selectId', '209837277');
            data.append('speechText', prompt);
            let headers = {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Cookie': 'session=9997156d23496b9ff96fc09d162191f74821790eaa4ecc52096273a60f517ad3',
            };
            try {
                let { data: respon } = await axios.post('https://api.polybuzz.ai/api/conversation/msgbystream', data, { headers });
                const result = respon.split('\n').filter(line => line.trim()).map(line => {
                    try { const json = JSON.parse(line.trim()); return json.content || ''; }
                    catch (e) { console.error("Invalid JSON:", line); return ''; }
                }).join('');
                return result;
            } catch (e) { console.error(e); return null; }
        }
        try {
            const answer = await polybuzzAi(q);
            reply(answer);
        } catch (error) { reply("An error occurred!"); }
    }
}
