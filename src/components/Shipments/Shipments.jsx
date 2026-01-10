import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { API_URL } from '../../config/api';
import { Icons } from '../Icons/Icons';
import './Shipments.scss';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { t } = useTranslation();
  const { user } = useUser();

  // Check if user can edit/delete shipments
  const canEditDelete = user && (user.role === 'admin' || user.role === 'operator');

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [searchTerm, statusFilter, shipments]);

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShipments(data);
        setFilteredShipments(data);
      } else {
        setError(t('error'));
      }
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = [...shipments];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (shipment) =>
          shipment.trackingNumber?.toLowerCase().includes(term) ||
          shipment.origin?.toLowerCase().includes(term) ||
          shipment.destination?.toLowerCase().includes(term) ||
          shipment.customerName?.toLowerCase().includes(term) ||
          shipment.id.toString().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((shipment) => shipment.status === statusFilter);
    }

    setFilteredShipments(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShipments(shipments.filter(s => s.id !== id));
      } else {
        alert(t('error'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Received':
        return 'status-received';
      case 'In Transit':
        return 'status-in-transit';
      case 'Delivered':
        return 'status-delivered';
      default:
        return '';
    }
  };

  const getStatusTranslation = (status) => {
    switch (status) {
      case 'Received':
        return t('received');
      case 'In Transit':
        return t('inTransit');
      case 'Delivered':
        return t('delivered');
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="loading">{t('loadingShipments')}</div>;
  }

  return (
    <div className="shipments">
      <div className="shipments-header">
        <h1>{t('shipments')}</h1>
        {canEditDelete && (
          <Link to="/shipments/new" className="btn-primary">
            {t('newShipment')}
          </Link>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filter Bar */}
      <div className="shipments-filters">
        <div className="search-box">
          <Icons.Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <label>{t('filterByStatus')}:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="Received">{t('received')}</option>
            <option value="In Transit">{t('inTransit')}</option>
            <option value="Delivered">{t('delivered')}</option>
          </select>
        </div>
        <div className="results-count">
          {t('showing')} {filteredShipments.length} {t('of')} {shipments.length} {t('shipments')}
        </div>
      </div>

      {shipments.length === 0 ? (
        <div className="empty-state">
          <p>{t('noShipments')}</p>
          {canEditDelete && (
            <Link to="/shipments/new" className="btn-primary">
              {t('createShipment')}
            </Link>
          )}
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="empty-state">
          <p>{t('noResultsFound')}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="shipments-table-container desktop-view">
            <table className="shipments-table">
              <thead>
                <tr>
                  <th>{t('id')}</th>
                  <th>{t('trackingNumber')}</th>
                  <th>{t('origin')}</th>
                  <th>{t('destination')}</th>
                  <th>{t('status')}</th>
                  <th>{t('vehicle')}</th>
                  <th>{t('created')}</th>
                  {canEditDelete && <th>{t('actions')}</th>}
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>{shipment.id}</td>
                    <td className="tracking-number">{shipment.trackingNumber || t('nA')}</td>
                    <td>{shipment.origin}</td>
                    <td>{shipment.destination}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(shipment.status)}`}>
                        {getStatusTranslation(shipment.status)}
                      </span>
                    </td>
                    <td>{shipment.vehicle || t('nA')}</td>
                    <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                    {canEditDelete && (
                      <td className="actions">
                        <Link to={`/shipments/edit/${shipment.id}`} className="btn-edit">
                          <Icons.Edit size={16} />
                          {t('edit')}
                        </Link>
                        <button
                          onClick={() => handleDelete(shipment.id)}
                          className="btn-delete"
                        >
                          <Icons.Trash size={16} />
                          {t('delete')}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="shipments-cards mobile-view">
            {filteredShipments.map((shipment) => (
              <div key={shipment.id} className="shipment-card">
                <div className="card-header">
                  <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                  <span className={`status-badge ${getStatusClass(shipment.status)}`}>
                    {getStatusTranslation(shipment.status)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-row">
                    <span className="label">{t('origin')}:</span>
                    <span className="value">{shipment.origin}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('destination')}:</span>
                    <span className="value">{shipment.destination}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('vehicle')}:</span>
                    <span className="value">{shipment.vehicle || t('nA')}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('created')}:</span>
                    <span className="value">{new Date(shipment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {canEditDelete && (
                  <div className="card-actions">
                    <Link to={`/shipments/edit/${shipment.id}`} className="btn-edit">
                      <Icons.Edit size={16} />
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(shipment.id)}
                      className="btn-delete"
                    >
                      <Icons.Trash size={16} />
                      {t('delete')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Shipments;
