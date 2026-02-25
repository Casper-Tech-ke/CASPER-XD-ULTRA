require('../../setting')

module.exports = {
    type: 'ai',
    command: ['aivelyn', 'velynai'],
    operate: async (context) => {
        const { text, reply, fetch } = context;

        if (!text) return reply('Enter your question?');
        reply(global.mess.wait)
        try {
            const url = `https://www.velyn.biz.id/api/ai/velyn-1.0-1b?prompt=${encodeURIComponent(text)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            const result = data.result || "Sorry, no answer available.";
            return reply(result);
        } catch (error) {
            console.error("An error occurred:", error);
            return reply("Sorry, an error occurred while contacting AI.");
        }
    }
}
