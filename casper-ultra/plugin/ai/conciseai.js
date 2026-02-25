require('../../setting')
const crypto = require('crypto')

function generateId() {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
}

module.exports = {
    type: 'ai',
    command: ['conciseai'],
    operate: async (context) => {
        const { args, reply, axios } = context;

        const chatAI = async text => {
            let user_id = generateId()
            let lastMsg = `USER: ${text}`
            let signature = crypto.createHmac('sha256', 'CONSICESIGAIMOVIESkjkjs32120djwejk2372kjsajs3u293829323dkjd8238293938wweiuwe')
                .update(user_id + lastMsg + 'normal')
                .digest('hex')
            let form = new URLSearchParams({
                question: lastMsg,
                conciseaiUserId: user_id,
                signature,
                previousChats: JSON.stringify([{ a: '', b: lastMsg, c: false }]),
                model: 'normal'
            })
            let { data } = await axios.post('https://toki-41b08d0904ce.herokuapp.com/api/conciseai/chat', form.toString(), {
                headers: {
                    'User-Agent': 'okhttp/4.10.0',
                    'Connection': 'Keep-Alive',
                    'Accept-Encoding': 'gzip',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            return data.answer
        }
        try {
            if (!args.length) throw 'Enter your question'
            reply(global.mess.wait)
            reply(await chatAI(args.join(' ')))
        } catch (e) {
            reply(e.message || e)
        }
    }
}
