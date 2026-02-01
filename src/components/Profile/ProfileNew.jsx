import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import api from '../../api/client';
import { Icons } from '../Icons/Icons';
import Loading, { SkeletonLoader, CardSkeleton } from '../Loading/Loading';
import DeliveryCompletionModal from '../DeliveryCompletion/DeliveryCompletionModal';
import { translateStatus, getStatusClass } from '../../utils/statusUtils';
import './ProfileNew.scss';

const ProfileNew = () => {
  const navigate = useNavigate();
  const { user: contextUser, refetchUser, logout, loading: userLoading } = useUser();
  const [user, setUser] = useState(contextUser);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
  });
  const [deliveryModal, setDeliveryModal] = useState({ isOpen: false, shipment: null });
  const { t } = useTranslation();

  // Helper for status translation removed as it's now in statusUtils

  // Optimized API calls without useApi (standardized)
  const [allShipments, setAllShipments] = useState([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [rawOrders, setRawOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchShipments = useCallback(async () => {
    if (!contextUser) return;
    setShipmentsLoading(true);
    try {
      const response = await api.get('/shipments');
      setAllShipments(response.data || []);
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setShipmentsLoading(false);
    }
  }, [contextUser]);

  const fetchOrders = useCallback(async () => {
    if (contextUser?.role !== 'customer') return;
    setOrdersLoading(true);
    try {
      const response = await api.get('/orders');
      setRawOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [contextUser]);

  useEffect(() => {
    if (contextUser) {
      fetchShipments();
      if (contextUser.role === 'customer') {
        fetchOrders();
      }
    }
  }, [contextUser?.id, contextUser?.role, fetchShipments, fetchOrders]);

  // Alias for availableLoading since it uses the same data source
  const availableLoading = shipmentsLoading;

  // Derived state based on role
  const safeAllShipments = allShipments || [];
  const myShipments = safeAllShipments.filter(s => String(s.carrierId) === String(user?.id));

  const availableShipments = safeAllShipments.filter(s =>
    (!s.carrierId || String(s.carrierId) === 'null') && s.status !== 'Delivered'
  );

  // Ensure arrays are always arrays (additional safety)
  const orders = Array.isArray(rawOrders) ? rawOrders : [];

  // Combined loading state
  const loading = userLoading || shipmentsLoading || ordersLoading;

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setFormData({
        username: contextUser.username || '',
        email: contextUser.email || '',
        phone: contextUser.phone || '',
      });
    }
  }, [contextUser]);

  // Optimized refresh function
  const refreshData = useCallback(() => {
    refetchUser();
    fetchShipments();
    if (contextUser?.role === 'customer') {
      fetchOrders();
    }
  }, [contextUser?.role, refetchUser, fetchShipments, fetchOrders]);

  // Accept shipment function
  const handleAcceptShipment = async (shipmentId) => {
    try {
      await api.put(`/shipments/${shipmentId}`, {
        carrierId: user.id,
        status: 'In Transit',
        note: 'Shipment accepted by carrier'
      });

      // Refresh data after accepting
      refreshData();
      alert(t('shipmentAccepted'));
    } catch (error) {
      console.error('Error accepting shipment:', error);
      const message = error.response?.data?.error || error.message || t('error');
      alert(`${t('error')}: ${message}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Loading state with better UX
  if (loading && !user) {
    return <Loading message={t('loadingProfile')} size="large" />;
  }

  const role = user?.role || 'customer';

  const getRoleIcon = () => {
    switch (role) {
      case 'admin': return 'A';
      case 'operator': return 'O';
      case 'carrier': return 'C';
      case 'customer': return 'U';
      default: return 'U';
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin': return '#f59e0b';
      case 'operator': return '#6b7280';
      case 'carrier': return '#2563eb';
      case 'customer': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStats = () => {
    // Get role from user or contextUser
    const currentRole = user?.role || contextUser?.role;

    // Ensure arrays are not null/undefined
    const safeMyShipments = myShipments || [];
    const safeAvailableShipments = availableShipments || [];
    const safeOrders = orders || [];

    if (currentRole === 'carrier') {
      return {
        total: safeMyShipments.length,
        completed: safeMyShipments.filter(s => s.status === 'Delivered').length,
        inProgress: safeMyShipments.filter(s => s.status === 'In Transit').length,
        available: safeAvailableShipments.length
      };
    } else if (currentRole === 'customer') {
      return {
        total: safeOrders.length,
        completed: safeOrders.filter(o => o.status === 'Completed').length,
        pending: safeOrders.filter(o => o.status === 'Pending').length,
        shipments: safeMyShipments.length
      };
    }
    return {
      total: 0,
      completed: 0,
      pending: 0,
      available: 0,
      shipments: 0,
      inProgress: 0
    };
  };

  const stats = getStats();

  return (
    <div className="profile-new">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar" style={{ backgroundColor: getRoleColor() }}>
              <span className="avatar-icon">{getRoleIcon()}</span>
            </div>
            <div className="user-details">
              <h1>{user?.username || t('nA')}</h1>
              <p className="user-role">{t(role)}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={refreshData} className="btn-refresh">
              {t('refresh')}
            </button>
            <button onClick={handleLogout} className="btn-logout">
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {role === 'carrier' && (
          <>
            <div className="stat-card">
              <div className="stat-icon">
                <span>{t('total')}</span>
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>{t('totalShipments')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>{t('completed')}</span>
              </div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>{t('completed')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>{t('inProgress')}</span>
              </div>
              <div className="stat-info">
                <h3>{stats.inProgress}</h3>
                <p>{t('inProgress')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>{t('new')}</span>
              </div>
              <div className="stat-info">
                <h3>{stats.available}</h3>
                <p>{t('availableShipments')}</p>
              </div>
            </div>
          </>
        )}

        {role === 'customer' && (
          <>
            <div className="stat-card">
              <div className="stat-icon">
                <span>{t('orders')}</span>
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>{t('totalShipments')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>{t('completed')}</span>
              </div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>{t('completed')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>{t('wait')}</span>
              </div>
              <div className="stat-info">
                <h3>{stats.pending}</h3>
                <p>{t('pending')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>{t('shipment')}</span>
              </div>
              <div className="stat-info">
                <h3>{stats.shipments}</h3>
                <p>{t('shipments')}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="profile-main">
        {/* Sidebar for Carrier */}
        {role === 'carrier' && (
          <div className="profile-sidebar">
            <div className="sidebar-section">
              <h3>{t('availableShipments')} ({(availableShipments || []).length})</h3>
              <div className="sidebar-content">
                {availableLoading ? (
                  <CardSkeleton count={2} />
                ) : (availableShipments || []).length > 0 ? (
                  <div className="shipments-list">
                    {(availableShipments || []).slice(0, 5).map(shipment => (
                      <div key={shipment.id} className="shipment-card-mini">
                        <div className="shipment-header">
                          <h4>#{shipment.id}</h4>
                          <span className="status available">{t('available')}</span>
                        </div>
                        <div className="shipment-details">
                          <p><strong>{t('from')}:</strong> {shipment.origin}</p>
                          <p><strong>{t('to')}:</strong> {shipment.destination}</p>
                          <p><strong>{t('weight_kg')}:</strong> {shipment.weight} kg</p>
                        </div>
                        <button
                          className="btn-accept-mini"
                          onClick={() => handleAcceptShipment(shipment.id)}
                        >
                          {t('accept')}
                        </button>
                      </div>
                    ))}
                    {(availableShipments || []).length > 5 && (
                      <button
                        className="view-all-btn"
                        onClick={() => handleTabChange('available')}
                      >
                        {t('viewAll')} ({(availableShipments || []).length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="empty-state-mini">
                    <p>{t('noAvailableShipments')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>{t('myShipments')} ({(myShipments || []).length})</h3>
              <div className="sidebar-content">
                {shipmentsLoading ? (
                  <CardSkeleton count={2} />
                ) : (myShipments || []).length > 0 ? (
                  <div className="shipments-list">
                    {(myShipments || []).slice(0, 5).map(shipment => (
                      <div key={shipment.id} className="shipment-card-mini">
                        <div className="shipment-header">
                          <h4>#{shipment.id}</h4>
                          <span className={`status ${shipment.status.toLowerCase().replace(' ', '-')}`}>
                            {getStatusTranslation(shipment.status)}
                          </span>
                        </div>
                        <div className="shipment-details">
                          <p><strong>{t('from')}:</strong> {shipment.origin}</p>
                          <p><strong>{t('to')}:</strong> {shipment.destination}</p>
                          <p><strong>{t('weight_kg')}:</strong> {shipment.weight} kg</p>
                        </div>
                        {shipment.status === 'In Transit' && (
                          <button
                            className="btn-complete-mini"
                            onClick={() => setDeliveryModal({ isOpen: true, shipment })}
                          >
                            {t('finish')}
                          </button>
                        )}
                      </div>
                    ))}
                    {(myShipments || []).length > 5 && (
                      <button
                        className="view-all-btn"
                        onClick={() => handleTabChange('my-shipments')}
                      >
                        {t('viewAll')} ({(myShipments || []).length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="empty-state-mini">
                    <p>{t('noShipments')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`profile-content ${role === 'carrier' ? 'with-sidebar' : ''}`}>
          {/* Navigation Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              {t('overview')}
            </button>

            {role === 'carrier' && (
              <>
                <button
                  className={`tab ${activeTab === 'available' ? 'active' : ''}`}
                  onClick={() => handleTabChange('available')}
                >
                  {t('allAvailableShipments')}
                </button>
                <button
                  className={`tab ${activeTab === 'my-shipments' ? 'active' : ''}`}
                  onClick={() => handleTabChange('my-shipments')}
                >
                  {t('allMyShipments')}
                </button>
              </>
            )}

            {role === 'customer' && (
              <>
                <button
                  className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => handleTabChange('orders')}
                >
                  {t('myOrdersList')} ({(orders || []).length})
                </button>
                <button
                  className={`tab ${activeTab === 'shipments' ? 'active' : ''}`}
                  onClick={() => handleTabChange('shipments')}
                >
                  {t('myShipmentsList')} ({(myShipments || []).length})
                </button>
              </>
            )}

            <button
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              {t('settings')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="welcome-card">
                  <h2>{t('welcomeUser')}, {user?.username}!</h2>
                  <p>{t('welcomeSubtitle')}</p>
                </div>

                {role === 'carrier' && (
                  <div className="quick-actions">
                    <h3>{t('quickActions')}</h3>
                    <div className="action-buttons">
                      <button onClick={() => handleTabChange('available')} className="action-btn">
                        {t('allAvailableShipments')}
                      </button>
                      <button onClick={() => handleTabChange('my-shipments')} className="action-btn">
                        {t('allMyShipments')}
                      </button>
                    </div>
                  </div>
                )}

                {role === 'customer' && (
                  <div className="quick-actions">
                    <h3>{t('quickActions')}</h3>
                    <div className="action-buttons">
                      <Link to="/orders/new" className="action-btn">
                        {t('createOrder')}
                      </Link>
                      <button onClick={() => handleTabChange('orders')} className="action-btn">
                        {t('myOrdersList')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'available' && role === 'carrier' && (
              <div className="shipments-content">
                <h3>{t('allAvailableShipments')}</h3>
                {availableLoading ? (
                  <CardSkeleton count={3} />
                ) : (availableShipments || []).length > 0 ? (
                  <div className="shipments-grid">
                    {(availableShipments || []).map(shipment => (
                      <div key={shipment.id} className="shipment-card">
                        <div className="shipment-header">
                          <h4>#{shipment.id}</h4>
                          <span className="status available">{t('available')}</span>
                        </div>
                        <div className="shipment-details">
                          <p><strong>{t('from')}:</strong> {shipment.origin}</p>
                          <p><strong>{t('to')}:</strong> {shipment.destination}</p>
                          <p><strong>{t('weight_kg')}:</strong> {shipment.weight} kg</p>
                        </div>
                        <button
                          className="btn-accept"
                          onClick={() => handleAcceptShipment(shipment.id)}
                        >
                          {t('accept')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>{t('noAvailableShipments')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-shipments' && (
              <div className="shipments-content">
                <h3>{t('allMyShipments')}</h3>
                {shipmentsLoading ? (
                  <CardSkeleton count={3} />
                ) : (myShipments || []).length > 0 ? (
                  <div className="shipments-grid">
                    {(myShipments || []).map(shipment => (
                      <div key={shipment.id} className="shipment-card">
                        <div className="shipment-header">
                          <h4>#{shipment.id}</h4>
                          <span className={`status ${getStatusClass(shipment.status)}`}>
                            {translateStatus(t, shipment.status)}
                          </span>
                        </div>
                        <div className="shipment-details">
                          <p><strong>{t('from')}:</strong> {shipment.origin}</p>
                          <p><strong>{t('to')}:</strong> {shipment.destination}</p>
                          <p><strong>{t('weight_kg')}:</strong> {shipment.weight} kg</p>
                        </div>
                        {shipment.status === 'In Transit' && (
                          <button
                            className="btn-complete"
                            onClick={() => setDeliveryModal({ isOpen: true, shipment })}
                          >
                            {t('completeDelivery')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>{t('noShipments')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && role === 'customer' && (
              <div className="orders-content">
                <h3>{t('myOrdersList')}</h3>
                {ordersLoading ? (
                  <CardSkeleton count={3} />
                ) : (orders || []).length > 0 ? (
                  <div className="orders-grid">
                    {(orders || []).map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <h4>#{order.trackingNumber || order.id}</h4>
                          <span className={`status ${getStatusClass(order.status)}`}>
                            {translateStatus(t, order.status)}
                          </span>
                        </div>
                        <div className="order-details">
                          <p><strong>{t('from')}:</strong> {order.origin}</p>
                          <p><strong>{t('to')}:</strong> {order.destination}</p>
                          <p><strong>{t('weight_kg')}:</strong> {order.weight} kg</p>
                          <p><strong>{t('price')}:</strong> {order.estimatedPrice?.toLocaleString()} {t('sum')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>{t('noOrders')}</p>
                    <Link to="/orders/new" className="btn-primary">
                      {t('createOrder')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipments' && role === 'customer' && (
              <div className="shipments-content">
                <h3>{t('myShipmentsList')}</h3>
                {shipmentsLoading ? (
                  <CardSkeleton count={3} />
                ) : (myShipments || []).length > 0 ? (
                  <div className="shipments-grid">
                    {(myShipments || []).map(shipment => (
                      <div key={shipment.id} className="shipment-card">
                        <div className="shipment-header">
                          <h4>#{shipment.id}</h4>
                          <span className={`status ${getStatusClass(shipment.status)}`}>
                            {translateStatus(t, shipment.status)}
                          </span>
                        </div>
                        <div className="shipment-details">
                          <p><strong>{t('from')}:</strong> {shipment.origin}</p>
                          <p><strong>{t('to')}:</strong> {shipment.destination}</p>
                          <p><strong>{t('weight_kg')}:</strong> {shipment.weight} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>{t('noShipments')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-content">
                <div className="settings-card">
                  <h3>{t('profileSettings')}</h3>
                  <form className="settings-form">
                    <div className="form-group">
                      <label>{t('username')}</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('email')}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('phone')}</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn-save">
                      {t('save')}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Completion Modal */}
      {deliveryModal.isOpen && (
        <DeliveryCompletionModal
          shipment={deliveryModal.shipment}
          onClose={() => setDeliveryModal({ isOpen: false, shipment: null })}
          onDeliveryComplete={refreshData}
        />
      )}
    </div>
  );
};

export default ProfileNew;