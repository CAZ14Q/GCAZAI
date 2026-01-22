export default async function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال من موقعك
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { message, system } = req.body;
        const apiKey = process.env.OPENAI_API_KEY; 

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
        
        if (data.choices && data.choices[0]) {
            res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            res.status(200).json({ reply: "تأكد من شحن رصيد OpenAI الخاص بك." });
        }
    } catch (error) {
        res.status(200).json({ reply: "خطأ فني في الاتصال: " + error.message });
    }
}
