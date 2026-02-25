module.exports = {
    type: 'ai',
    command: ['gpt-4o'],
    operate: async (context) => {
        const { text, reply, axios, prefix, command } = context;

        if (!text) return reply(`Example:\n${prefix+command} What is ChatGPT`);
        reply(global.mess.wait)
        async function fetchWithModel(content, model, token) {
            try {
                const response = await axios.post('https://luminai.my.id/', {
                    content, model, headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(response.data);
                return response.data;
            } catch (error) { console.error(error); throw error; }
        }
        fetchWithModel(text, 'gpt-4o', '8be9e34764cd2fc4e6bcfb1bf6a945efe30406573a92d8ef0ec1613dc0e54876')
            .then(data => { const textl = data.result; reply(textl); })
            .catch(error => console.error(error));
    }
}
