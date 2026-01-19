// استيراد fetch بالشكل الصحيح مع node-fetch v3
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. إعدادات CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'الطريقة غير مسموح بها' });
    }

    try {
        const { message, system } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({ 
                reply: "السيرفر متصل! لكن يرجى إضافة OPENAI_API_KEY في إعدادات Vercel." 
            });
        }

        // طلب OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: system || "You are G CAZ AI, an expert medical assistant." },
                    { role: "user", content: message }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        const data = await response.json();

        if (data?.choices?.length) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            return res.status(200).json({ reply: "تم الاتصال، لكن OpenAI لم يرد. تأكد من مفتاح API ورصيد الحساب." });
        }

    } catch (error) {
        return res.status(500).json({ reply: "حدث خطأ فني في السيرفر: " + error.message });
    }
}
