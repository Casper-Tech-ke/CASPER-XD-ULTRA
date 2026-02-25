module.exports = {
    type: 'owner',
    command: ['addsudo', 'delsudo', 'removesudo', 'listsudo', 'sudos', 'sudo', 'clearsudo'],
    operate: async (context) => {
        const { isOwner, xcasper, reply, q, args, m, sender, from, store, participants } = context

        if (!isOwner) return reply(global.mess.OnlyOwner)

        const command = context.command

        function extractIds(jid) {
            if (!jid) return { phone: null, lid: null }
            if (jid.includes('@lid')) {
                const lidNum = jid.replace('@lid', '').replace(/[^0-9:]/g, '')
                let phone = null
                if (participants && Array.isArray(participants)) {
                    for (const p of participants) {
                        const pLid = (p.lid || '').replace('@lid', '').replace(/[^0-9:]/g, '')
                        if (pLid && pLid === lidNum && p.id && p.id.includes('@s.whatsapp.net')) {
                            phone = p.id.replace('@s.whatsapp.net', '')
                            break
                        }
                    }
                }
                if (!phone && store && store.contacts) {
                    for (const [id, contact] of Object.entries(store.contacts)) {
                        const cLid = (contact.lid || '').replace(/@lid/g, '').replace(/[^0-9:]/g, '')
                        if (cLid && cLid === lidNum && id.includes('@s.whatsapp.net')) {
                            phone = id.replace('@s.whatsapp.net', '')
                            break
                        }
                    }
                }
                return { phone, lid: lidNum }
            }
            const phone = jid.replace(/@s\.whatsapp\.net/g, '').replace(/[^0-9]/g, '')
            let lid = null
            if (participants && Array.isArray(participants)) {
                for (const p of participants) {
                    if (p.id && p.id.replace('@s.whatsapp.net', '') === phone && p.lid) {
                        lid = p.lid.replace('@lid', '').replace(/[^0-9:]/g, '')
                        break
                    }
                }
            }
            if (!lid && store && store.contacts) {
                const contact = store.contacts[`${phone}@s.whatsapp.net`]
                if (contact && contact.lid) {
                    lid = contact.lid.replace(/@lid/g, '').replace(/[^0-9:]/g, '')
                }
            }
            return { phone: phone || null, lid }
        }

        if (command === 'addsudo') {
            let targetJid
            if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.participant
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                targetJid = m.mentionedJid[0]
            } else if (args[0]) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            }

            if (!targetJid) return reply('Usage: .addsudo @user / .addsudo 2547XXXXXXXX / reply to user')

            const { phone, lid } = extractIds(targetJid)
            if (!phone && !lid) return reply('Could not identify user. Try using their phone number:\n• .addsudo 2547XXXXXXXX')

            if (phone && [...global.owner].map(v => v.replace(/[^0-9]/g, '')).includes(phone)) {
                return reply('That number is already an owner, no need to add as sudo')
            }

            if (global.db.sudos.checkAny(phone, lid)) {
                return reply('This user is already a sudo')
            }

            const addedBy = sender.replace(/[^0-9]/g, '')
            global.db.sudos.add(phone, lid, addedBy)

            let name
            const nameJid = phone ? `${phone}@s.whatsapp.net` : (lid ? `${lid}@lid` : null)
            if (nameJid) try { name = await xcasper.getName(nameJid) } catch {}

            const display = name || phone || lid
            reply(`✅ Added *${display}* as sudo user\n\nTotal sudos: ${global.db.sudos.count()}`)

        } else if (command === 'delsudo' || command === 'removesudo') {
            let targetJid
            if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.participant
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                targetJid = m.mentionedJid[0]
            } else if (args[0]) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            }

            if (!targetJid) return reply('Usage: .delsudo @user / .delsudo 2547XXXXXXXX / reply to user')

            const { phone, lid } = extractIds(targetJid)
            const identifier = phone || lid
            if (!identifier) return reply('Could not identify user. Try their phone number:\n• .delsudo 2547XXXXXXXX')

            const removed = global.db.sudos.remove(identifier)
            if (removed) {
                let name
                const nameJid = phone ? `${phone}@s.whatsapp.net` : (lid ? `${lid}@lid` : null)
                if (nameJid) try { name = await xcasper.getName(nameJid) } catch {}
                reply(`✅ Removed *${name || identifier}* from sudo list\n\nTotal sudos: ${global.db.sudos.count()}`)
            } else {
                reply('That user was not a sudo')
            }

        } else if (command === 'listsudo' || command === 'sudos' || command === 'sudo') {
            const sudoList = global.db.sudos.list()
            if (sudoList.length === 0) {
                return reply('No sudo users added yet.\n\nUse .addsudo @user to add one.')
            }

            let text = `👥 *SUDO USERS* (${sudoList.length})\n\n`
            const mentions = []

            for (let i = 0; i < sudoList.length; i++) {
                const s = sudoList[i]
                const phoneJid = s.number ? `${s.number}@s.whatsapp.net` : null
                const lidJid = s.lid ? `${s.lid}@lid` : null
                const mentionJid = lidJid || phoneJid
                if (mentionJid) mentions.push(mentionJid)

                let name
                try { name = await xcasper.getName(mentionJid || phoneJid) } catch {}

                const date = s.added_at ? new Date(s.added_at * 1000).toLocaleDateString() : 'Unknown'

                let addedByName
                if (s.added_by) {
                    try { addedByName = await xcasper.getName(`${s.added_by}@s.whatsapp.net`) } catch { addedByName = s.added_by }
                }

                const mentionTag = mentionJid ? `@${mentionJid.split('@')[0]}` : (s.number || s.lid)
                const displayName = name && name !== mentionTag ? ` (${name})` : ''

                text += `${i + 1}. ${mentionTag}${displayName}\n   Added by: ${addedByName || s.added_by || 'Unknown'}\n   Date: ${date}\n\n`
            }
            text += `Commands:\n• .addsudo @user\n• .delsudo @user\n• .clearsudo`

            await xcasper.sendMessage(from, {
                text: text,
                mentions: mentions
            }, { quoted: m })

        } else if (command === 'clearsudo') {
            const count = global.db.sudos.count()
            if (count === 0) return reply('No sudo users to clear')
            global.db.sudos.clear()
            reply(`✅ Cleared all ${count} sudo users`)
        }
    }
}
