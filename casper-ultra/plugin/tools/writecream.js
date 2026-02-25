module.exports = {
    type: 'tools',
    command: ['writecream'],
    operate: async (context) => {
        const { text, prefix, command, reply, fetch } = context
        if (!text) return reply(`Enter your question\nExample: ${prefix+command} you are a psychologist|I often feel anxious at night, why?`)
        reply(global.mess.wait)
        const [logic, question] = text.split('|').map(v => v.trim())
        if (!logic || !question) return reply(`Wrong format\nExample: ${prefix+command} persona|question`)

        async function writecream(logic, question) {
            const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat"
            const query = [
                { role: "system", content: logic },
                { role: "user", content: question }
            ]
            const params = new URLSearchParams({ query: JSON.stringify(query), link: "writecream.com" })
            try {
                const response = await fetch(`${url}?${params.toString()}`)
                const data = await response.json()
                let raw = data.response_content || data.reply || data.result || data.text || ''
                let cleaned = raw.replace(/\\n/g, '\n').replace(/\n{2,}/g, '\n\n').replace(/\*\*(.*?)\*\*/g, '*$1*')
                return cleaned.trim()
            } catch (error) {
                return `Failed to fetch response: ${error.message}`
            }
        }

        const response = await writecream(logic, question)
        reply(response || 'No response.')
    }
}
