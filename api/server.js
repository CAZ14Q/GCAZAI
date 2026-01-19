const fetch = require('node-fetch');

export default async function handler(req, res) {
    // إعدادات السماح بالاتصال (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { message, system } = req.body;
        // سيتم جلب المفتاح من إعدادات Vercel للأمان
        const apiKey = process.env.OPENAI_API_KEY; 

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo", // أو gpt-4o حسب رغبتك
                    messages: [
                        { role: "system", content: system },
                        { role: "user", content: message }
                    ]
                })
            });

            const data = await response.json();
            const aiReply = data.choices[0].message.content;

            return res.status(200).json({ reply: aiReply });
        } catch (error) {
            return res.status(500).json({ error: "خطأ في الاتصال بـ OpenAI" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
