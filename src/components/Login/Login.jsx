import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import authService from '../../services/authService';
import { API_URL } from '../../config/api';
import { testApiConnection, wakeUpServer } from '../../utils/apiTest';
import Icons from '../Icons/Icons';
import Loading from '../Loading/Loading';
import './Login.scss';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // checking, connected, disconnected
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Test API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      const result = await testApiConnection();

      if (result.success) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
        // Try to wake up the server
        console.log('API not responding, attempting to wake up server...');
        setError('Server uyg\'onmoqda, iltimos kuting...');

        const wakeResult = await wakeUpServer();
        if (wakeResult.success) {
          setApiStatus('connected');
          setError('');
        } else {
          setError('Server bilan bog\'lanishda muammo. Iltimos, keyinroq urinib ko\'ring.');
        }
      }
    };

    checkApiConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Clear any existing tokens to prevent conflicts
    localStorage.removeItem('token');

    // Check API connection first
    if (apiStatus !== 'connected') {
      setError('Server bilan aloqa yo\'q. Iltimos, sahifani yangilang.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { username });

      const data = await authService.login({ username, password });

      // Successful login
      console.log('Login successful:', data.user);

      if (onLogin) {
        await onLogin(data.token, data.user);
      }

      // Small delay before navigation to allow context to update
      setTimeout(() => {
        const defaultRoute = data.user?.role === 'admin' || data.user?.role === 'operator'
          ? '/dashboard'
          : '/profile';

        navigate(defaultRoute);
      }, 500); // 500ms delay


    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = 'Kirish jarayonida xatolik yuz berdi';

      if (err.response) {
        // Axios error
        if (err.response.status === 401) {
          errorMessage = 'Noto\'g\'ri foydalanuvchi nomi yoki parol';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.error || 'Ma\'lumotlar noto\'g\'ri';
        } else {
          errorMessage = err.response.data.error || errorMessage;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'So\'rov vaqti tugadi. Server sekin javob bermoqda, qayta urinib ko\'ring.';
      } else if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Tarmoq xatosi. Internet aloqangizni tekshiring.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Quick login for testing
  const quickLogin = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'operator') {
      setUsername('operator');
      setPassword('admin123');
    }
  };

  if (loading) {
    return <Loading message="Tizimga kirilmoqda..." size="large" />;
  }

  return (
    <div className="login-page">
      <div className="login-grid">
        {/* Left: Form */}
        <div className="login-main-content">
          <div className="login-card-elite">
            <div className="login-header-elite">
              <h1>{t('loginTitle') || 'Tizimga kirish'}</h1>
              <p>{t('loginSubtitle') || 'Logistics Pro platformasiga xush kelibsiz'}</p>

              {/* API Status Indicator */}
              <div className={`api-status-badge api-status--${apiStatus}`}>
                <span className="status-dot"></span>
                <span>
                  {apiStatus === 'checking' && (t('checkingApi') || 'Server holati tekshirilmoqda...')}
                  {apiStatus === 'connected' && (t('apiConnected') || 'Server tayyor')}
                  {apiStatus === 'disconnected' && (t('apiDisconnected') || 'Server bilan aloqa yo\'q')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="premium-form-stack">
              {error && (
                <div className="error-alert">
                  <Icons.AlertTriangle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group-modern">
                <label htmlFor="username">{t('username')}</label>
                <div className="input-wrapper">
                  <Icons.User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={t('enterUsername')}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label htmlFor="password">{t('password')}</label>
                <div className="input-wrapper">
                  <Icons.Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('enterPassword')}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Default Credentials Helper - Glass style */}
              <div className="default-credentials-glass">
                <div className="credentials-header">
                  <Icons.Info size={16} />
                  <h4>{t('defaultCredentialsTitle') || 'Test uchun ma\'lumotlar:'}</h4>
                </div>
                <div className="credentials-list">
                  <div className="credential-row">
                    <span><strong>Admin:</strong> admin / admin123</span>
                    <button type="button" onClick={() => quickLogin('admin')} className="btn-quick-fill">
                      {t('fill') || 'To\'ldirish'}
                    </button>
                  </div>
                  <div className="credential-row">
                    <span><strong>Operator:</strong> operator / admin123</span>
                    <button type="button" onClick={() => quickLogin('operator')} className="btn-quick-fill">
                      {t('fill') || 'To\'ldirish'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-login-premium"
                disabled={loading || apiStatus !== 'connected'}
              >
                {loading ? (
                  <>
                    <Icons.Loader className="spin" size={20} />
                    <span>{t('loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('login')}</span>
                    <Icons.ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="login-footer-modern">
              <p>
                {t('dontHaveAccount')} <Link to="/register">{t('registerHere')}</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Brand Sidebar */}
        <div className="login-brand-sidebar">
          <div className="brand-content">
            <div className="brand-header">
              <div className="logo-badge">
                <Icons.Truck size={32} />
              </div>
              <h2>Logistik<span className="text-highlight">Pro</span></h2>
              <p className="brand-tagline">Professional Transport & Logistics Management System</p>
            </div>

            <div className="feature-showcase">
              <div className="showcase-item">
                <div className="showcase-icon">
                  <Icons.BarChart size={24} />
                </div>
                <div className="showcase-text">
                  <h4>{t('dashboardAnalytics') || 'Dashboard tahlillari'}</h4>
                  <p>{t('dashboardAnalyticsDesc') || 'Real vaqt rejimida statistikalar va hisobotlar.'}</p>
                </div>
              </div>
              <div className="showcase-item">
                <div className="showcase-icon">
                  <Icons.ShieldCheck size={24} />
                </div>
                <div className="showcase-text">
                  <h4>{t('securePayments') || 'Xavfsiz tizim'}</h4>
                  <p>{t('registerBenefit3') || 'Ma\'lumotlaringiz to\'liq himoyalangan.'}</p>
                </div>
              </div>
            </div>

            <div className="sidebar-footer">
              <div className="trust-indicator">
                <Icons.Verified size={16} />
                <span>500+ kompaniya bizga ishonadi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
