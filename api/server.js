// استيراد مكتبة fetch بطريقة تضمن العمل 100% على Vercel
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
    // 1. إعدادات CORS الشاملة (لفك حظر المتصفح نهائياً)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // السماح لـ GitHub Pages بالوصول
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // الرد على طلب "جس النبض" (Preflight) من المتصفح
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

        // التحقق من مفتاح API في Vercel
        if (!apiKey) {
            return res.status(200).json({ 
                reply: "السيرفر متصل! لكن يرجى إضافة OPENAI_API_KEY في إعدادات Vercel." 
            });
        }

        // 2. طلب معالجة البيانات من OpenAI
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
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            return res.status(200).json({ reply: "تم الاتصال، لكن OpenAI لم يرد. قد تكون مشكلة رصيد أو مفتاح." });
        }

    } catch (error) {
        return res.status(500).json({ reply: "حدث خطأ فني في السيرفر: " + error.message });
    }
}
