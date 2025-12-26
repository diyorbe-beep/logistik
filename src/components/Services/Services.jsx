import { useTranslation } from '../../hooks/useTranslation';
import './Services.scss';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: '📦',
      title: t('serviceShipment'),
      description: t('serviceShipmentDesc'),
    },
    {
      icon: '🚚',
      title: t('serviceTransport'),
      description: t('serviceTransportDesc'),
    },
    {
      icon: '📊',
      title: t('serviceTracking'),
      description: t('serviceTrackingDesc'),
    },
    {
      icon: '💰',
      title: t('servicePricing'),
      description: t('servicePricingDesc'),
    },
    {
      icon: '⏱️',
      title: t('serviceExpress'),
      description: t('serviceExpressDesc'),
    },
    {
      icon: '🛡️',
      title: t('serviceInsurance'),
      description: t('serviceInsuranceDesc'),
    },
  ];

  return (
    <div className="services-page">
      <div className="services-hero">
        <h1>{t('ourServices')}</h1>
        <p>{t('servicesSubtitle')}</p>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;

