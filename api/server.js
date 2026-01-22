export default async function handler(req, res) {
    // 1. إعدادات الوصول (CORS) للسماح للمتصفح بالاتصال بالسيرفر
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // التعامل مع طلبات التحقق المبدئية (Pre-flight requests)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ reply: "عذراً، يجب استخدام طريقة POST فقط." });
    }

    try {
        const { message, system } = req.body;
        
        // 2. جلب المفتاح السري لـ Gemini من إعدادات Vercel
        // تأكد أنك سميته GEMINI_API_KEY في Vercel
        const apiKey = process.env.GEMINI_API_KEY; 

        if (!apiKey) {
            return res.status(500).json({ reply: "خطأ: لم يتم العثور على مفتاح GEMINI_API_KEY في إعدادات Vercel." });
        }

        // 3. رابط الاتصال بمحرك Gemini 1.5 Flash المجاني
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // 4. إرسال الطلب إلى جوجل
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `System Instruction: ${system}\n\nUser Question: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // 5. استخراج الرد وإرساله للمتصفح
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: aiReply });
        } else {
            console.error("Gemini API Error:", data);
            res.status(500).json({ reply: "نعتذر، محرك Gemini لم يستطع معالجة هذا الطلب حالياً." });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ reply: "حدث خطأ داخلي في السيرفر: " + error.message });
    }
}
