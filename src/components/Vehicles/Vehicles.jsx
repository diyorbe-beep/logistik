import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/client';
import { Icons } from '../Icons/Icons';
import { translateStatus, getStatusClass } from '../../utils/statusUtils';
import './Vehicles.scss';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteVehicleConfirm'))) {
      return;
    }

    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      const message = err.response?.data?.error || err.message || t('error');
      alert(`${t('error')}: ${message}`);
    }
  };

  const getStatusTranslation = (status) => {
    switch (status) {
      case 'Available':
        return t('available');
      case 'In Use':
        return t('inUse');
      case 'Maintenance':
        return t('maintenance');
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'In Use':
        return 'status-in-use';
      case 'Maintenance':
        return 'status-maintenance';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">{t('loadingVehicles')}</div>;
  }

  return (
    <div className="vehicles">
      <div className="vehicles-header">
        <h1>{t('vehicles')}</h1>
        <Link to="/vehicles/new" className="btn-primary">
          {t('newVehicle')}
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <p>{t('noVehicles')}</p>
          <Link to="/vehicles/new" className="btn-primary">
            {t('createVehicle')}
          </Link>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-icon">
                <Icons.Truck size={48} color="#2563eb" />
              </div>
              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <p className="vehicle-type">{vehicle.type}</p>
                {vehicle.licensePlate && (
                  <p className="license-plate">{vehicle.licensePlate}</p>
                )}
                {vehicle.capacity && (
                  <p className="capacity">{t('capacity')}: {vehicle.capacity}</p>
                )}
                <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                  {translateStatus(t, vehicle.status)}
                </span>
              </div>
              <div className="vehicle-actions">
                <Link
                  to={`/vehicles/edit/${vehicle.id}`}
                  className="btn-edit"
                  title={t('editVehicle')}
                >
                  <Icons.Edit size={16} />
                  {t('edit')}
                </Link>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="btn-delete"
                  title={t('deleteVehicle')}
                >
                  <Icons.Trash size={16} />
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
