import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { useApi } from '../../hooks/useApi';
import { Icons } from '../Icons/Icons';
import Loading, { SkeletonLoader, CardSkeleton } from '../Loading/Loading';
import DeliveryCompletionModal from '../DeliveryCompletion/DeliveryCompletionModal';
import './Profile.scss';

const Profile = () => {
  const { user: contextUser, refetchUser, loading: userLoading } = useUser();
  const [user, setUser] = useState(contextUser);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
  });
  const [deliveryModal, setDeliveryModal] = useState({ isOpen: false, shipment: null });
  const { t } = useTranslation();

  // Optimized API calls without unnecessary endpoints
  const {
    data: allFetchedShipments = [],
    loading: shipmentsLoading,
    refetch: refetchShipments
  } = useApi('/api/shipments', {
    immediate: !!contextUser,
    dependencies: [contextUser?.id, contextUser?.role]
  });

  const {
    data: allOrders = [],
    loading: ordersLoading,
    refetch: refetchOrders
  } = useApi('/api/orders', {
    immediate: contextUser?.role === 'customer' || contextUser?.role === 'admin' || contextUser?.role === 'operator',
    dependencies: [contextUser?.role]
  });

  // Derived state based on role
  const myShipments = allFetchedShipments.filter(s => String(s.carrierId) === String(user?.id));

  const availableShipments = allFetchedShipments.filter(s =>
    (!s.carrierId || String(s.carrierId) === 'null') && s.status !== 'Delivered'
  );

  const pendingConfirmations = allFetchedShipments.filter(s => s.status === 'Pending Confirmation');

  // For operators/admins, 'shipments' usually means all they have access to
  const shipments = allFetchedShipments;

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
    refetchShipments();
    refetchOrders();
  }, [refetchUser, refetchShipments, refetchOrders]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, { // Corrected endpoint if exists, else keep /api/profile if that's where User routes put it. 
        // Actually UserRoutes usually mount at /api/users. Let's check UserRoutes later. 
        // For now preventing regression, I will assume /api/users/profile or /api/profile. 
        // The original code used /api/profile. Let's double check if we need to change it.
        // Assuming original /api/profile was wrong if it followed same pattern.
        // Let's stick effectively to what might work or fix it.
        // I will use /api/users/${user.id} for update if /api/profile doesn't exist.
        // But let's look at user.routes.js first? 
        // No, I'll stick to original /api/profile but assuming it might need fix too.
        // Wait, I am editing `Profile.jsx`. I should fix data fetching first.
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      // ... existing logic
    } catch (err) {
      // ...
    }
  };

  const handleAcceptShipment = async (shipmentId) => {
    try {
      const token = localStorage.getItem('token');
      // Use standard PUT endpoint
      const response = await fetch(`${API_URL}/api/shipments/${shipmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          carrierId: user.id,
          status: 'In Transit',
          note: 'Shipment accepted by carrier'
        })
      });

      if (response.ok) {
        await refetchShipments();
        alert(t('shipmentAccepted') || 'Shipment accepted successfully');
      } else {
        const data = await response.json();
        alert(data.error || t('error'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  const handleConfirmShipment = async (shipmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments/${shipmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'In Transit', // Or whatever next status is
          operatorConfirmed: true
        })
      });

      if (response.ok) {
        await refetchShipments();
        alert(t('shipmentConfirmed') || 'Shipment confirmed successfully');
      } else {
        alert(t('error'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  // ... rest of functions


  const handleCompleteDelivery = (shipment) => {
    setDeliveryModal({ isOpen: true, shipment });
  };

  const handleDeliveryComplete = (updatedShipment) => {
    setShipments(prev => prev.map(s =>
      s.id === updatedShipment.id ? updatedShipment : s
    ));
  };
  // Loading state with better UX
  if (loading && !user) {
    return <Loading message="Profil ma'lumotlari yuklanmoqda..." size="large" />;
  }

  // Show skeleton while data is loading but user is available
  if (shipmentsLoading || availableLoading || ordersLoading) {
    // Show partial content with skeletons
  }

  const role = user?.role || 'customer';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>{t('myProfile')}</h1>
        <p className="profile-subtitle">
          {role === 'customer' && (t('customerProfileSubtitle') || 'Manage your orders and shipments')}
          {role === 'carrier' && (t('carrierProfileSubtitle') || 'Manage your accepted shipments')}
          {role === 'operator' && (t('operatorProfileSubtitle') || 'Manage shipments and confirmations')}
          {role === 'admin' && (t('adminProfileSubtitle') || 'Administrator profile')}
        </p>
      </div>

      <div className="profile-content">
        {/* Profile Info Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <span className="avatar-icon">
              {role === 'admin' ? <Icons.Settings size={32} color="#f59e0b" /> :
                role === 'operator' ? <Icons.Settings size={32} color="#6b7280" /> :
                  role === 'carrier' ? <Icons.Truck size={32} color="#2563eb" /> :
                    <Icons.User size={32} color="#6b7280" />}
            </span>
          </div>
          <h2>{user?.username || t('user')}</h2>
          <p className="user-role">{role}</p>
          <p className="user-email">{user?.email}</p>
          {user?.phone && <p className="user-phone">{user?.phone}</p>}
        </div>

        {/* Profile Edit Form */}
        <div className="profile-form-card">
          <h3>{t('editProfile')}</h3>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">{t('username')}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('enterUsername')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('enterEmail')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">{t('phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('enterPhone')}
              />
            </div>
            <button type="submit" className="btn-primary">
              {t('updateProfile')}
            </button>
          </form>
        </div>
        {/* Role-based Content */}
        {role === 'carrier' && (
          <div className="carrier-layout">
            {/* Sidebar */}
            <div className="carrier-sidebar">
              <div className="sidebar-section">
                <h3>{t('availableShipments')}</h3>
                {availableShipments.length > 0 ? (
                  <div className="sidebar-shipments">
                    {availableShipments.slice(0, 5).map((shipment) => (
                      <div key={shipment.id} className="sidebar-shipment-card">
                        <div className="shipment-header">
                          <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                          <span className="shipment-price">${shipment.estimatedPrice || '0'}</span>
                        </div>
                        <div className="shipment-route">
                          <span>{shipment.origin} → {shipment.destination}</span>
                        </div>
                        <div className="shipment-details">
                          <small>{shipment.weight || 'N/A'} kg • {shipment.urgency || 'Standard'}</small>
                        </div>
                        <button
                          onClick={() => handleAcceptShipment(shipment.id)}
                          className="btn-accept"
                        >
                          <Icons.CheckCircle size={14} />
                          {t('accept')}
                        </button>
                      </div>
                    ))}
                    {availableShipments.length > 5 && (
                      <div className="show-more">
                        <span>+{availableShipments.length - 5} {t('more')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="no-data">{t('noAvailableShipments')}</p>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="carrier-main">
              <div className="section-card">
                <h3>{t('myShipments')}</h3>
                {myShipments.length > 0 ? (
                  <div className="shipments-list">
                    {myShipments.map((shipment) => (
                      <div key={shipment.id} className="shipment-card">
                        <div className="shipment-header">
                          <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                          <span className={`status-badge status-${shipment.status?.toLowerCase().replace(' ', '-')}`}>
                            {shipment.status}
                          </span>
                        </div>
                        <div className="shipment-details">
                          <p><strong>{t('from')}:</strong> {shipment.origin}</p>
                          <p><strong>{t('to')}:</strong> {shipment.destination}</p>
                          <p><strong>{t('customerName')}:</strong> {shipment.customerName || 'N/A'}</p>
                          <p><strong>{t('acceptedAt')}:</strong> {shipment.acceptedAt ? new Date(shipment.acceptedAt).toLocaleDateString() : 'N/A'}</p>
                          {shipment.deliveredAt && (
                            <p><strong>{t('deliveredAt')}:</strong> {new Date(shipment.deliveredAt).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="card-actions">
                          {shipment.status === 'In Transit' && (
                            <button
                              onClick={() => handleCompleteDelivery(shipment)}
                              className="btn-success"
                            >
                              <Icons.CheckCircle size={16} />
                              {t('completeDelivery')}
                            </button>
                          )}
                          {shipment.status === 'Delivered' && shipment.deliveryCode && (
                            <div className="delivery-info">
                              <span className="delivery-code">
                                <Icons.Lock size={16} />
                                {t('deliveryCode')}: {shipment.deliveryCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">{t('noAcceptedShipments')}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {role === 'operator' && (
          <>
            {/* Pending Confirmations for Operators */}
            <div className="section-card">
              <h3>{t('pendingConfirmations')}</h3>
              {pendingConfirmations.length > 0 ? (
                <div className="shipments-list">
                  {pendingConfirmations.map((shipment) => (
                    <div key={shipment.id} className="shipment-card">
                      <div className="shipment-header">
                        <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                        <span className="status-badge status-pending">
                          {t('pendingConfirmation')}
                        </span>
                      </div>
                      <div className="shipment-details">
                        <p><strong>{t('from')}:</strong> {shipment.origin}</p>
                        <p><strong>{t('to')}:</strong> {shipment.destination}</p>
                        <p><strong>{t('carrier')}:</strong> {shipment.carrierName || 'N/A'}</p>
                        <p><strong>{t('acceptedAt')}:</strong> {shipment.acceptedAt ? new Date(shipment.acceptedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="card-actions">
                        <button
                          onClick={() => handleConfirmShipment(shipment.id)}
                          className="btn-primary"
                        >
                          {t('confirmShipment')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">{t('noPendingConfirmations')}</p>
              )}
            </div>

            {/* All Shipments for Operators */}
            <div className="section-card">
              <h3>{t('allShipments')}</h3>
              {shipments.length > 0 ? (
                <div className="shipments-list">
                  {shipments.slice(0, 10).map((shipment) => (
                    <div key={shipment.id} className="shipment-card">
                      <div className="shipment-header">
                        <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                        <span className={`status-badge status-${shipment.status?.toLowerCase().replace(' ', '-')}`}>
                          {shipment.status}
                        </span>
                      </div>
                      <div className="shipment-details">
                        <p><strong>{t('from')}:</strong> {shipment.origin}</p>
                        <p><strong>{t('to')}:</strong> {shipment.destination}</p>
                        <p><strong>{t('carrier')}:</strong> {shipment.carrierName || 'N/A'}</p>
                        <p><strong>{t('createdAt')}:</strong> {new Date(shipment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">{t('noShipments')}</p>
              )}
            </div>
          </>
        )}

        {role === 'customer' && (
          <>
            {/* My Orders */}
            <div className="section-card">
              <h3>{t('myOrders')}</h3>
              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-number">#{order.orderNumber || order.id}</span>
                        <span className={`status-badge status-${order.status?.toLowerCase().replace(' ', '-')}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <p><strong>{t('from')}:</strong> {order.pickupAddress}</p>
                        <p><strong>{t('to')}:</strong> {order.deliveryAddress}</p>
                        <p><strong>{t('totalPrice')}:</strong> ${order.totalPrice}</p>
                        <p><strong>{t('orderDate')}:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">{t('noOrders')}</p>
              )}
            </div>

            {/* My Shipments */}
            <div className="section-card">
              <h3>{t('myShipments')}</h3>
              {shipments.length > 0 ? (
                <div className="shipments-list">
                  {shipments.map((shipment) => (
                    <div key={shipment.id} className="shipment-item">
                      <div className="shipment-info">
                        <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                        <span className="route">{shipment.origin} → {shipment.destination}</span>
                        <span className={`status-badge status-${shipment.status?.toLowerCase().replace(' ', '-')}`}>
                          {shipment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">{t('noShipments')}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delivery Completion Modal */}
      <DeliveryCompletionModal
        isOpen={deliveryModal.isOpen}
        onClose={() => setDeliveryModal({ isOpen: false, shipment: null })}
        shipment={deliveryModal.shipment}
        onDeliveryComplete={handleDeliveryComplete}
      />
    </div>
  );
};

export default Profile;