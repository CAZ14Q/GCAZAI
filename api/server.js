export default async function handler(req, res) {
    // إعدادات CORS للسماح بالاتصال من موقعك
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { message, system } = req.body;
        // هنا سيقرأ السيرفر المفتاح الذي وضعته في Environment Variables
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
                    { role: "system", content: system || "You are G CAZ AI assistant." },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            // إذا كان هناك خطأ في الرصيد أو المفتاح ستظهر هذه الرسالة
            res.status(200).json({ reply: "تم الاتصال بالسيرفر، ولكن يرجى التأكد من شحن رصيد OpenAI." });
        }
    } catch (error) {
        res.status(200).json({ reply: "خطأ فني في الربط: " + error.message });
    }
}
