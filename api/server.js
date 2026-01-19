const fetch = require('node-fetch');

export default async function handler(req, res) {
    // 1. إعدادات CORS للسماح بالاتصال من أي مكان (خصوصاً GitHub Pages)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 2. التعامل مع طلبات OPTIONS (المتصفح يرسلها للتأكد من الأمان)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. التأكد أن الطلب من نوع POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'الطريقة غير مسموح بها' });
    }

    try {
        const { message, system } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        // التحقق من وجود مفتاح OpenAI
        if (!apiKey) {
            return res.status(500).json({ reply: "خطأ: مفتاح OpenAI API غير مضبوط في إعدادات Vercel." });
        }

        // 4. الاتصال الفعلي بـ OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: system || "You are G CAZ AI, a medical and genomic assistant." },
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        // 5. إرجاع الرد للموقع
        if (data.choices && data.choices[0]) {
            return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            console.error("OpenAI Error:", data);
            return res.status(500).json({ reply: "حدث خطأ في استجابة OpenAI، تأكد من الرصيد." });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ reply: "حدث خطأ فني في السيرفر الخاص بك." });
    }
}
