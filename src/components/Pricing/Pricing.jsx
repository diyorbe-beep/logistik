import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { Icons } from '../Icons/Icons';
import PageHeader from '../Common/PageHeader';
import api from '../../api/client';
import './Pricing.scss';

// Import generated image
import pricingConceptImg from '../../assets/images/pricing_calculator.png';

const Pricing = () => {
  const [pricing, setPricing] = useState([]);
  const [filteredPricing, setFilteredPricing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPricing();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPricing(pricing);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredPricing(
        pricing.filter(p =>
          p.route.toLowerCase().includes(q) ||
          p.vehicleType.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, pricing]);

  const fetchPricing = async () => {
    try {
      const response = await api.get('/pricing');
      setPricing(response.data);
      setFilteredPricing(response.data);
    } catch (err) {
      console.error('Error fetching pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      await api.delete(`/pricing/${id}`);
      const updated = pricing.filter(p => p.id !== id);
      setPricing(updated);
      setFilteredPricing(updated);
    } catch (err) {
      console.error('Error deleting pricing:', err);
      alert(t('error'));
    }
  };

  const faqs = [
    { q: t('faqPricing'), a: t('faqPricingAns') },
    { q: t('faqTiming'), a: t('faqTimingAns') },
    { q: t('faqInsurance'), a: t('faqInsuranceAns') }
  ];

  if (loading) {
    return (
      <div className="pricing-redesign loading-state">
        <div className="loading">{t('loadingPricing')}</div>
      </div>
    );
  }

  return (
    <div className="pricing-redesign">
      <PageHeader
        badge={t('pricing')}
        title={t('pricingSubtitle')}
        actions={
          <div className="search-bar">
            <Icons.Search size={20} />
            <input
              type="text"
              placeholder={t('searchRoute')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        }
        visual={
          <img src={pricingConceptImg} alt="Pricing Concept" />
        }
      />

      <section className="pricing-grid-section">
        <div className="container">
          {filteredPricing.length === 0 ? (
            <div className="empty-state">
              <Icons.Package size={64} />
              <h3>{t('noPricing')}</h3>
              {isAdmin && (
                <Link to="/pricing/new" className="btn-primary">
                  {t('createPricing')}
                </Link>
              )}
            </div>
          ) : (
            <div className="pricing-grid">
              {filteredPricing.map((item) => (
                <div key={item.id} className="pricing-card">
                  <div className="card-header">
                    <div className="vehicle-icon">
                      {item.vehicleType.toLowerCase().includes('truck') ? <Icons.Truck size={32} /> :
                        item.vehicleType.toLowerCase().includes('van') ? <Icons.Package size={32} /> :
                          <Icons.Package size={32} />}
                    </div>
                    <div className="vehicle-info">
                      <h3>{item.vehicleType}</h3>
                      <span className="route-name">{item.route}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="metric">
                      <div className="metric-icon"><Icons.Navigation size={18} /></div>
                      <div className="metric-data">
                        <span className="label">{t('distance')}</span>
                        <span className="value">{item.distance} km</span>
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-icon"><Icons.DollarSign size={18} /></div>
                      <div className="metric-data">
                        <span className="label">{t('pricePerKm')}</span>
                        <span className="value">{item.pricePerKm.toLocaleString()} {t('currency')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="price-total">
                      <span className="label">{t('totalPrice')}</span>
                      <span className="amount">{item.totalPrice.toLocaleString()} <sub>{t('currency')}</sub></span>
                    </div>

                    <div className="card-actions">
                      <Link to="/contact" className="btn-order">{t('orderNow')}</Link>
                      {isAdmin && (
                        <div className="admin-actions">
                          <Link to={`/pricing/edit/${item.id}`} className="btn-icon-action" title={t('edit')}>
                            <Icons.Edit size={16} />
                          </Link>
                          <button onClick={() => handleDelete(item.id)} className="btn-icon-action delete" title={t('delete')}>
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('faq')}</h2>
            <p>{t('faqLogistics')}</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card">
                <div className="faq-icon"><Icons.Info size={20} /></div>
                <div className="faq-text">
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isAdmin && (
        <div className="admin-fab">
          <Link to="/pricing/new" className="btn-fab" title={t('newPricing')}>
            <Icons.Plus size={24} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Pricing;
