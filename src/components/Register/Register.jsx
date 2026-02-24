import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { AuthService } from '../../services/authService';
import Icons from '../Icons/Icons';
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

      await AuthService.register(requestBody);
      const loginData = await AuthService.login(formData.username, formData.password);
      localStorage.setItem('token', loginData.token);
      navigate('/dashboard');

    } catch (err) {
      console.error('Register error:', err);
      let errorMessage = t('error');

      if (err.response && err.response.data && err.response.data.error) {
        const serverError = err.response.data.error;
        if (serverError.toLowerCase().includes('username already exists')) {
          errorMessage = t('usernameAlreadyExists');
        } else if (serverError.toLowerCase().includes('email already exists')) {
          errorMessage = t('emailAlreadyExists');
        } else {
          errorMessage = serverError;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-grid">
        {/* Left: Form */}
        <div className="register-main-content">
          <div className="register-card-elite">
            <div className="register-header-elite">
              <h1>{t('createAccountTitle')}</h1>
              <p>{t('joinLogisticsPro')}</p>
            </div>

            <form onSubmit={handleSubmit} className="premium-form-stack">
              {error && (
                <div className="error-alert">
                  <Icons.AlertTriangle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-section-group">
                <h3>{t('personalInfo')}</h3>
                <div className="form-row-dual">
                  <div className="form-group-modern">
                    <label>{t('username')}</label>
                    <div className="input-wrapper">
                      <Icons.User size={18} className="input-icon" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder={t('enterUsername')}
                      />
                    </div>
                  </div>
                  <div className="form-group-modern">
                    <label>{t('email')}</label>
                    <div className="input-wrapper">
                      <Icons.Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={t('enterEmail')}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row-dual">
                  <div className="form-group-modern">
                    <label>{t('phone')}</label>
                    <div className="input-wrapper">
                      <Icons.Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+998 (__) ___-__-__"
                      />
                    </div>
                  </div>
                  <div className="form-group-modern">
                    <label>{t('userType')}</label>
                    <div className="input-wrapper">
                      <Icons.Users size={18} className="input-icon" />
                      <select name="userType" value={formData.userType} onChange={handleChange} required>
                        <option value="customer">{t('customer')}</option>
                        <option value="carrier">{t('carrier')}</option>
                        <option value="operator">{t('operator')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section-group">
                <h3>{t('security')}</h3>
                <div className="form-row-dual">
                  <div className="form-group-modern">
                    <label>{t('password')}</label>
                    <div className="input-wrapper">
                      <Icons.Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="form-group-modern">
                    <label>{t('confirmPassword')}</label>
                    <div className="input-wrapper">
                      <Icons.ShieldCheck size={18} className="input-icon" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-register-premium" disabled={loading}>
                {loading ? (
                  <>
                    <Icons.Loader className="spin" size={20} />
                    <span>{t('creatingAccount')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('register')}</span>
                    <Icons.ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="register-footer-modern">
              <p>
                {t('alreadyHaveAccount')} <Link to="/login">{t('loginHere')}</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Benefits Sidebar */}
        <div className="register-benefits-sidebar">
          <div className="benefits-content">
            <div className="benefits-header">
              <div className="logo-badge">
                <Icons.Package size={32} />
              </div>
              <h2>{t('registerBenefitsTitle')}</h2>
            </div>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Icons.Search size={24} />
                </div>
                <div className="benefit-text">
                  <p>{t('registerBenefit1')}</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Icons.Truck size={24} />
                </div>
                <div className="benefit-text">
                  <p>{t('registerBenefit2')}</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Icons.Lock size={24} />
                </div>
                <div className="benefit-text">
                  <p>{t('registerBenefit3')}</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <Icons.HelpCircle size={24} />
                </div>
                <div className="benefit-text">
                  <p>{t('registerBenefit4')}</p>
                </div>
              </div>
            </div>

            <div className="sidebar-footer-card">
              <div className="trust-badge">
                <Icons.Verified size={16} />
                <span>Garantlangan xavfsizlik</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
