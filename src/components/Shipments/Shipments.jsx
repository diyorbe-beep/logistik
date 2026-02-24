import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import api from '../../api/client';
import { Icons } from '../Icons/Icons';
import { translateStatus } from '../../utils/statusUtils';
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
  const [activeTab, setActiveTab] = useState('my_shipments');

  const canDelete = user && (user.role === 'admin' || user.role === 'operator');
  const canEdit = user && (user.role === 'admin' || user.role === 'operator' || user.role === 'carrier');

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [searchTerm, statusFilter, shipments, activeTab, user]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shipments');
      setShipments(response.data);
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = [...shipments];

    if (isCarrier) {
      if (activeTab === 'available_shipments') {
        filtered = filtered.filter(s => !s.carrierId || s.carrierId === 'null');
      } else {
        filtered = filtered.filter(s => String(s.carrierId) === String(user.id));
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.trackingNumber?.toLowerCase().includes(term) ||
        s.origin?.toLowerCase().includes(term) ||
        s.destination?.toLowerCase().includes(term) ||
        (s.id && s.id.toString().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredShipments(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await api.delete(`/shipments/${id}`);
      setShipments(shipments.filter(s => s.id !== id));
    } catch (err) {
      alert(t('error'));
    }
  };

  const handleAcceptShipment = async (id) => {
    try {
      await api.post(`/shipments/${id}/accept`);
      await fetchShipments();
      setActiveTab('my_shipments');
    } catch (err) {
      alert(t('error'));
    }
  };

  if (loading) return <div className="loading-saas">{t('loading')}...</div>;

  return (
    <div className="shipments-saas">
      <div className="page-header-saas">
        <div className="header-left">
          <h1>{t('shipments')}</h1>
          <p>{t('manageShipmentsSubtitle') || 'Monitor and coordinate all freight movements.'}</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'operator') && (
          <Link to="/shipments/new" className="btn-primary">
            <Icons.Plus size={20} />
            {t('newShipment')}
          </Link>
        )}
      </div>

      <div className="filters-bar-saas">
        <div className="search-field">
          <Icons.Search size={18} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">{t('allStatuses')}</option>
            <option value="Received">{t('received')}</option>
            <option value="In Transit">{t('inTransit')}</option>
            <option value="Delivered">{t('delivered')}</option>
          </select>
        </div>

        {isCarrier && (
          <div className="tab-switcher-saas">
            <button className={activeTab === 'my_shipments' ? 'active' : ''} onClick={() => setActiveTab('my_shipments')}>{t('myShipments')}</button>
            <button className={activeTab === 'available_shipments' ? 'active' : ''} onClick={() => setActiveTab('available_shipments')}>{t('availableShipments')}</button>
          </div>
        )}
      </div>

      <div className="data-table-saas">
        {filteredShipments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>{t('trackingNumber')}</th>
                <th>{t('route')}</th>
                <th>{t('status')}</th>
                <th>{t('carrier')}</th>
                <th>{t('created')}</th>
                <th className="actions-col">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map(shipment => (
                <tr key={shipment.id}>
                  <td className="tracking-cell">
                    <div className="tracking-id">#{shipment.trackingNumber || shipment.id}</div>
                  </td>
                  <td>
                    <div className="route-info">
                      <span>{shipment.origin}</span>
                      <Icons.ArrowRight size={14} />
                      <span>{shipment.destination}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${shipment.status ? shipment.status.toLowerCase().replace(/\s+/g, '-') : 'pending'}`}>
                      {translateStatus(t, shipment.status)}
                    </span>
                  </td>
                  <td>{shipment.carrierName || '---'}</td>
                  <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {isCarrier && activeTab === 'available_shipments' ? (
                      <button onClick={() => handleAcceptShipment(shipment.id)} className="btn-accept">{t('accept')}</button>
                    ) : (
                      <div className="action-btns">
                        {canEdit && <Link to={`/shipments/edit/${shipment.id}`} className="edit-link"><Icons.Edit size={16} /></Link>}
                        {canDelete && <button onClick={() => handleDelete(shipment.id)} className="delete-btn"><Icons.Trash size={16} /></button>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-results-saas">
            <Icons.Package size={48} />
            <p>{t('noShipmentsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shipments;
