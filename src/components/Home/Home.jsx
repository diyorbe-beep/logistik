import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { Icons } from '../Icons/Icons';
import PageHeader from '../Common/PageHeader';
import './Home.scss';

const Home = () => {
  const { t } = useTranslation();
  const { user } = useUser();

  const features = [
    {
      icon: <Icons.Package size={32} />,
      title: t('shipmentManagement'),
      description: t('shipmentManagementDesc'),
      className: 'feature-1'
    },
    {
      icon: <Icons.Truck size={32} />,
      title: t('vehicleTracking'),
      description: t('vehicleTrackingDesc'),
      className: 'feature-2'
    },
    {
      icon: <Icons.BarChart size={32} />,
      title: t('dashboardAnalytics'),
      description: t('dashboardAnalyticsDesc'),
      className: 'feature-3'
    },
    {
      icon: <Icons.Globe size={32} />,
      title: t('globalReach'),
      description: t('globalReachDesc'),
      className: 'feature-4'
    }
  ];

  const pricingPlans = [
    {
      name: t('freePlan'),
      price: '0',
      features: ['5 yuk tashish/oy', 'Boshlang\'ich tahlillar', 'Email qo\'llab-quvvatlash'],
      buttonText: t('getStarted'),
      type: 'basic'
    },
    {
      name: t('proPlan'),
      price: '49',
      features: ['Cheksiz yuk tashish', 'Kengaytirilgan tahlillar', '24/7 Priority support', 'API kirish'],
      buttonText: t('choosePlan'),
      popular: true,
      type: 'premium'
    },
    {
      name: t('enterprisePlan'),
      price: '99',
      features: ['Maxsus yechimlar', 'Shaxsiy menejer', 'SLA kafolati', 'White-labeling'],
      buttonText: t('contactUs'),
      type: 'enterprise'
    }
  ];

  return (
    <div className="home-saas">
      <PageHeader
        badge={
          <div className="hero-badge">
            <span>Product Hunt #1 of the day</span>
          </div>
        }
        title={
          <>Logistikani <span className="text-gradient">aqlli boshqaring.</span></>
        }
        description={t('heroDescription')}
        actions={
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn-primary-saas">
                Dashboardga o'tish <Icons.ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary-saas">
                  {t('getStarted')} <Icons.Rocket size={18} />
                </Link>
                <Link to="/login" className="btn-secondary-saas">
                  <Icons.Play size={18} /> Demo ko'rish
                </Link>
              </>
            )}
          </div>
        }
        visual={
          <div className="hero-preview">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200"
              alt="LogistikPro Dashboard Preview"
              className="preview-image"
            />
          </div>
        }
      />

      {/* Social Proof */}
      <section className="social-proof">
        <div className="container">
          <p>{t('socialProofTitle')}</p>
          <div className="logo-cloud">
            <div className="logo"><span>LOGISTIC</span></div>
            <div className="logo"><span>MOVE.IT</span></div>
            <div className="logo"><span>TRANS.X</span></div>
            <div className="logo"><span>SHIP.IO</span></div>
            <div className="logo"><span>CARGO.CO</span></div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="features-saas section">
        <div className="container">
          <div className="section-header-saas">
            <h2 className="section-title">{t('keyFeatures')}</h2>
            <p className="section-subtitle">{t('keyFeaturesDesc')}</p>
          </div>
          <div className="bento-grid">
            {features.map((feature, index) => (
              <div key={index} className={`bento-item ${feature.className}`}>
                <div className="bento-icon">{feature.icon}</div>
                <div className="bento-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glassmorphism Pricing */}
      <section className="pricing-saas section">
        <div className="container">
          <div className="section-header-saas">
            <h2 className="section-title">{t('saasPricingTitle')}</h2>
            <p className="section-subtitle">{t('saasPricingSubtitle')}</p>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Eng ommabop</div>}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="amount">${plan.price}</span>
                    <span className="period">{t('perMonth')}</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx}><Icons.CheckCircle size={16} /> {feat}</li>
                  ))}
                </ul>
                <button className={`btn-plan ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-saas section">
        <div className="container">
          <div className="section-header-saas">
            <h2 className="section-title">{t('faqTitle')}</h2>
            <p className="section-subtitle">{t('faqSubtitle')}</p>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h4>Tizim qanchalik xavfsiz?</h4>
              <p>Bizning tizimimiz bank darajasidagi xavfsizlik va JWT-ga asoslangan autentifikatsiya bilan jihozlangan.</p>
            </div>
            <div className="faq-item">
              <h4>Mobil ilovasi bormi?</h4>
              <p>Platformamiz to'liq adaptiv va barcha qurilmalarda mukammal ishlaydi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Logistikani keyingi darajaga olib chiqing.</h2>
            <p>Bugunoq o'z jamoangiz bilan ishlashni boshlang.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn-primary-saas btn-glow">
                Hoziroq boshlash
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;