import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './VehicleForm.scss';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    licensePlate: '',
    capacity: '',
    status: 'Available',
    driverName: '',
    driverPhone: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/vehicles/${id}`, {
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
        ? `${API_URL}/api/vehicles/${id}`
        : `${API_URL}/api/vehicles`;
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
        navigate('/vehicles');
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
    <div className="vehicle-form">
      <div className="form-header">
        <h1>{isEdit ? t('editVehicle') : t('newVehicle')}</h1>
        <button onClick={() => navigate('/vehicles')} className="btn-secondary">
          {t('cancel')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">{t('vehicleName')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Truck-001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">{t('vehicleType')} *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
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
            <label htmlFor="licensePlate">{t('licensePlate')}</label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              placeholder="01 A 123 AB"
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity">{t('capacity')}</label>
            <input
              type="text"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="5 ton"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="driverName">{t('driverName')}</label>
            <input
              type="text"
              id="driverName"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              placeholder={t('enterDriverName')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="driverPhone">{t('driverPhone')}</label>
            <input
              type="tel"
              id="driverPhone"
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleChange}
              placeholder="+998 90 123 45 67"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">{t('status')} *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Available">{t('available')}</option>
            <option value="In Use">{t('inUse')}</option>
            <option value="Maintenance">{t('maintenance')}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">{t('notes')}</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder={t('additionalNotes')}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('saving') : isEdit ? t('updateVehicle') : t('createVehicle')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="btn-secondary"
          >
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;



