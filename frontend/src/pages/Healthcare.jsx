import { useState, useEffect, useRef } from 'react';
import { Card, Button, PageHeader, Spinner, Badge } from '../components/ui';
import Layout from '../components/layout/Layout';

const HEALTH_TIPS = [
    { icon: '👁️', label: '20-20-20', msg: 'Tell me about the 20-20-20 rule for eye strain.' },
    { icon: '💧', label: 'Hydration', msg: 'How much water should I drink at work?' },
    { icon: '🧘', label: 'Desk Stretch', msg: 'Give me desk stretches for back pain.' },
    { icon: '🥗', label: 'Healthy Eating', msg: 'Tips for healthy eating at the office.' },
    { icon: '🧠', label: 'Stress Mgmt', msg: 'How to manage workplace stress?' },
];

const AI_RESPONSES = {
    headache: '🤕 For headaches, try the **20-20-20 rule**, drink water, and reduce glare. If it persists >2 hours, visit our **Medical Center on Floor 3, Block A**.',
    back: '🧘 Back pain relief: sit with feet flat, screen at eye level, do Cat-Cow stretches every hour. Our gym on B1 has yoga Tue/Thu!',
    eye: '👁️ **20-20-20 rule:** Every 20 min → look 20 feet away for 20 seconds. Also reduce screen brightness and use blue-light filters.',
    stress: '🧠 Combat stress with **5-5-5 breathing** (inhale 5s, hold 5s, exhale 5s). Our rooftop garden is open 7AM–8PM for nature breaks! 🌿',
    water: '💧 Drink 8 glasses/day. Signs of dehydration: headaches, fatigue, poor focus. Our infused water stations are on every floor!',
    food: '🥗 Avoid heavy carbs at lunch. Protein + veggies keep afternoon energy high. Cafeteria has healthy options Mon–Fri. Nuts & dark chocolate make great desk snacks!',
    sleep: '😴 Try a 10–20 min power nap in our Wellness Room (Floor 6, 1–3 PM). Aim for 7–8 hours nightly. Our circadian lighting adjusts throughout the day!',
    emergency: '🚨 Use the red **CALL MEDICAL TEAM** button above! Medical Center: Floor 3, Block A. Emergency: 102',
    gym: '🏋️ Our gym on B1 has energy-generating cycles (your workout powers the building!), yoga, and a walking track. Open 6AM–10PM. 🌿⚡',
    default: '💡 I focus on health & wellness for office workers. Ask me about eye strain, back pain, stress, sleep, hydration, or diet. For emergencies, use the red SOS button!',
};

const getAIReply = (msg) => {
    const m = msg.toLowerCase();
    if (m.includes('head')) return AI_RESPONSES.headache;
    if (m.includes('back') || m.includes('posture')) return AI_RESPONSES.back;
    if (m.includes('eye') || m.includes('strain') || m.includes('20-20')) return AI_RESPONSES.eye;
    if (m.includes('stress') || m.includes('anxiety') || m.includes('mental')) return AI_RESPONSES.stress;
    if (m.includes('water') || m.includes('hydrat') || m.includes('drink')) return AI_RESPONSES.water;
    if (m.includes('food') || m.includes('eat') || m.includes('lunch') || m.includes('diet')) return AI_RESPONSES.food;
    if (m.includes('sleep') || m.includes('tired') || m.includes('fatigue')) return AI_RESPONSES.sleep;
    if (m.includes('emergency') || m.includes('urgent') || m.includes('sick')) return AI_RESPONSES.emergency;
    if (m.includes('gym') || m.includes('exercise') || m.includes('cycle')) return AI_RESPONSES.gym;
    return AI_RESPONSES.default;
};

const Healthcare = () => {
    const [messages, setMessages] = useState([
        { who: 'ai', text: '👋 Hi! I\'m NOVA, your health assistant powered by SUSTAINOVA AI. Ask me about headaches, back pain, stress, diet, eye strain, or any wellness topic!\n\n*Note: For medical emergencies, use the red button above.*' }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [emergency, setEmergency] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, typing]);

    const send = () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { who: 'user', text: userMsg }]);
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMessages(prev => [...prev, { who: 'ai', text: getAIReply(userMsg) }]);
        }, 900 + Math.random() * 700);
    };

    return (
        <Layout>
            <PageHeader label="🏥 Healthcare" title="Health Assistant AI" subtitle={<>Powered by <strong className="text-[#00C9B1]">NOVA AI</strong> · Health tips & guidance</>} />

            {/* Emergency button */}
            <Card className="bg-[rgba(255,71,87,0.06)] border-[rgba(255,71,87,0.3)] mb-4 text-center">
                <div className="text-3xl mb-2">🆘</div>
                <p className="font-semibold mb-1">Medical Emergency?</p>
                <p className="text-[#8BA3B8] text-sm mb-3">Alert on-site Medical Center (Floor 3, Block A)</p>
                <Button variant="danger" fullWidth onClick={() => setEmergency(true)}>🚨 CALL MEDICAL TEAM</Button>
            </Card>

            {emergency && (
                <Card className="mb-4 border-[#FF4757] text-center">
                    <div className="text-3xl mb-1 animate-pulse">🚨</div>
                    <p className="font-bold text-[#FF4757] mb-1">Medical Team Alerted!</p>
                    <p className="text-[#8BA3B8] text-sm">Staff from Floor 3 are responding · Security: Ext. 9000 · Ambulance: 102</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setEmergency(false)}>Dismiss</Button>
                </Card>
            )}

            {/* Quick tips */}
            <h3 className="font-['Space_Grotesk'] font-semibold mb-2">💊 Quick Topics</h3>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {HEALTH_TIPS.map(t => (
                    <div key={t.label} onClick={() => { setInput(t.msg); setTimeout(send, 50); }}
                        className="flex-shrink-0 bg-[#132845] border border-[rgba(0,201,177,0.12)] rounded-xl px-3 py-2.5 cursor-pointer hover:border-[rgba(0,201,177,0.3)] transition-all">
                        <div className="text-xl mb-1">{t.icon}</div>
                        <div className="text-xs font-semibold text-[#8BA3B8] whitespace-nowrap">{t.label}</div>
                    </div>
                ))}
            </div>

            {/* Chat */}
            <Card className="p-0 overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b border-[rgba(0,201,177,0.1)]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00C9B1] to-[#00A896] flex items-center justify-center text-lg">🤖</div>
                    <div>
                        <div className="font-semibold text-sm">NOVA Health AI</div>
                        <div className="flex items-center gap-1 text-xs text-[#2ECC71]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse inline-block" />
                            Online
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div ref={chatRef} className="h-72 overflow-y-auto p-4 flex flex-col gap-3">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.who === 'user'
                                    ? 'bg-[#00C9B1] text-[#0A1628] rounded-tr-sm font-medium'
                                    : 'bg-[#132845] border border-[rgba(0,201,177,0.12)] rounded-tl-sm text-[#E8F4F8]'
                                }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {typing && (
                        <div className="flex justify-start">
                            <div className="bg-[#132845] border border-[rgba(0,201,177,0.12)] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                                <span className="w-2 h-2 rounded-full bg-[#8BA3B8] bounce-dot-1 inline-block" />
                                <span className="w-2 h-2 rounded-full bg-[#8BA3B8] bounce-dot-2 inline-block" />
                                <span className="w-2 h-2 rounded-full bg-[#8BA3B8] bounce-dot-3 inline-block" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-[rgba(0,201,177,0.1)] flex gap-2">
                    <input
                        className="flex-1 bg-[#0d1e35] border border-[rgba(0,201,177,0.12)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4A6580] focus:outline-none focus:border-[#00C9B1] transition-colors"
                        placeholder="Ask NOVA about your health..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && send()}
                    />
                    <Button onClick={send} size="sm" disabled={!input.trim()}>Send ➤</Button>
                </div>
            </Card>
        </Layout>
    );
};

export default Healthcare;
