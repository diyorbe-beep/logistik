import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { API_URL } from '../../config/api';
import './Pricing.scss';

const Pricing = () => {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/pricing`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      }
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pricing/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPricing(pricing.filter(p => p.id !== id));
      } else {
        alert(t('error'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  if (loading) {
    return <div className="pricing-page"><div className="loading">{t('loadingPricing')}</div></div>;
  }

  return (
    <div className="pricing-page">
      <div className="pricing-container">
        <div className="pricing-header">
          <h1>{t('pricing')}</h1>
          <p className="pricing-subtitle">{t('pricingSubtitle') || 'Professional logistics services at competitive prices'}</p>
          {isAdmin && (
            <Link to="/pricing/new" className="btn-primary">
              {t('newPricing')}
            </Link>
          )}
        </div>

        {pricing.length === 0 ? (
          <div className="empty-state">
            <p>{t('noPricing')}</p>
            {isAdmin && (
              <Link to="/pricing/new" className="btn-primary">
                {t('createPricing')}
              </Link>
            )}
          </div>
        ) : (
          <div className="pricing-grid">
            {pricing.map((item) => (
              <div key={item.id} className="pricing-card">
                <div className="pricing-card-header">
                  <h3>{item.route}</h3>
                  <div className="vehicle-type-badge">{item.vehicleType}</div>
                </div>
                <div className="pricing-card-body">
                  <div className="pricing-info">
                    <div className="info-item">
                      <span className="info-label">{t('distance')}:</span>
                      <span className="info-value">{item.distance} km</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">{t('pricePerKm')}:</span>
                      <span className="info-value">{item.pricePerKm} {t('currency')}</span>
                    </div>
                    {item.description && (
                      <div className="info-item description">
                        <p>{item.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="pricing-total">
                    <span className="total-label">{t('totalPrice')}:</span>
                    <span className="total-value">{item.totalPrice.toLocaleString()} {t('currency')}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="pricing-card-actions">
                    <Link to={`/pricing/edit/${item.id}`} className="btn-edit">
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-delete"
                    >
                      {t('delete')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
