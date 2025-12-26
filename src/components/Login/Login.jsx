import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './Login.scss';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: 'Server error occurred' };
      }

      if (!response.ok) {
        let errorMessage = data.error || t('error');
        
        // Translate common error messages
        if (errorMessage.toLowerCase().includes('invalid credentials') || 
            errorMessage.toLowerCase().includes('invalid') ||
            response.status === 401) {
          errorMessage = t('invalidCredentials');
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      onLogin(data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{t('loginTitle')}</h1>
          <p>{t('loginSubtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">{t('username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={t('enterUsername')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('enterPassword')}
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? t('loggingIn') : t('login')}
          </button>
        </form>
        <div className="login-footer">
          <p>{t('dontHaveAccount')} <Link to="/register">{t('registerHere')}</Link></p>
          <p className="login-hint">{t('defaultCredentials')}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
