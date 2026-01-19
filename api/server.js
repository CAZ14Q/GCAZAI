export default async function handler(req, res) {
    // إعدادات CORS الشاملة لفك حظر المتصفح نهائياً
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // الرد على طلبات المتصفح التمهيدية
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { message, system } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({ reply: "السيرفر متصل! يرجى إضافة OPENAI_API_KEY في إعدادات Vercel." });
        }

        // طلب البيانات من OpenAI باستخدام المحرك الحديث
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: system || "You are G CAZ AI, a medical assistant." },
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const aiReply = data.choices ? data.choices[0].message.content : "تأكد من رصيد حسابك في OpenAI.";

        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(200).json({ reply: "حدث خطأ فني: " + error.message });
    }
}
