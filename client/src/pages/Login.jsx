import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UtensilsCrossed, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await signup(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #E8F5E9 100%)',
      padding: '20px',
    }}>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="card"
        style={{
          width: '420px',
          maxWidth: '100%',
          padding: '36px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #8BC34A, #689F38)',
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '28px',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8BC34A, #689F38)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <UtensilsCrossed size={22} color="#fff" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a1a' }}>MacroFlow</span>
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#1a1a1a',
          textAlign: 'center',
          marginBottom: '4px',
        }}>
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h2>
        <p style={{
          fontSize: '13px',
          color: '#999',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          {isSignup ? 'Start tracking your nutrition today' : 'Log in to continue your journey'}
        </p>

        {/* Google Sign In */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1.5px solid #eee',
            background: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1a1a1a',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            marginBottom: '20px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          <span style={{ fontSize: '12px', color: '#b0b0b0', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                background: '#FFF3F3',
                color: '#D32F2F',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px',
                overflow: 'hidden',
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Name (signup only) */}
          <AnimatePresence>
            {isSignup && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#b0b0b0" style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  }} />
                  <input
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#b0b0b0" style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            }} />
            <input
              className="input-field"
              type="email"
              style={{ paddingLeft: '40px' }}
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="#b0b0b0" style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            }} />
            <input
              className="input-field"
              type={showPassword ? 'text' : 'password'}
              style={{ paddingLeft: '40px', paddingRight: '44px' }}
              placeholder={isSignup ? 'Create password (min 6 chars)' : 'Password'}
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#b0b0b0',
                display: 'flex', padding: '4px',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary"
            disabled={loading}
            style={{
              padding: '14px',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              marginTop: '4px',
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {isSignup ? 'Create Account' : 'Sign In'}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle */}
        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#999',
          marginTop: '20px',
        }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#689F38', fontWeight: 600, fontSize: '13px',
              fontFamily: 'inherit',
            }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
