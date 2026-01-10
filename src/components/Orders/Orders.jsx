import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import { Icons } from '../Icons/Icons';
import './Orders.scss';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { t } = useTranslation();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } else {
        setError(t('error'));
      }
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.trackingNumber?.toLowerCase().includes(term) ||
          order.origin?.toLowerCase().includes(term) ||
          order.destination?.toLowerCase().includes(term) ||
          order.recipientName?.toLowerCase().includes(term) ||
          order.id.toString().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleConvertToShipment = async (orderId) => {
    if (!window.confirm(t('convertOrderConfirm'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders/${orderId}/convert-to-shipment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(t('orderConvertedSuccess'));
        fetchOrders(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || t('error'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Completed':
        return 'status-completed';
      case 'Converted to Shipment':
        return 'status-converted';
      default:
        return '';
    }
  };

  const getStatusTranslation = (status) => {
    switch (status) {
      case 'Pending':
        return t('pending');
      case 'Completed':
        return t('completed');
      case 'Converted to Shipment':
        return t('convertedToShipment');
      default:
        return status;
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'express':
        return 'urgency-express';
      case 'standard':
        return 'urgency-standard';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">{t('loadingOrders')}</div>;
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <h1>{t('orders')}</h1>
        <div className="header-info">
          <p>{t('ordersDescription')}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filter Bar */}
      <div className="orders-filters">
        <div className="search-box">
          <Icons.Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder={t('searchOrdersPlaceholder')}
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
            <option value="Pending">{t('pending')}</option>
            <option value="Completed">{t('completed')}</option>
            <option value="Converted to Shipment">{t('convertedToShipment')}</option>
          </select>
        </div>
        <div className="results-count">
          {t('showing')} {filteredOrders.length} {t('of')} {orders.length} {t('orders')}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>{t('noOrders')}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>{t('noResultsFound')}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="orders-table-container desktop-view">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>{t('id')}</th>
                  <th>{t('trackingNumber')}</th>
                  <th>{t('recipient')}</th>
                  <th>{t('route')}</th>
                  <th>{t('urgency')}</th>
                  <th>{t('price')}</th>
                  <th>{t('status')}</th>
                  <th>{t('created')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td className="tracking-number">{order.trackingNumber || t('nA')}</td>
                    <td>
                      <div className="recipient-info">
                        <div className="name">{order.recipientName}</div>
                        <div className="phone">{order.recipientPhone}</div>
                      </div>
                    </td>
                    <td>
                      <div className="route-info">
                        <div>{order.origin} → {order.destination}</div>
                        <div className="weight">{order.weight} kg</div>
                      </div>
                    </td>
                    <td>
                      <span className={`urgency-badge ${getUrgencyClass(order.urgency)}`}>
                        {order.urgency === 'express' ? t('express') : t('standard')}
                      </span>
                    </td>
                    <td className="price">{order.estimatedPrice?.toLocaleString()} {t('sum')}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {getStatusTranslation(order.status)}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="actions">
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleConvertToShipment(order.id)}
                          className="btn-convert"
                          title={t('convertToShipment')}
                        >
                          <Icons.ArrowRight size={16} />
                          {t('convert')}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // Show order details modal
                          alert(`${t('orderDetails')}: ${JSON.stringify(order, null, 2)}`);
                        }}
                        className="btn-view"
                        title={t('viewDetails')}
                      >
                        <Icons.Eye size={16} />
                        {t('view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="orders-cards mobile-view">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="card-header">
                  <span className="tracking-number">#{order.trackingNumber || order.id}</span>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {getStatusTranslation(order.status)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-row">
                    <span className="label">{t('recipient')}:</span>
                    <span className="value">{order.recipientName}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('phone')}:</span>
                    <span className="value">{order.recipientPhone}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('route')}:</span>
                    <span className="value">{order.origin} → {order.destination}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('urgency')}:</span>
                    <span className={`urgency-badge ${getUrgencyClass(order.urgency)}`}>
                      {order.urgency === 'express' ? t('express') : t('standard')}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('price')}:</span>
                    <span className="value">{order.estimatedPrice?.toLocaleString()} {t('sum')}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">{t('created')}:</span>
                    <span className="value">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="card-actions">
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleConvertToShipment(order.id)}
                      className="btn-convert"
                    >
                      <Icons.ArrowRight size={16} />
                      {t('convert')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      alert(`${t('orderDetails')}: ${JSON.stringify(order, null, 2)}`);
                    }}
                    className="btn-view"
                  >
                    <Icons.Eye size={16} />
                    {t('view')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;