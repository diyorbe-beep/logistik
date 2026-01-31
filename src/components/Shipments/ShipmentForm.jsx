import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './ShipmentForm.scss';

const ShipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { t } = useTranslation();
  const { user } = useUser();
  const isCarrier = user?.role === 'carrier';

  const [formData, setFormData] = useState({
    trackingNumber: '',
    origin: '',
    destination: '',
    status: 'Received',
    vehicle: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    weight: '',
    description: '',
  });

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
    if (isEdit) {
      fetchShipment();
    }
  }, [id]);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const fetchShipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments/${id}`, {
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = isEdit
        ? `${API_URL}/api/shipments/${id}`
        : `${API_URL}/api/shipments`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/shipments');
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
    <div className="shipment-form">
      <div className="form-header">
        <h1>{isEdit ? t('editShipment') : t('newShipmentTitle')}</h1>
        <button onClick={() => navigate('/shipments')} className="btn-secondary">
          {t('cancel')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="trackingNumber">{t('trackingNumberRequired')}</label>
            <input
              type="text"
              id="trackingNumber"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleChange}
              required
              placeholder={t('trackingNumberPlaceholder')}
              disabled={isCarrier}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">{t('statusRequired')}</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Received">{t('received')}</option>
              <option value="In Transit">{t('inTransit')}</option>
              <option value="Delivered">{t('delivered')}</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="origin">{t('originRequired')}</label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              required
              placeholder={t('enterOrigin')}
              disabled={isCarrier}
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination">{t('destinationRequired')}</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              placeholder={t('enterDestination')}
              disabled={isCarrier}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vehicle">{t('vehicle')}</label>
            <select
              id="vehicle"
              name="vehicle"
              value={formData.vehicle}
              onChange={handleChange}
            >
              <option value="">{t('selectVehicle')}</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.name}>
                  {vehicle.name} - {vehicle.type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="weight">{t('weight')}</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="customerName">{t('customerNameRequired')}</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder={t('enterContactName')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">{t('customerEmail')}</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="customer@example.com"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="customerPhone">{t('customerPhone')}</label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="+1234567890"
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
            {loading ? t('saving') : isEdit ? t('updateShipment') : t('createShipmentBtn')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="btn-secondary"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;
