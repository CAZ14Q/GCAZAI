export default async function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { message, system } = req.body;
        // قراءة مفتاح Gemini من إعدادات Vercel
        const apiKey = process.env.GEMINI_API_KEY; 

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `System Instruction: ${system}\n\nUser Question: ${message}` }] }]
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "نعتذر، لم نتمكن من تحليل البيانات حالياً.";

        res.status(200).json({ reply: reply });
    } catch (error) {
        res.status(200).json({ reply: "خطأ في الاتصال بمحرك Gemini المجاني: " + error.message });
    }
}
