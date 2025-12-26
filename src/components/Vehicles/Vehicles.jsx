import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './Vehicles.scss';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchVehicles();
  }, []);

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
    } finally {
      setLoading(false);
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

      <div className="vehicles-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-icon">🚚</div>
            <h3>{vehicle.name}</h3>
            <p className="vehicle-type">{vehicle.type}</p>
            <span className={`status-badge ${vehicle.status.toLowerCase().replace(' ', '-')}`}>
              {getStatusTranslation(vehicle.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vehicles;
