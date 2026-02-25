const { sendInteractiveMessage } = require('gifted-btns')
const { generateWAMessageContent, generateWAMessageFromContent } = require('baileys')

async function sendButtons(sock, jid, content = {}, options = {}) {
    const { text = '', footer = '', buttons = [], title = '', image = '' } = content

    if (image) {
        try {
            const media = await generateWAMessageContent(
                { image: { url: image } },
                { upload: sock.waUploadToServer }
            )
            return await sendInteractiveMessage(sock, jid, {
                interactiveMessage: {
                    header: {
                        title: title || '',
                        hasMediaAttachment: true,
                        imageMessage: media.imageMessage
                    },
                    body: { text },
                    footer: { text: footer },
                    nativeFlowMessage: {
                        buttons: buttons
                    }
                }
            }, options)
        } catch (e) {
        }
    }

    const interactiveContent = {
        text,
        footer,
        interactiveButtons: buttons
    }

    if (title) {
        interactiveContent.title = title
    }

    return await sendInteractiveMessage(sock, jid, interactiveContent, options)
}

async function sendCarousel(sock, jid, content = {}, options = {}) {
    const { text = '', footer = '', cards = [] } = content

    const builtCards = await Promise.all(
        cards.map(async (card) => {
            const cardObj = {
                body: { text: card.text || '' },
                footer: { text: card.footer || footer },
                nativeFlowMessage: {
                    buttons: card.buttons || []
                }
            }

            if (card.image) {
                try {
                    cardObj.header = {
                        title: card.title || '',
                        hasMediaAttachment: true,
                        imageMessage: (
                            await generateWAMessageContent(
                                { image: { url: card.image } },
                                { upload: sock.waUploadToServer }
                            )
                        ).imageMessage
                    }
                } catch (e) {
                    if (card.title) {
                        cardObj.header = { title: card.title, hasMediaAttachment: false }
                    }
                }
            } else if (card.title) {
                cardObj.header = { title: card.title, hasMediaAttachment: false }
            }

            return cardObj
        })
    )

    const message = generateWAMessageFromContent(
        jid,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: { text },
                        footer: { text: footer },
                        carouselMessage: { cards: builtCards }
                    }
                }
            }
        },
        { quoted: options.quoted || null }
    )

    await sock.relayMessage(jid, message.message, {
        messageId: message.key.id
    })

    return message
}

module.exports = { sendButtons, sendCarousel }
