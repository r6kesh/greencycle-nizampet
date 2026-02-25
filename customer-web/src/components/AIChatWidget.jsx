import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Greenie, your AI recycling assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMsg = { id: Date.now(), text: message, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const apiBase = import.meta.env.VITE_API_URL || '/api';
            const res = await fetch(`${apiBase}/support/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: 'ai' }]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat-widget">
            {!isOpen ? (
                <button className="ai-chat-button pulse" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={30} />
                </button>
            ) : (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="logo-icon" style={{ fontSize: '1.2rem' }}>♻️</div>
                            <div>
                                <h3 style={{ margin: 0 }}>Greenie AI</h3>
                                <div style={{ fontSize: '10px', color: 'var(--green-300)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#44ff44' }}></span> Online
                                </div>
                            </div>
                        </div>
                        <button className="btn-icon" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.7, fontSize: '0.7rem' }}>
                                    {msg.sender === 'ai' ? <Bot size={12} /> : <User size={12} />}
                                    {msg.sender === 'ai' ? 'Greenie' : 'You'}
                                </div>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-msg ai">
                                <Loader2 size={16} className="animate-spin" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="ai-chat-input-area" onSubmit={handleSend}>
                        <input
                            className="ai-input"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                        />
                        <button className="ai-send-btn" type="submit" disabled={!message.trim() || loading}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChatWidget;
