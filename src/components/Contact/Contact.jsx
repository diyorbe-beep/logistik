import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import './Contact.scss';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    setLoading(true);
    setSuccess(false);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>{t('contactUs')}</h1>
        <p>{t('contactSubtitle')}</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">📞</div>
            <h3>{t('phone')}</h3>
            <p>+998 90 123 45 67</p>
            <p>+998 71 234 56 78</p>
          </div>
          <div className="info-card">
            <div className="info-icon">✉️</div>
            <h3>{t('email')}</h3>
            <p>info@logisticspro.uz</p>
            <p>support@logisticspro.uz</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>{t('address')}</h3>
            <p>{t('addressText')}</p>
          </div>
        </div>

        <div className="contact-form-container">
          {success && (
            <div className="success-message">
              {t('messageSent')}
            </div>
          )}
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">{t('name')} *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('enterName')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">{t('email')} *</label>
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
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">{t('phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('enterPhone')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">{t('subject')} *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder={t('enterSubject')}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="message">{t('message')} *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder={t('enterMessage')}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('sending') : t('sendMessage')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;


