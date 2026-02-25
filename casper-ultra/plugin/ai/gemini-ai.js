module.exports = {
    type: 'ai',
    command: ['gemini-ai'],
    operate: async (context) => {
        const { text, reply, xcasper, m, prefix, command, fs, axios, uploadFile, quoted } = context;

        const isQuotedImage = m.quoted && m.quoted.mtype === 'imageMessage';
        const isImage = m.mtype === 'imageMessage';
        const quotedMsg = m.quoted ? m.quoted : m;
        if (isImage || isQuotedImage) {
            try {
                const mediaPath = await xcasper.downloadAndSaveMediaMessage(quotedMsg);
                const media = fs.readFileSync(mediaPath);
                const uploadedImageUrl = await uploadFile(media);
                console.log('Image uploaded successfully:', uploadedImageUrl);
                const apiUrl = `https://gemini-api-5k0h.onrender.com/gemini/image`;
                const params = { q: 'What is this picture? Please describe it.', url: uploadedImageUrl };
                const response = await axios.get(apiUrl, { params });
                const description = response.data?.content || 'Failed to get image description.';
                await xcasper.sendMessage(m.chat, { text: `📷 *Image Description:*\n${description}` }, { quoted: m });
                fs.unlinkSync(mediaPath);
            } catch (error) {
                console.error('Image description error:', error);
                await xcasper.sendMessage(m.chat, { text: '❌ An error occurred while processing the image.' }, { quoted: m });
            }
        } else {
            try {
                if (!text) return reply(`Example: ${prefix+command} Who is Jokowi`);
                reply(global.mess.wait)
                const apiUrl = `https://gemini-api-5k0h.onrender.com/gemini/chat`;
                const params = { q: text };
                const response = await axios.get(apiUrl, { params });
                const replyText = response.data?.content || 'Failed to get AI response.';
                await xcasper.sendMessage(m.chat, { text: `🤖 *AI Gemini:*\n${replyText}` }, { quoted: m });
            } catch (error) {
                console.error('Error Gemini Chat:', error);
                await xcasper.sendMessage(m.chat, { text: '❌ An error occurred while processing AI request.' }, { quoted: m });
            }
        }
    }
}
