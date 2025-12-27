import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './PricingForm.scss';

const PricingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    route: '',
    distance: '',
    pricePerKm: '',
    vehicleType: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchPricing();
    }
  }, [id]);

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pricing/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        setError(t('error'));
      }
    } catch (err) {
      setError(t('error'));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value,
      };
      
      // Auto calculate total price
      if (name === 'distance' || name === 'pricePerKm') {
        const distance = parseFloat(name === 'distance' ? value : prev.distance) || 0;
        const pricePerKm = parseFloat(name === 'pricePerKm' ? value : prev.pricePerKm) || 0;
        updated.totalPrice = (distance * pricePerKm).toFixed(2);
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = isEdit
        ? `${API_URL}/api/pricing/${id}`
        : `${API_URL}/api/pricing`;
      const method = isEdit ? 'PUT' : 'POST';

      const totalPrice = (parseFloat(formData.distance) * parseFloat(formData.pricePerKm)).toFixed(2);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          totalPrice,
        }),
      });

      if (response.ok) {
        navigate('/pricing');
      } else {
        const data = await response.json();
        setError(data.error || t('error'));
      }
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-form">
      <div className="form-header">
        <h1>{isEdit ? t('editPricing') : t('newPricingTitle')}</h1>
        <button onClick={() => navigate('/pricing')} className="btn-secondary">
          {t('cancel')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="route">{t('route')} *</label>
            <input
              type="text"
              id="route"
              name="route"
              value={formData.route}
              onChange={handleChange}
              required
              placeholder="Toshkent - Samarqand"
            />
          </div>

          <div className="form-group">
            <label htmlFor="vehicleType">{t('vehicleType')} *</label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              required
            >
              <option value="">{t('selectVehicleType')}</option>
              <option value="Truck">{t('truck')}</option>
              <option value="Van">{t('van')}</option>
              <option value="Car">{t('car')}</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="distance">{t('distance')} (km) *</label>
            <input
              type="number"
              id="distance"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              required
              placeholder="0"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pricePerKm">{t('pricePerKm')} ({t('currency')}) *</label>
            <input
              type="number"
              id="pricePerKm"
              name="pricePerKm"
              value={formData.pricePerKm}
              onChange={handleChange}
              required
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="totalPrice">{t('totalPrice')} ({t('currency')})</label>
          <input
            type="text"
            id="totalPrice"
            value={(parseFloat(formData.distance || 0) * parseFloat(formData.pricePerKm || 0)).toFixed(2)}
            readOnly
            className="readonly-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">{t('description')}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder={t('additionalNotes')}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('saving') : isEdit ? t('updatePricing') : t('createPricingBtn')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="btn-secondary"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PricingForm;


