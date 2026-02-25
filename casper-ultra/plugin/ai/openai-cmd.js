require('../../setting')

module.exports = {
    type: 'ai',
    command: ['openai'],
    operate: async (context) => {
        const { text, prefix, command, reply, pushname } = context;

        const OpenAIPrompt = `Hello ${pushname}, let me introduce myself, I am ${global.botname} and my model is OpenAI GPT - 4.1, I am here to help you.`;
        const OpenAI = require("openai");
        const token = "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";
        const endpoint = "https://models.github.ai/inference";
        const model = "openai/gpt-4.1";
        async function openai(userPrompt) {
            const client = new OpenAI({ baseURL: endpoint, apiKey: token });
            const response = await client.chat.completions.create({
                messages: [
                    { role: "system", content: OpenAIPrompt.trim() },
                    { role: "user", content: userPrompt }
                ],
                temperature: 1, top_p: 1, model: model
            });
            return response.choices[0].message.content.replace(/\*\*(.*?)\*\*/g, '*$1*');
        }
        if (!text) return reply(`Example: ${prefix+command} Who invented football`);
        reply(global.mess.wait)
        try {
            const hasil = await openai(text);
            reply(hasil);
        } catch (e) {
            console.error(e);
            reply('❌ Sorry, the AI is currently unavailable... please try again later.');
        }
    }
}
