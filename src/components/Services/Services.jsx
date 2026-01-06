import { useTranslation } from '../../hooks/useTranslation';
import { Icons } from '../Icons/Icons';
import './Services.scss';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: <Icons.Package size={48} color="#2563eb" />,
      title: t('serviceShipment'),
      description: t('serviceShipmentDesc'),
    },
    {
      icon: <Icons.Truck size={48} color="#2563eb" />,
      title: t('serviceTransport'),
      description: t('serviceTransportDesc'),
    },
    {
      icon: <Icons.BarChart size={48} color="#2563eb" />,
      title: t('serviceTracking'),
      description: t('serviceTrackingDesc'),
    },
    {
      icon: <Icons.DollarSign size={48} color="#2563eb" />,
      title: t('servicePricing'),
      description: t('servicePricingDesc'),
    },
    {
      icon: <Icons.Clock size={48} color="#2563eb" />,
      title: t('serviceExpress'),
      description: t('serviceExpressDesc'),
    },
    {
      icon: <Icons.Shield size={48} color="#2563eb" />,
      title: t('serviceInsurance'),
      description: t('serviceInsuranceDesc'),
    },
  ];

  return (
    <div className="services-page">
      <div className="container">
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
    </div>
  );
};

export default Services;




