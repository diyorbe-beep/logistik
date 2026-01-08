import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import { testApiConnection, wakeUpServer } from '../../utils/apiTest';
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

    // Check API connection first
    if (apiStatus !== 'connected') {
      setError('Server bilan bog\'lanish yo\'q. Iltimos, kuting...');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { username, password: '***' });
      
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, user data:', data);
        
        localStorage.setItem('token', data.token);
        
        // Show user role info
        console.log(`Logged in as: ${data.user.username} (${data.user.role})`);
        
        if (onLogin) {
          await onLogin(data.token, data.user);
        }
        
        // Redirect based on role
        if (data.user.role === 'admin' || data.user.role === 'operator') {
          navigate('/dashboard');
        } else {
          navigate('/profile');
        }
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        setError(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
      setError('Server bilan aloqa yo\'q. Iltimos, sahifani yangilang.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { username, apiUrl: API_URL });
      
      // Add timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Server javob berish xatosi. Iltimos, qayta urinib ko\'ring.');
      }

      console.log('Login response:', { status: response.status, data });

      if (!response.ok) {
        let errorMessage = data.error || 'Noma\'lum xatolik yuz berdi';
        
        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = 'Noto\'g\'ri foydalanuvchi nomi yoki parol';
        } else if (response.status === 400) {
          errorMessage = 'Foydalanuvchi nomi va parol kiritish majburiy';
        } else if (response.status >= 500) {
          errorMessage = 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.';
        }
        
        setError(errorMessage);
        return;
      }

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
      
      if (err.name === 'AbortError') {
        setError('So\'rov vaqti tugadi. Server sekin javob bermoqda, qayta urinib ko\'ring.');
      } else if (err.message.includes('fetch')) {
        setError('Tarmoq xatosi. Internet aloqangizni tekshiring.');
      } else {
        setError(err.message || 'Kirish jarayonida xatolik yuz berdi');
      }
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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Tizimga kirish</h1>
          <p>Logistics Pro platformasiga xush kelibsiz</p>
          
          {/* API Status Indicator */}
          <div className={`api-status api-status--${apiStatus}`}>
            <span className="status-dot"></span>
            {apiStatus === 'checking' && 'Server holati tekshirilmoqda...'}
            {apiStatus === 'connected' && 'Server tayyor'}
            {apiStatus === 'disconnected' && 'Server bilan aloqa yo\'q'}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">!</span>
              {error}
            </div>
          )}
          
          {/* Default Credentials Helper */}
          <div className="default-credentials">
            <h4>Dashboard uchun:</h4>
            <div className="credential-item">
              <strong>Admin:</strong> admin / admin123
              <button 
                type="button" 
                onClick={() => quickLogin('admin')}
                className="quick-login-btn"
              >
                To'ldirish
              </button>
            </div>
            <div className="credential-item">
              <strong>Operator:</strong> operator / admin123
              <button 
                type="button" 
                onClick={() => quickLogin('operator')}
                className="quick-login-btn"
              >
                To'ldirish
              </button>
            </div>
            <div className="current-user-info">
              <small>Customer userlar: Dashboard ko'rmaydi, faqat buyurtma beradi</small>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Foydalanuvchi nomi</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Foydalanuvchi nomini kiriting"
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Parol</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Parolni kiriting"
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading || apiStatus !== 'connected'}
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link></p>
          
          {/* Quick login for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="quick-login">
              <p>Tez kirish:</p>
              <button 
                type="button" 
                onClick={() => quickLogin('admin')}
                className="quick-login-btn"
              >
                Admin (admin/admin123)
              </button>
            </div>
          )}
          
          <div className="login-hint">
            <p><strong>Test uchun:</strong></p>
            <p>Admin: admin / admin123</p>
            <p>API: {API_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
