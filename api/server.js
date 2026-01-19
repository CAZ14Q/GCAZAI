// استيراد مكتبة fetch بطريقة متوافقة مع Vercel
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
    // 1. إعدادات تصاريح العبور (CORS) - هذه أهم أسطر لفك حظر الاتصال
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // الرد على طلبات المتصفح التمهيدية (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // التأكد من أن الطلب المرسل هو POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'الطريقة غير مسموح بها' });
    }

    try {
        const { message, system } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        // التحقق من وجود المفتاح في إعدادات Vercel
        if (!apiKey) {
            return res.status(200).json({ 
                reply: "السيرفر متصل بنجاح! ولكن يرجى إضافة مفتاح OPENAI_API_KEY في إعدادات Vercel Environment Variables." 
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
                    { role: "system", content: system || "You are G CAZ AI, an expert medical and genomic assistant." },
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        // إرسال الرد النهائي للموقع
        if (data.choices && data.choices[0]) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            console.error("OpenAI Response Error:", data);
            return res.status(200).json({ reply: "تم الاتصال بالسيرفر، ولكن واجهة OpenAI لم ترجع رداً. تأكد من رصيد الحساب وصحة المفتاح." });
        }

    } catch (error) {
        console.error("Server Crash Error:", error);
        return res.status(500).json({ reply: "حدث خطأ فني في السيرفر: " + error.message });
    }
}
