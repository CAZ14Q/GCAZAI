// استخدام require لضمان التوافق مع بيئة Vercel
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
    // 1. أهم خطوة: تصاريح العبور (CORS) لفك حظر المتصفح
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // الرد على طلب التأكد من الأمان (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, system } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({ reply: "السيرفر متصل، لكن مفتاح OpenAI غير مضاف في Vercel." });
        }

        // 2. الاتصال بـ OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: system || "You are G CAZ AI, medical assistant." },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            return res.status(200).json({ reply: "وصلت للسيرفر، لكن OpenAI لديه مشكلة في الرصيد أو المفتاح." });
        }

    } catch (error) {
        // إذا حدث خطأ، سنرسل رسالة واضحة بدلاً من الانهيار
        return res.status(200).json({ reply: "السيرفر يعمل، لكن حدث خطأ في معالجة الطلب: " + error.message });
    }
}
