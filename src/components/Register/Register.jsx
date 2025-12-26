import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './Register.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'customer',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.userType === 'customer' ? 'customer' : formData.userType === 'carrier' ? 'carrier' : 'operator',
        userType: formData.userType,
        phone: formData.phone || '',
      };

      console.log('Register request:', requestBody);

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: 'Server error occurred' };
      }

      if (!response.ok) {
        console.error('Register error:', data);
        let errorMessage = data.error || t('error');
        
        // Translate common error messages to user-friendly text
        if (errorMessage.toLowerCase().includes('username already exists')) {
          errorMessage = t('usernameAlreadyExists');
        } else if (errorMessage.toLowerCase().includes('email already exists')) {
          errorMessage = t('emailAlreadyExists');
        } else if (errorMessage.toLowerCase().includes('required')) {
          errorMessage = t('fillAllFields');
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Auto login after registration
      const loginResponse = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('token', loginData.token);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>{t('createAccountTitle')}</h1>
          <p>{t('joinLogisticsPro')}</p>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">{t('username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder={t('enterUsername')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t('email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={t('enterEmail')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">{t('phone')}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+998 90 123 45 67"
            />
          </div>
          <div className="form-group">
            <label htmlFor="userType">{t('userType')} *</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="customer">{t('customer')}</option>
              <option value="carrier">{t('carrier')}</option>
              <option value="operator">{t('operator')}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('passwordMinLength')}
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder={t('enterConfirmPassword')}
            />
          </div>
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? t('creatingAccount') : t('register')}
          </button>
        </form>
        <div className="register-footer">
          <p>{t('alreadyHaveAccount')} <Link to="/login">{t('loginHere')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
