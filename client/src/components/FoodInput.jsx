import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Camera, Loader2, Check } from 'lucide-react';

export default function FoodInput({ onSubmit, onPhotoClick }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || status === 'loading') return;

    setStatus('loading');
    try {
      await onSubmit(text);
      setStatus('success');
      setText('');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('idle');
      console.error('Error logging food:', err);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="card"
      style={{ padding: '16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Sparkles size={16} color="#8BC34A" />
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
          What did you eat?
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={16}
            color="#b0b0b0"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='"2 eggs and a bowl of oatmeal"'
            className="input-field"
            style={{ paddingLeft: '40px' }}
            disabled={status === 'loading'}
          />
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPhotoClick}
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 12px',
          }}
        >
          <Camera size={18} color="#666" />
        </motion.button>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            minWidth: '80px',
            justifyContent: 'center',
          }}
          disabled={status === 'loading'}
        >
          <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: 360 }} transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}>
                <Loader2 size={16} />
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div key="success" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                <Check size={16} />
              </motion.div>
            )}
            {status === 'idle' && (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Log It
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
    </motion.div>
  );
}
