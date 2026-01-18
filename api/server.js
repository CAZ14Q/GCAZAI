export default async function handler(req, res) {
    // هذا السطر يربط السيرفر بالمفتاح السري اللي حطيته في Vercel
    const apiKey = process.env.OPENAI_API_KEY;

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { message } = req.body;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'خطأ من OpenAI');
        }

        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "تعذر الاتصال بالذكاء الاصطناعي" });
    }
}
