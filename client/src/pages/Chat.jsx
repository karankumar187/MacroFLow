import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { getUser, sendChatMessage } from '../services/api';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hey there! 👋 I'm your MacroFlow AI Coach. I have access to your recent food logs and goals. Ask me anything about your nutrition, request recipes, or check your progress!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    getUser().then(res => setUser(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    if (!user) {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Please create a profile first on the Goals page so I can access your data!' }]);
      return;
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { data } = await sendChatMessage(user._id, userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I ran into an error. Please make sure your Gemini API key is configured.',
      }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    "Am I on track this week?",
    "High-protein dinner idea",
    "How to improve my macros?",
    "Healthy snack ideas",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '750px',
        width: '100%',
        padding: '20px 20px 20px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8BC34A, #689F38)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a' }}>Ask AI</h1>
            <p style={{ fontSize: '12px', color: '#999' }}>Powered by Gemini • Knows your food logs</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingRight: '4px',
        marginBottom: '12px',
      }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '10px',
                background: msg.role === 'ai'
                  ? 'linear-gradient(135deg, #8BC34A, #689F38)'
                  : '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                {msg.role === 'ai' ? <Bot size={14} color="#fff" /> : <User size={14} color="#689F38" />}
              </div>
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #8BC34A, #689F38)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={14} color="#fff" />
            </div>
            <div className="chat-bubble-ai" style={{ display: 'flex', gap: '5px', padding: '16px 20px' }}>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {quickPrompts.map((prompt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setInput(prompt)}
              className="tab-pill"
              style={{ fontSize: '12px' }}
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your nutrition coach..."
          className="input-field"
          style={{ flex: 1 }}
          disabled={loading}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
          disabled={loading || !input.trim()}
        >
          <Send size={16} />
        </motion.button>
      </form>
    </motion.div>
  );
}
