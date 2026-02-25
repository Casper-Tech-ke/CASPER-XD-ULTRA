module.exports = {
    type: 'owner',
    command: ['settimezone', 'settz', 'timezone', 'tz'],
    operate: async (context) => {
        const { managerCasper, reply, prefix, command, text, moment } = context
        
        if (!managerCasper) return reply(global.mess.OnlyOwner)
        if (!text) return reply(`Current timezone: *${global.botTimezone}*\n\nUsage: ${prefix + command} <city>\n\nExamples:\n• ${prefix + command} Nairobi\n• ${prefix + command} Lagos\n• ${prefix + command} London\n• ${prefix + command} New York\n• ${prefix + command} Tokyo`)
        const cityInput = text.trim()
        const allZones = moment.tz.names()
        let matchedZone = allZones.find(z => z.toLowerCase() === cityInput.toLowerCase().replace(/ /g, '_'))
        if (!matchedZone) {
          matchedZone = allZones.find(z => {
            const city = z.split('/').pop().replace(/_/g, ' ')
            return city.toLowerCase() === cityInput.toLowerCase()
          })
        }
        if (!matchedZone) {
          const suggestions = allZones
            .filter(z => z.split('/').pop().replace(/_/g, ' ').toLowerCase().includes(cityInput.toLowerCase()))
            .slice(0, 5)
            .map(z => z.split('/').pop().replace(/_/g, ' '))
          let msg = `*${cityInput}* is not a valid city.\n\n`
          if (suggestions.length > 0) {
            msg += `Did you mean:\n${suggestions.map(s => `• ${s}`).join('\n')}`
          } else {
            msg += `Please provide a valid city name like: Nairobi, Lagos, London, Cairo, Tokyo`
          }
          return reply(msg)
        }
        global.botTimezone = matchedZone
        global.db.settings.set('timezone', matchedZone)
        const now = moment().tz(matchedZone).format('hh:mm:ss A')
        const cityName = matchedZone.split('/').pop().replace(/_/g, ' ')
        reply(`Timezone set to *${cityName}* (${matchedZone})\n\nCurrent time: *${now}*`)
    }
}
