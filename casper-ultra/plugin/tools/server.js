module.exports = {
    type: 'tools',
    command: ['ping', 'info', 'storage', 'server', 'srvinfo'],
    operate: async (context) => {
        const { xcasper, m, os, nou, runtime } = context

        function formatp(bytes) {
            if (bytes < 1024) return `${bytes} B`
            const kb = bytes / 1024
            if (kb < 1024) return `${kb.toFixed(2)} KB`
            const mb = kb / 1024
            if (mb < 1024) return `${mb.toFixed(2)} MB`
            const gb = mb / 1024
            return `${gb.toFixed(2)} GB`
        }

        async function getServerInfo() {
            try {
                const start = Date.now()
                const osType = nou.os.type()
                const release = os.release()
                const arch = os.arch()
                const nodeVersion = process.version
                const ip = await nou.os.ip()
                const cpus = os.cpus()
                const cpuModel = cpus[0].model
                const coreCount = cpus.length
                const cpu = cpus.reduce((acc, cpu) => {
                    acc.total += Object.values(cpu.times).reduce((a, b) => a + b, 0)
                    acc.speed += cpu.speed
                    acc.times.user += cpu.times.user
                    acc.times.nice += cpu.times.nice
                    acc.times.sys += cpu.times.sys
                    acc.times.idle += cpu.times.idle
                    acc.times.irq += cpu.times.irq
                    return acc
                }, { speed: 0, total: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } })
                const cpuUsage = ((cpu.times.user + cpu.times.sys) / cpu.total * 100).toFixed(2) + '%'
                const loadAverage = os.loadavg()
                const totalMem = os.totalmem()
                const freeMem = os.freemem()
                const usedMem = totalMem - freeMem
                const storageInfo = await nou.drive.info()
                const latensi = (Date.now() - start) / 1000
                const responseText = `
SERVER INFO
• OS: ${osType} (${release})
• Architecture: ${arch}
• Node.js Version: ${nodeVersion}

CPU SYSTEM
• Model: ${cpuModel}
• Speed: ${cpu.speed} MHz
• CPU Load: ${cpuUsage} (${coreCount} Core)
• Load Average: ${loadAverage.join(', ')}

MEMORY (RAM)
• Total: ${formatp(totalMem)}
• Used: ${formatp(usedMem)}
• Available: ${formatp(freeMem)}

STORAGE
• Total: ${storageInfo.totalGb} GB
• Used: ${storageInfo.usedGb} GB (${storageInfo.usedPercentage}%)
• Available: ${storageInfo.freeGb} GB (${storageInfo.freePercentage}%)

PING
• Latency: ${latensi.toFixed(4)} seconds
• VPS Uptime: ${runtime(os.uptime())}
`
                return responseText.trim()
            } catch (error) {
                console.error('Error getting server information:', error)
                return 'An error occurred while getting server information.'
            }
        }

        const responseText = await getServerInfo()
        await xcasper.sendMessage(m.chat, { text: responseText }, { quoted: m })
    }
}
