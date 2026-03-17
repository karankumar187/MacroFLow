import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Handles the OAuth callback — extracts token from URL and logs user in.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken(token).then(() => navigate('/'));
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <div style={{ textAlign: 'center', color: '#999' }}>
        <div className="loading-dot" style={{ marginRight: '4px' }} />
        <div className="loading-dot" style={{ marginRight: '4px' }} />
        <div className="loading-dot" />
        <p style={{ marginTop: '12px', fontSize: '14px' }}>Signing you in...</p>
      </div>
    </div>
  );
}
