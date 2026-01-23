export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { message, system } = req.body;
        const apiKey = process.env.GEMINI_API_KEY; 

        // التعديل هنا: استخدمنا gemini-1.5-flash-latest لضمان التوافق
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${system}\n\nUser Question: ${message}` }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(200).json({ reply: "خطأ من جوجل: " + data.error.message });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "المحرك مشغول حالياً، يرجى المحاولة بعد لحظات.";
        res.status(200).json({ reply: reply });

    } catch (error) {
        res.status(200).json({ reply: "حدث خطأ في الاتصال بسيرفر CAZAI." });
    }
}
