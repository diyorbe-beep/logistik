import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import api from '../../api/client';
import { Icons } from '../Icons/Icons';
import { translateStatus, getStatusClass } from '../../utils/statusUtils';
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

  const isCarrier = user?.role === 'carrier';
  const [activeTab, setActiveTab] = useState('my_shipments'); // 'my_shipments' or 'available_shipments'

  // Permissions
  const canDelete = user && (user.role === 'admin' || user.role === 'operator');
  const canEdit = user && (user.role === 'admin' || user.role === 'operator' || user.role === 'carrier');

  useEffect(() => {
    fetchShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, shipments, activeTab, user]);

  const fetchShipments = async () => {
    try {
      const response = await api.get('/shipments');
      setShipments(response.data);
      // Removed setFilteredShipments here to let the effect handle it
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = [...shipments];

    // Carrier Tab Filter
    if (isCarrier) {
      if (activeTab === 'available_shipments') {
        filtered = filtered.filter(s => !s.carrierId || s.carrierId === 'null');
      } else {
        filtered = filtered.filter(s => String(s.carrierId) === String(user.id));
      }
    }

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
      await api.delete(`/shipments/${id}`);
      // Optimistic update
      const updatedShipments = shipments.filter(s => s.id !== id);
      setShipments(updatedShipments);
    } catch (err) {
      alert(t('error'));
    }
  };

  const handleAcceptShipment = async (id) => {
    try {
      setLoading(true);
      await api.post(`/shipments/${id}/accept`);
      // Refresh to move from available to my shipments
      await fetchShipments();
      setActiveTab('my_shipments');
      alert(t('shipmentAccepted'));
    } catch (err) {
      console.error('Accept shipment error:', err);
      const message = err.response?.data?.error || err.message || t('error');
      alert(`${t('error')}: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Status helpers removed as they are now in statusUtils

  if (loading) {
    return <div className="loading">{t('loadingShipments')}</div>;
  }

  return (
    <div className="shipments">
      <div className="shipments-header">
        <h1>{t('shipments')}</h1>
        {(user?.role === 'admin' || user?.role === 'operator') && (
          <Link to="/shipments/new" className="btn-primary">
            {t('newShipment')}
          </Link>
        )}
      </div>

      {isCarrier && (
        <div className="shipment-tabs">
          <button
            className={`tab-btn ${activeTab === 'my_shipments' ? 'active' : ''}`}
            onClick={() => setActiveTab('my_shipments')}
          >
            {t('myShipments')}
            <span className="badge">
              {shipments.filter(s => String(s.carrierId) === String(user.id)).length}
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'available_shipments' ? 'active' : ''}`}
            onClick={() => setActiveTab('available_shipments')}
          >
            {t('availableShipments')}
            <span className="badge badge-new">
              {shipments.filter(s => !s.carrierId || s.carrierId === 'null').length}
            </span>
          </button>
        </div>
      )}

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
          {t('showing')} {filteredShipments.length} {t('shipments')}
        </div>
      </div>

      {shipments.length === 0 ? (
        <div className="empty-state">
          <p>{t('noShipments')}</p>
          {(user?.role === 'admin' || user?.role === 'operator') && (
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
                  <th>T/r</th>
                  <th>{t('trackingNumber')}</th>
                  <th>{t('origin')}</th>
                  <th>{t('destination')}</th>
                  <th>{t('status')}</th>
                  <th>{t('vehicle')}</th>
                  <th>{t('carrier')}</th>
                  <th>{t('created')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment, index) => (
                  <tr key={shipment.id}>
                    <td><strong>{index + 1}</strong></td>
                    <td className="tracking-number">{shipment.trackingNumber || t('nA')}</td>
                    <td>{shipment.origin}</td>
                    <td>{shipment.destination}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(shipment.status)}`}>
                        {translateStatus(t, shipment.status)}
                      </span>
                    </td>
                    <td>{shipment.vehicle || t('nA')}</td>
                    <td>{shipment.carrierName || shipment.carrierId || t('nA')}</td>
                    <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      {/* Carrier Accept Button */}
                      {isCarrier && activeTab === 'available_shipments' ? (
                        <button
                          onClick={() => handleAcceptShipment(shipment.id)}
                          className="btn-primary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '13px' }}
                        >
                          {t('accept')}
                        </button>
                      ) : (
                        <>
                          {canEdit && (
                            <Link to={`/shipments/edit/${shipment.id}`} className="btn-edit">
                              <Icons.Edit size={16} />
                              {t('edit')}
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(shipment.id)}
                              className="btn-delete"
                            >
                              <Icons.Trash size={16} />
                              {t('delete')}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="shipments-cards mobile-view">
            {filteredShipments.map((shipment, index) => (
              <div key={shipment.id} className="shipment-card">
                <div className="card-header">
                  <span className="tracking-number">#{index + 1} - {shipment.trackingNumber || shipment.id}</span>
                  <span className={`status-badge ${getStatusClass(shipment.status)}`}>
                    {translateStatus(t, shipment.status)}
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
                    <span className="label">{t('carrier')}:</span>
                    <span className="value">{shipment.carrierName || shipment.carrierId || t('nA')}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('created')}:</span>
                    <span className="value">{new Date(shipment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="card-actions">
                  {/* Carrier Accept Button Mobile */}
                  {isCarrier && activeTab === 'available_shipments' ? (
                    <button
                      onClick={() => handleAcceptShipment(shipment.id)}
                      className="btn-primary"
                      style={{ width: '100%' }}
                    >
                      {t('accept')}
                    </button>
                  ) : (
                    <>
                      {canEdit && (
                        <Link to={`/shipments/edit/${shipment.id}`} className="btn-edit">
                          <Icons.Edit size={16} />
                          {t('edit')}
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(shipment.id)}
                          className="btn-delete"
                        >
                          <Icons.Trash size={16} />
                          {t('delete')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Shipments;
