module.exports = {
    type: 'ai',
    command: ['gptturbo'],
    operate: async (context) => {
        const { text, reply, fetch, xcasper, m, prefix, command } = context;

        async function gptturbo(query) {
            const apiUrl = `https://restapii.rioooxdzz.web.id/api/gptturbo?message=${encodeURIComponent(query)}`;
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36" }
                });
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const responseJson = await response.json();
                if (responseJson && responseJson.data.response) return responseJson.data.response;
                else return "No message in response.";
            } catch (error) {
                console.error("An error occurred:", error.message);
                return "Failed to get response from server.";
            }
        }

        if (!text) return reply(`Example:\n${prefix+command} Hello?`);
        reply(global.mess.wait)
        let gpiti = await gptturbo(text);
        let turbo = `Title : ${text}\n\nMessage : ${gpiti}\n`;
        await xcasper.sendMessage(m.chat, {
            text: "⬣───「 *G P T T U R B O* 」───⬣" + "\n\n" + turbo,
            contextInfo: {
                externalAdreply: {
                    title: "GPT - TURBO", body: '',
                    thumbnailUrl: "https://pomf2.lain.la/f/jzv6iqu.jpg",
                    sourceUrl: null, mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
}
