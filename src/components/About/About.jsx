import { useTranslation } from '../../hooks/useTranslation';
import { Icons } from '../Icons/Icons';
import PageHeader from '../Common/PageHeader';
import missionImg from '../../assets/images/about-mission.png';
import visionImg from '../../assets/images/about-vision.png';
import './About.scss';

const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: <Icons.Shield size={32} />,
      title: t('valueTrust'),
      description: t('valueTrustDesc')
    },
    {
      icon: <Icons.Rocket size={32} />,
      title: t('valueInnovation'),
      description: t('valueInnovationDesc')
    },
    {
      icon: <Icons.Clock size={32} />,
      title: t('valueSpeed'),
      description: t('valueSpeedDesc')
    },
    {
      icon: <Icons.Shield size={32} />,
      title: t('valueSafety'),
      description: t('valueSafetyDesc')
    }
  ];

  return (
    <div className="about-redesign">
      <PageHeader
        badge={t('aboutUs')}
        title={t('aboutTitle')}
        description={t('aboutDescription')}
        centered
      />

      <div className="container">
        <section className="about-content">
          {/* Mission Section */}
          <div className="about-row fade-in">
            <div className="about-text">
              <div className="section-label">{t('ourMission')}</div>
              <h2>{t('ourMission')}</h2>
              <p className="description">{t('missionText')}</p>
            </div>
            <div className="about-visual">
              <div className="image-wrapper">
                <img src={missionImg} alt="Our Mission" />
                <div className="image-overlay"></div>
              </div>
            </div>
          </div>

          {/* Vision Section */}
          <div className="about-row reverse fade-in">
            <div className="about-text">
              <div className="section-label">{t('ourVision')}</div>
              <h2>{t('ourVision')}</h2>
              <p className="description">{t('visionText')}</p>
            </div>
            <div className="about-visual">
              <div className="image-wrapper">
                <img src={visionImg} alt="Our Vision" />
                <div className="image-overlay"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="core-values section fade-in">
          <div className="section-header">
            <h2>{t('coreValues')}</h2>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;




