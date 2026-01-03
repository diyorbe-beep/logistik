import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Icons } from '../Icons/Icons';
import './Home.scss';

const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Icons.Package size={48} color="#3b82f6" />,
      title: t('shipmentManagement'),
      description: t('shipmentManagementDesc'),
      color: 'blue'
    },
    {
      icon: <Icons.Truck size={48} color="#10b981" />,
      title: t('vehicleTracking'),
      description: t('vehicleTrackingDesc'),
      color: 'green'
    },
    {
      icon: <Icons.BarChart size={48} color="#8b5cf6" />,
      title: t('dashboardAnalytics'),
      description: t('dashboardAnalyticsDesc'),
      color: 'purple'
    },
    {
      icon: <Icons.CheckCircle size={48} color="#f59e0b" />,
      title: t('statusTracking'),
      description: t('statusTrackingDesc'),
      color: 'orange'
    },
    {
      icon: <Icons.Globe size={48} color="#14b8a6" />,
      title: t('globalReach'),
      description: t('globalReachDesc'),
      color: 'teal'
    },
    {
      icon: <Icons.Shield size={48} color="#ef4444" />,
      title: t('secureSystem'),
      description: t('secureSystemDesc'),
      color: 'red'
    }
  ];

  const stats = [
    { icon: <Icons.Truck size={40} color="#3b82f6" />, number: '1000+', label: t('deliveriesCompleted') },
    { icon: <Icons.Users size={40} color="#10b981" />, number: '500+', label: t('happyCustomers') },
    { icon: <Icons.CheckCircle size={40} color="#f59e0b" />, number: '99.9%', label: t('successRate') },
    { icon: <Icons.Clock size={40} color="#8b5cf6" />, number: '24/7', label: t('support') }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="gradient-text">{t('heroTitle')}</span>
              </h1>
              <p className="hero-subtitle">{t('heroSubtitle')}</p>
              <p className="hero-description">
                {t('heroDescription')}
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn-primary btn-large">
                  <Icons.Rocket size={20} />
                  {t('getStarted')}
                </Link>
                <Link to="/login" className="btn-secondary btn-large">
                  <Icons.Lock size={20} />
                  {t('login')}
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image">
                <div className="floating-card card-1">
                  <span className="card-icon">
                    <Icons.Package size={24} color="#3b82f6" />
                  </span>
                  <span className="card-text">{t('shipmentTracking')}</span>
                </div>
                <div className="floating-card card-2">
                  <span className="card-icon">
                    <Icons.Truck size={24} color="#10b981" />
                  </span>
                  <span className="card-text">{t('realTimeUpdates')}</span>
                </div>
                <div className="floating-card card-3">
                  <span className="card-icon">
                    <Icons.BarChart size={24} color="#8b5cf6" />
                  </span>
                  <span className="card-text">{t('analytics')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <div className="section-header">
            <h2>{t('keyFeatures')}</h2>
            <p>{t('keyFeaturesDesc')}</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card card-interactive ${feature.color}`}>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-arrow">
                  <Icons.ArrowRight size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section section">
        <div className="container">
          <div className="section-header">
            <h2>{t('howItWorks')}</h2>
            <p>{t('howItWorksDesc')}</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-icon">
                  <Icons.Edit size={48} color="#3b82f6" />
                </div>
                <h3>{t('createOrder')}</h3>
                <p>{t('createOrderStep')}</p>
              </div>
            </div>
            <div className="step-connector">
              <Icons.ArrowRight size={32} color="#3b82f6" />
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-icon">
                  <Icons.Truck size={48} color="#10b981" />
                </div>
                <h3>{t('assignCarrier')}</h3>
                <p>{t('assignCarrierStep')}</p>
              </div>
            </div>
            <div className="step-connector">
              <Icons.ArrowRight size={32} color="#3b82f6" />
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-icon">
                  <Icons.MapPin size={48} color="#f59e0b" />
                </div>
                <h3>{t('trackShipment')}</h3>
                <p>{t('trackShipmentStep')}</p>
              </div>
            </div>
            <div className="step-connector">
              <Icons.ArrowRight size={32} color="#3b82f6" />
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <div className="step-icon">
                  <Icons.CheckCircle size={48} color="#10b981" />
                </div>
                <h3>{t('deliveryComplete')}</h3>
                <p>{t('deliveryCompleteStep')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{t('readyToStart')}</h2>
            <p>{t('joinToday')}</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary btn-large">
                <Icons.Rocket size={20} />
                {t('createAccount')}
              </Link>
              <Link to="/contact" className="btn-secondary btn-large">
                <Icons.Mail size={20} />
                {t('contactUs')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;