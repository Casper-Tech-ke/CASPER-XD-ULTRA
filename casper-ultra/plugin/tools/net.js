module.exports = {
    type: 'tools',
    command: ['myip', 'ipbot', 'ipwhois'],
    operate: async (context) => {
        const { command, text, prefix, reply, managerCasper, fetchJson } = context
        const http = require('http')
        const mess = global.mess

        if (command === 'myip' || command === 'ipbot') {
            if (!managerCasper) return reply(mess.OnlyOwner)
            http.get({ 'host': 'api.ipify.org', 'port': 80, 'path': '/' }, function(resp) {
                resp.on('data', function(ip) {
                    reply("🔎 Here's the bot's public IP address: " + ip)
                })
            })
        } else if (command === 'ipwhois') {
            if (!text) return reply(`*Example :*\n\n${prefix + command} 114.5.213.103`)
            reply(mess.wait)
            const ip = text.trim()
            const apiUrl = `https://ipwho.is/${ip}`
            try {
                reply("🔍 Searching for information, please wait...")
                const data = await fetchJson(apiUrl)
                if (data.success) {
                    const flagEmoji = data.flag?.emoji || "🏳️"
                    let messageText = "📍 *IP Whois Information*\n"
                    messageText += `🌐 *IP Address*: ${data.ip}\n`
                    messageText += `🗺️ *Type*: ${data.type}\n`
                    messageText += `🌍 *Continent*: ${data.continent} (${data.continent_code})\n`
                    messageText += `🇨🇺 *Country*: ${data.country} (${data.country_code}) ${flagEmoji}\n`
                    messageText += `🏙️ *City*: ${data.city}, ${data.region} (${data.region_code})\n`
                    messageText += `📞 *Calling Code*: +${data.calling_code}\n`
                    messageText += `🕒 *ID*: ${data.timezone?.id || "Not available"}\n`
                    messageText += `🕒 *UTC*: ${data.timezone?.utc || "Not available"}\n`
                    messageText += `🕒 *Current Time*: ${data.timezone?.current_time || "Not available"}\n`
                    reply(messageText)
                } else {
                    reply(`❌ Unable to find information for IP: ${ip}`)
                }
            } catch (error) {
                console.error("Error:", error)
                reply("❌ An error occurred while fetching IP information.")
            }
        }
    }
}
