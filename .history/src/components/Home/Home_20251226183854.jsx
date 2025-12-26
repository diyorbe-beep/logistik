import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import './Home.scss';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>{t('heroTitle')}</h1>
          <p className="hero-subtitle">{t('heroSubtitle')}</p>
          <p className="hero-description">
            {t('heroDescription')}
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary btn-large button">
              {t('getStarted')}
            </Link>
            <Link to="/login" className="btn-secondary btn-large">
              {t('login')}
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-icon">🚚</div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>{t('keyFeatures')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>{t('shipmentManagement')}</h3>
              <p>{t('shipmentManagementDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>{t('vehicleTracking')}</h3>
              <p>{t('vehicleTrackingDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>{t('dashboardAnalytics')}</h3>
              <p>{t('dashboardAnalyticsDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>{t('statusTracking')}</h3>
              <p>{t('statusTrackingDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <h2>{t('readyToStart')}</h2>
          <p>{t('joinToday')}</p>
          <Link to="/register" className="btn-primary btn-large">
            {t('createAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
