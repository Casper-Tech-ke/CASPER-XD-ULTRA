module.exports = {
    type: 'owner',
    command: ['infobot', 'botinfo'],
    operate: async (context) => {
        const { reply, runtime, fs, path } = context
        
        reply(global.mess.wait)
        const totalfitur = () => {
          try {
            const data = fs.readFileSync(path.resolve(__dirname, '../../client.js'), 'utf8');
            const casePattern = /case\s+'([^']+)'/g;
            const matches = data.match(casePattern);
            return matches ? matches.length : 0;
          } catch (error) { return 0; }
        }
        const botInfo = `
╭─ ⌬ Bot Info
│ • Name    : ${global.botname}
│ • Owner   : ${global.ownername}
│ • Version  : ${global.botver}
│ • Command : ${totalfitur()}
│ • Runtime  : ${runtime(process.uptime())}\n╰─────────────
`
        reply(botInfo)
    }
}
