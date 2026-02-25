module.exports = {
    type: 'tools',
    command: ['totalfitur'],
    operate: async (context) => {
        const { reply, fs, path } = context
        const totalfitur = () => {
            try {
                const data = fs.readFileSync(path.resolve(__dirname, '../../client.js'), 'utf8')
                const casePattern = /case\s+'([^']+)'/g
                const matches = data.match(casePattern)
                return matches ? matches.length : 0
            } catch (error) { return 0 }
        }
        reply(`Total Bot Features: ${totalfitur()}`)
    }
}
