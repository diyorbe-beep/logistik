import { useTranslation } from '../../hooks/useTranslation';
import { Icons } from '../Icons/Icons';
import { Link } from 'react-router-dom';
import PageHeader from '../Common/PageHeader';
import './Services.scss';

// Import generated images
import collaborationImg from '../../assets/images/services_collaboration.png';
import globalLogisticsImg from '../../assets/images/services_global.png';
import warehouseImg from '../../assets/images/services_warehouse.png';

const Services = () => {
  const { t } = useTranslation();

  const servicesData = [
    {
      id: 'local',
      title: t('localTransport'),
      description: t('localTransportDesc'),
      image: collaborationImg,
      icon: <Icons.Truck size={24} />,
      features: [
        t('featureAllRegions'),
        t('featureFastReliable'),
        t('featureTracking'),
        t('featureInsurance')
      ],
      reverse: false
    },
    {
      id: 'global',
      title: t('globalLogistics'),
      description: t('globalLogisticsDesc'),
      image: globalLogisticsImg,
      icon: <Icons.Globe size={24} />,
      features: [
        t('featureCustoms'),
        t('featureMultiModal'),
        t('featureGlobalNetwork'),
        t('featureTracking')
      ],
      reverse: true
    },
    {
      id: 'warehouse',
      title: t('warehouseServices'),
      description: t('warehouseServicesDesc'),
      image: warehouseImg,
      icon: <Icons.Package size={24} />,
      features: [
        t('featureAddressStorage'),
        t('featureInventory'),
        t('featureSecurity'),
        t('featureTracking')
      ],
      reverse: false
    }
  ];

  return (
    <div className="services-redesign">
      <PageHeader
        badge={t('ourServices')}
        title={t('servicesTitle')}
        description={t('servicesDescUnified')}
        centered
      />

      <section className="services-content">
        <div className="container">
          {servicesData.map((service, index) => (
            <div key={service.id} className={`service-row ${service.reverse ? 'reverse' : ''}`}>
              <div className="service-text-content">
                <div className="icon-wrapper">
                  {service.icon}
                </div>
                <h2>{service.title}</h2>
                <p className="service-description">{service.description}</p>

                <ul className="feature-list">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>
                      <Icons.Check size={16} className="check-icon" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/contact" className="btn-details">
                  {t('moreDetails')}
                  <Icons.ArrowRight size={18} />
                </Link>
              </div>

              <div className="service-visual">
                <div className="image-container">
                  <img src={service.image} alt={service.title} />
                  <div className="image-overlay"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Services;
