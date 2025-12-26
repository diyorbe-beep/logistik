import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './Pricing.scss';

const Pricing = () => {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pricing`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
    return <div className="loading">{t('loadingPricing')}</div>;
  }

  return (
    <div className="pricing">
      <div className="pricing-header">
        <h1>{t('pricing')}</h1>
        <Link to="/pricing/new" className="btn-primary">
          {t('newPricing')}
        </Link>
      </div>

      {pricing.length === 0 ? (
        <div className="empty-state">
          <p>{t('noPricing')}</p>
          <Link to="/pricing/new" className="btn-primary">
            {t('createPricing')}
          </Link>
        </div>
      ) : (
        <div className="pricing-table-container">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>{t('id')}</th>
                <th>{t('route')}</th>
                <th>{t('distance')}</th>
                <th>{t('pricePerKm')}</th>
                <th>{t('totalPrice')}</th>
                <th>{t('vehicleType')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.route}</td>
                  <td>{item.distance} km</td>
                  <td>{item.pricePerKm} {t('currency')}</td>
                  <td className="total-price">{item.totalPrice} {t('currency')}</td>
                  <td>{item.vehicleType}</td>
                  <td className="actions">
                    <Link to={`/pricing/edit/${item.id}`} className="btn-edit">
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-delete"
                    >
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Pricing;

