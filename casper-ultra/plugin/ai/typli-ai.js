module.exports = {
    type: 'ai',
    command: ['typli-ai'],
    operate: async (context) => {
        const { q, reply, axios } = context;

        if (!q) return reply(`_Ask me anything?_`);
        reply(global.mess.wait)
        const avz = async (prompt) => {
            const data = { prompt: prompt, temperature: 1.2 };
            const config = {
                method: 'post', url: 'https://typli.ai/api/generators/completion',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                data: JSON.stringify(data)
            };
            try {
                const response = await axios(config);
                return response.data;
            } catch (error) {
                console.error("Fetch error:", error.response ? error.response.data : error.message);
                throw error;
            }
        };
        try {
            const answer = await avz(q);
            reply(answer);
        } catch (error) {
            reply("An error occurred!");
        }
    }
}
