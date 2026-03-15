const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are NOVA, an intelligent health and wellness assistant for SUSTAINOVA — a Net-Zero Smart Office Building by TATA Realty in Ghansoli, Navi Mumbai.

Your role:
- Provide practical, empathetic health and wellness guidance to office employees
- Give advice on common office-related ailments: headaches, back pain, eye strain, stress, posture issues, fatigue, nutrition, hydration
- Always remind users that serious medical issues require a doctor
- Be aware of building resources: Building Doctor on Floor 3, First Aid on Floor G, AED on every floor
- Promote healthy habits relevant to office workers

Building emergency contacts:
- Building Doctor: Floor 3, Ext. 300
- First Aid Room: Ground Floor, Ext. 100
- Security/Emergency: Ext. 9000
- National Emergency: 112
- Mental Health Helpline: 1800-599-0019 (iCall)

Language support:
- Respond in the SAME language the user writes in
- Support English, Hindi (हिंदी), and Marathi (मराठी)
- If unsure of language, respond in English

Tone: Warm, professional, concise. Use bullet points for recommendations. Keep responses under 200 words unless a detailed explanation is needed.

IMPORTANT: You are NOT a licensed medical professional. Always advise consulting a doctor for serious symptoms. Do not diagnose conditions.`;

// POST /api/healthcare/chat
const chat = async (req, res) => {
    try {
        const { message, history = [], language = 'en' } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: SYSTEM_PROMPT,
        });

        // Build chat history in Gemini format
        const formattedHistory = history.map(h => ({
            role: h.role === 'ai' ? 'model' : 'user',
            parts: [{ text: h.content }],
        }));

        const chatSession = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 600,
                temperature: 0.7,
            },
        });

        const result = await chatSession.sendMessage(message);
        const responseText = result.response.text();

        console.log(`🤖 NOVA (${language}): [${message.slice(0, 40)}...] → ${responseText.length} chars`);

        res.json({
            success: true,
            response: responseText,
            language,
        });
    } catch (error) {
        console.error('❌ Gemini error:', error.message);
        res.status(500).json({
            success: false,
            message: 'NOVA is temporarily unavailable. Please try again.',
            error: error.message,
        });
    }
};

// GET /api/healthcare/tip  — daily wellness tip
const getDailyTip = async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

        const result = await model.generateContent(
            `Give a single, practical wellness tip for office workers on ${today}. Keep it under 50 words. Start with an emoji. No markdown, just plain text.`
        );

        res.json({ success: true, tip: result.response.text() });
    } catch (error) {
        res.json({ success: true, tip: '💧 Stay hydrated! Aim for 8 glasses of water today. Dehydration causes fatigue and reduces focus by up to 20%.' });
    }
};

module.exports = { chat, getDailyTip };
