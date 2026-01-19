const fetch = require('node-fetch');

export default async function handler(req, res) {
    // 1. إعدادات CORS للسماح لموقعك على GitHub بالاتصال بالسيرفر
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // التعامل مع طلبات التحقق من الاتصال (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. معالجة طلب المحادثة
    if (req.method === 'POST') {
        try {
            const { message, system } = req.body;
            const apiKey = process.env.OPENAI_API_KEY;

            // التحقق من وجود المفتاح السري
            if (!apiKey) {
                return res.status(500).json({ reply: "خطأ: مفتاح API غير معرف في إعدادات Vercel." });
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo", // يمكنك تغييره لـ gpt-4o إذا كان حسابك يدعمه
                    messages: [
                        { role: "system", content: system || "You are a helpful assistant." },
                        { role: "user", content: message }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();

            // التحقق من رد OpenAI
            if (data.choices && data.choices[0]) {
                return res.status(200).json({ reply: data.choices[0].message.content });
            } else {
                console.error("OpenAI Error:", data);
                return res.status(500).json({ reply: "حدث خطأ في معالجة الرد من ذكاء OpenAI الاصطناعي." });
            }

        } catch (error) {
            console.error("Server Error:", error);
            return res.status(500).json({ reply: "حدث خطأ داخلي في السيرفر أثناء محاولة الاتصال." });
        }
    }

    // إذا كان نوع الطلب غير POST
    return res.status(405).json({ reply: "Method Not Allowed" });
}
