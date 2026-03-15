/*
 * Healthcare.jsx — NOVA AI Health Assistant
 * Connects to Gemini 2.0 Flash via backend
 * TTS via Web Speech API (SpeechSynthesis)
 * STT via Web Speech API (SpeechRecognition)
 * Languages: English (en-IN), Hindi (hi-IN), Marathi (mr-IN)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import { healthcareAPI } from '../services/api';

/* ── Language config ──────────────────────────── */
const LANGS = [
    { code: 'en-IN', label: 'English', short: 'EN', locale: 'en-IN' },
    { code: 'hi-IN', label: 'हिंदी',   short: 'HI', locale: 'hi-IN' },
    { code: 'mr-IN', label: 'मराठी',   short: 'MR', locale: 'mr-IN' },
];

const QUICK_TOPICS = ['Headache', 'Eye Strain', 'Back Pain', 'Fatigue', 'Stress', 'Nutrition', 'Posture', 'Hydration'];

const EMERGENCY = [
    { label: 'Building Doctor',   detail: 'Floor 3 · Ext. 300',   color: '#00C9B1' },
    { label: 'First Aid Room',    detail: 'Ground Floor · Ext. 100', color: '#2ECC71' },
    { label: 'Security / SOS',   detail: 'Ext. 9000',              color: '#FF4757' },
    { label: 'National Emergency',detail: '112',                   color: '#FF4757' },
    { label: 'Mental Health',     detail: '1800-599-0019 (iCall)', color: '#3B82F6' },
];

/* ── SVG icons ───────────────────────────────── */
const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
const MicIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" />
    </svg>
);
const SpeakerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);

/* ── Message bubble ───────────────────────────── */
const Bubble = ({ msg, onSpeak }) => {
    const isAI = msg.role === 'ai';
    return (
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: '1rem' }}>
            {isAI && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sn-teal-dim)', border: '1px solid var(--sn-teal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🤖</div>
            )}
            <div style={{ maxWidth: '78%' }}>
                <div className={`sn-bubble ${isAI ? 'sn-bubble--ai' : 'sn-bubble--user'}`}
                    style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                    {msg.content}
                </div>
                {isAI && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--sn-dim)' }}>NOVA · Gemini AI</span>
                        <button onClick={() => onSpeak(msg.content)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sn-muted)', fontSize: '0.6875rem', padding: '2px 6px', borderRadius: 4, transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--sn-teal)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--sn-muted)'}
                            title="Read aloud">
                            <SpeakerIcon /> Read
                        </button>
                    </div>
                )}
            </div>
            {!isAI && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sn-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>ME</div>
            )}
        </div>
    );
};

/* ── Main component ───────────────────────────── */
const Healthcare = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hello! I\'m NOVA, your AI-powered health and wellness assistant for SUSTAINOVA.\n\nI can help with common office health concerns, wellness tips, and guide you to building medical resources. How can I help you today?' }
    ]);
    const [input,    setInput]    = useState('');
    const [loading,  setLoading]  = useState(false);
    const [lang,     setLang]     = useState(LANGS[0]);
    const [ttsOn,    setTtsOn]    = useState(false);
    const [isListen, setIsListen] = useState(false);
    const [tip,      setTip]      = useState('');
    const [tipLoading, setTipLoading] = useState(true);

    const bottomRef  = useRef(null);
    const recogRef   = useRef(null);
    const synth      = useRef(window.speechSynthesis);

    /* Fetch daily tip on mount */
    useEffect(() => {
        healthcareAPI.getDailyTip()
            .then(r => setTip(r.data.tip))
            .catch(() => setTip('💧 Stay hydrated! Drink at least 8 glasses of water today.'))
            .finally(() => setTipLoading(false));
    }, []);

    /* Scroll to bottom on new message */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    /* ── TTS ────────────────────────────────────── */
    const speak = useCallback((text) => {
        if (!ttsOn) return;
        synth.current.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang.code;
        utt.rate = 0.95;
        synth.current.speak(utt);
    }, [ttsOn, lang.code]);

    const speakAlways = useCallback((text) => {
        synth.current.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang.code;
        utt.rate = 0.95;
        synth.current.speak(utt);
    }, [lang.code]);

    /* ── STT ────────────────────────────────────── */
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert('Speech recognition not supported in this browser. Try Chrome.');
        const r = new SpeechRecognition();
        r.lang = lang.code;
        r.continuous = false;
        r.interimResults = true;
        recogRef.current = r;
        setIsListen(true);
        r.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
            setInput(transcript);
        };
        r.onend = () => setIsListen(false);
        r.onerror = () => setIsListen(false);
        r.start();
    };
    const stopListening = () => {
        recogRef.current?.stop();
        setIsListen(false);
    };

    /* ── Send message ───────────────────────────── */
    const handleSend = async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput('');
        const userMsg = { role: 'user', content: msg };
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        setMessages(p => [...p, userMsg]);
        setLoading(true);
        try {
            const res = await healthcareAPI.chat({ message: msg, history, language: lang.code });
            const aiMsg = { role: 'ai', content: res.data.response };
            setMessages(p => [...p, aiMsg]);
            if (ttsOn) speak(res.data.response);
        } catch (err) {
            setMessages(p => [...p, { role: 'ai', content: '⚠️ Sorry, NOVA is temporarily unavailable. Please try again in a moment.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    /* ── Render ─────────────────────────────────── */
    return (
        <Layout>
            {/* Page header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sn-dim)', marginBottom: '0.375rem' }}>AI WELLNESS</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 700, color: 'var(--sn-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    NOVA Health AI
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--sn-teal-dim)', color: 'var(--sn-teal)', border: '1px solid var(--sn-teal-mid)', letterSpacing: '0.05em' }}>Gemini</span>
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--sn-muted)', marginTop: '0.25rem' }}>Your AI-powered wellness companion — type or speak in English, हिंदी, or मराठी</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>

                {/* ── LEFT: Chat panel ────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <div style={{
                        background: 'var(--sn-card)', border: '1px solid var(--sn-border)',
                        borderRadius: '1rem 1rem 0 0', overflow: 'hidden',
                    }}>
                        {/* Chat header */}
                        <div style={{ padding: '0.875rem 1.125rem', borderBottom: '1px solid var(--sn-divider)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sn-teal), #009B8B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>🤖</div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--sn-text)' }}>NOVA</p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--sn-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sn-green)', display: 'inline-block' }} />
                                    Online — Gemini 2.0 Flash
                                </p>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem' }}>
                                {/* Language pills */}
                                {LANGS.map(l => (
                                    <button key={l.code} onClick={() => setLang(l)}
                                        style={{
                                            padding: '0.25rem 0.625rem', borderRadius: 99, border: '1px solid',
                                            borderColor: lang.code === l.code ? 'var(--sn-teal)' : 'var(--sn-border)',
                                            background: lang.code === l.code ? 'var(--sn-teal-dim)' : 'transparent',
                                            color: lang.code === l.code ? 'var(--sn-teal)' : 'var(--sn-muted)',
                                            fontSize: '0.6875rem', fontWeight: 700, cursor: 'pointer',
                                            fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                                        }}>
                                        {l.short}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Messages */}
                        <div style={{ padding: '1.125rem', height: 'clamp(360px, 50vh, 500px)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            {messages.map((m, i) => (
                                <Bubble key={i} msg={m} onSpeak={speakAlways} />
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sn-teal-dim)', border: '1px solid var(--sn-teal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🤖</div>
                                    <div style={{ padding: '0.75rem 1rem', background: 'var(--sn-surface)', borderRadius: '1rem 1rem 1rem 0', border: '1px solid var(--sn-border)', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                                        {[0.2, 0.4, 0.6].map(d => (
                                            <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sn-teal)', display: 'inline-block', animation: `pulse 1.2s ease-in-out ${d}s infinite` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </div>

                    {/* Input bar */}
                    <div style={{
                        background: 'var(--sn-card)', border: '1px solid var(--sn-border)',
                        borderTop: 'none', borderRadius: '0 0 1rem 1rem',
                        padding: '0.75rem 1rem', display: 'flex', gap: '0.625rem', alignItems: 'flex-end',
                    }}>
                        <div style={{ flex: 1 }}>
                            {isListen && (
                                <div style={{ fontSize: '0.6875rem', color: 'var(--sn-teal)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sn-red)', display: 'inline-block', animation: 'pulse 0.8s ease infinite' }} />
                                    Listening in {lang.label}...
                                </div>
                            )}
                            <textarea
                                rows={1} value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder={`Ask NOVA in ${lang.label}...`}
                                className="sn-input"
                                style={{ resize: 'none', lineHeight: 1.5, minHeight: 42, maxHeight: 120, overflowY: 'auto' }}
                            />
                        </div>
                        {/* Mic */}
                        <button onClick={isListen ? stopListening : startListening}
                            style={{
                                width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
                                background: isListen ? 'var(--sn-red)' : 'var(--sn-teal-dim)',
                                color: isListen ? '#fff' : 'var(--sn-teal)',
                                border: `1px solid ${isListen ? 'var(--sn-red)' : 'var(--sn-teal-mid)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s', flexShrink: 0,
                                animation: isListen ? 'micPulse 1s ease infinite' : 'none',
                            }}>
                            <MicIcon active={isListen} />
                        </button>
                        {/* Send */}
                        <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                            className="sn-btn sn-btn--primary"
                            style={{ height: 42, width: 42, borderRadius: '50%', padding: 0, flexShrink: 0 }}>
                            <SendIcon />
                        </button>
                    </div>

                    {/* Quick topics */}
                    <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sn-dim)', marginBottom: '0.625rem' }}>Quick Topics</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {QUICK_TOPICS.map(t => (
                                <button key={t} onClick={() => handleSend(t)}
                                    style={{
                                        padding: '0.375rem 0.875rem', borderRadius: 99, border: '1px solid var(--sn-border)',
                                        background: 'var(--sn-surface)', color: 'var(--sn-text-sec)',
                                        fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sn-teal)'; e.currentTarget.style.color = 'var(--sn-teal)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--sn-border)'; e.currentTarget.style.color = 'var(--sn-text-sec)'; }}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Sidebar panels ────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Voice settings */}
                    <div style={{ background: 'var(--sn-card)', border: '1px solid var(--sn-border)', borderRadius: '1rem', padding: '1rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--sn-text)' }}>Voice Settings</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {/* Language selection */}
                            <div style={{ fontSize: '0.75rem', color: 'var(--sn-muted)', marginBottom: '0.25rem' }}>Language</div>
                            {LANGS.map(l => (
                                <label key={l.code} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', border: `1px solid ${lang.code === l.code ? 'var(--sn-teal-mid)' : 'var(--sn-border)'}`, background: lang.code === l.code ? 'var(--sn-teal-dim)' : 'transparent', transition: 'all 0.15s' }}>
                                    <input type="radio" name="lang" checked={lang.code === l.code} onChange={() => setLang(l)} style={{ accentColor: 'var(--sn-teal)' }} />
                                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: lang.code === l.code ? 'var(--sn-teal)' : 'var(--sn-text)' }}>{l.label}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--sn-dim)' }}>{l.code}</span>
                                </label>
                            ))}
                            {/* TTS toggle */}
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', border: '1px solid var(--sn-border)', cursor: 'pointer', marginTop: '0.25rem' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Read responses aloud</span>
                                <input type="checkbox" checked={ttsOn} onChange={e => setTtsOn(e.target.checked)} style={{ accentColor: 'var(--sn-teal)', width: 16, height: 16 }} />
                            </label>
                        </div>
                    </div>

                    {/* Emergency contacts */}
                    <div style={{ background: 'var(--sn-card)', border: '1px solid var(--sn-border)', borderRadius: '1rem', padding: '1rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--sn-text)' }}>Emergency Contacts</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {EMERGENCY.map(({ label, detail, color }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0', borderBottom: '1px solid var(--sn-divider)' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--sn-text)' }}>{label}</p>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--sn-muted)' }}>{detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily tip */}
                    <div style={{ background: 'var(--sn-teal-dim)', border: '1px solid var(--sn-teal-mid)', borderRadius: '1rem', padding: '1rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.625rem', color: 'var(--sn-teal)' }}>Today's Wellness Tip</p>
                        {tipLoading ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span className="sn-spinner sn-spinner--sm" />
                                <span style={{ fontSize: '0.8125rem', color: 'var(--sn-muted)' }}>Loading tip...</span>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--sn-text)', lineHeight: 1.65 }}>{tip}</p>
                        )}
                    </div>

                    {/* Disclaimer */}
                    <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--sn-gold-dim)', border: '1px solid rgba(245,184,0,0.2)' }}>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--sn-gold)', lineHeight: 1.55 }}>
                            NOVA is an AI assistant, not a medical professional. For emergencies, contact building security (Ext. 9000) or call 112.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pulse animation */}
            <style>{`
                @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(1.2); } }
                @keyframes micPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,71,87,0.4); } 50% { box-shadow: 0 0 0 8px rgba(255,71,87,0); } }
                @media(max-width: 900px) { .hc-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </Layout>
    );
};

export default Healthcare;
