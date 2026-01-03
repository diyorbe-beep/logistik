import { useTranslation } from '../../hooks/useTranslation';
import { Icons } from '../Icons/Icons';
import './About.scss';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>{t('aboutUs')}</h1>
        <p className="subtitle">{t('aboutSubtitle')}</p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h2>{t('ourMission')}</h2>
          <p>{t('missionText')}</p>
        </div>

        <div className="about-section">
          <h2>{t('ourVision')}</h2>
          <p>{t('visionText')}</p>
        </div>

        <div className="about-section">
          <h2>{t('whyChooseUs')}</h2>
          <div className="features-list">
            <div className="feature-item">
              <Icons.CheckCircle size={20} color="#10b981" />
              <span>{t('feature1')}</span>
            </div>
            <div className="feature-item">
              <Icons.CheckCircle size={20} color="#10b981" />
              <span>{t('feature2')}</span>
            </div>
            <div className="feature-item">
              <Icons.CheckCircle size={20} color="#10b981" />
              <span>{t('feature3')}</span>
            </div>
            <div className="feature-item">
              <Icons.CheckCircle size={20} color="#10b981" />
              <span>{t('feature4')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;




