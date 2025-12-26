import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './Profile.scss';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
  });
  const { t } = useTranslation();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        alert(t('profileUpdated'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  if (loading) {
    return <div className="loading">{t('loadingProfile')}</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>{t('myProfile')}</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <h2>{user?.username || t('user')}</h2>
          <p className="user-role">{user?.role || 'user'}</p>
        </div>

        <div className="profile-form-card">
          <h3>{t('editProfile')}</h3>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">{t('username')}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled
                className="disabled-input"
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
            <button type="submit" className="btn-primary">
              {t('saveChanges')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

