module.exports = {
    type: 'owner',
    command: ['owner', 'botowner'],
    operate: async (context) => {
        const { generateWAMessageFromContent, proto, m, xcasper } = context
        
        let namaown = `XyrooRynzz`
        var contact = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
            "contactMessage": {
                "displayName": `${namaown}`,
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:XyrooRynzz\nitem1.TEL;waid=6281543496975:+6281543496975\nitem1.X-ABLabel:Ponsel\nX-WA-BIZ-DESCRIPTION:${global.ownername}\nX-WA-BIZ-NAME: ${namaown}\nEND:VCARD`,
            }
        }), { userJid: m.chat, quoted: m })
        xcasper.relayMessage(m.chat, contact.message, { messageId: contact.key.id })
    }
}
