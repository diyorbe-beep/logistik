import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { API_URL } from '../../config/api';
import { Icons } from '../Icons/Icons';
import DeliveryCompletionModal from '../DeliveryCompletion/DeliveryCompletionModal';
import './Profile.scss';

const Profile = () => {
  const { user: contextUser, refetchUser } = useUser();
  const [user, setUser] = useState(contextUser);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
  });
  const [shipments, setShipments] = useState([]);
  const [availableShipments, setAvailableShipments] = useState([]);
  const [pendingConfirmations, setPendingConfirmations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryModal, setDeliveryModal] = useState({ isOpen: false, shipment: null });
  const { t } = useTranslation();

  useEffect(() => {
    fetchUserProfile();
    if (contextUser?.role === 'carrier') {
      fetchAvailableShipments();
      fetchMyShipments();
    } else if (contextUser?.role === 'operator') {
      fetchPendingConfirmations();
      fetchAllShipments();
    } else if (contextUser?.role === 'customer') {
      fetchMyShipments();
      fetchMyOrders();
    }
  }, [contextUser]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
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
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchMyShipments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter shipments based on user role
        if (user?.role === 'carrier') {
          setShipments(data.filter(s => s.carrierId === user.id && s.status !== 'Received'));
        } else if (user?.role === 'customer') {
          setShipments(data.filter(s => s.customerId === user.id));
        }
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    }
  };

  const fetchAvailableShipments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Show shipments with status "Received" that haven't been accepted
        setAvailableShipments(data.filter(s => s.status === 'Received' && !s.carrierId));
      }
    } catch (err) {
      console.error('Error fetching available shipments:', err);
    }
  };

  const handleAcceptShipment = async (shipmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments/${shipmentId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert(t('shipmentAccepted'));
        fetchAvailableShipments();
        fetchMyShipments();
      } else {
        alert(t('error'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  const handleCompleteDelivery = (shipment) => {
    setDeliveryModal({ isOpen: true, shipment });
  };

  const handleDeliveryComplete = (updatedShipment) => {
    // Update shipments list
    setShipments(prev => prev.map(s => 
      s.id === updatedShipment.shipment.id ? updatedShipment.shipment : s
    ));
    
    // Show success message
    alert(t('deliveryCompletedSuccessfully'));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Received':
        return 'status-received';
      case 'In Transit':
        return 'status-in-transit';
      case 'Delivered':
        return 'status-delivered';
      case 'Converted':
        return 'status-converted';
      default:
        return '';
    }
  };

  const getStatusTranslation = (status) => {
    switch (status) {
      case 'Pending':
        return t('pending');
      case 'Received':
        return t('received');
      case 'In Transit':
        return t('inTransit');
      case 'Delivered':
        return t('delivered');
      case 'Converted':
        return t('converted');
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="loading">{t('loadingProfile')}</div>;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>{t('profile')}</h1>
        <div className="user-info">
          <div className="user-avatar">
            <span>{user?.username?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="user-details">
            <h2>{user?.username}</h2>
            <p className="user-role">{user?.role}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Customer Section */}
      {user?.role === 'customer' && (
        <div className="customer-section">
          <div className="section-header">
            <h3>{t('myOrders')}</h3>
            <Link to="/orders/new" className="btn-primary">
              {t('createOrder')}
            </Link>
          </div>
          
          {orders.length > 0 ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="card-header">
                    <span className="order-number">#{order.trackingNumber}</span>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusTranslation(order.status)}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>{t('route')}:</strong> {order.origin} → {order.destination}</p>
                    <p><strong>{t('weight')}:</strong> {order.weight} kg</p>
                    <p><strong>{t('estimatedPrice')}:</strong> {order.estimatedPrice?.toLocaleString()} {t('currency')}</p>
                    <p><strong>{t('created')}:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('noOrders')}</p>
              <Link to="/orders/new" className="btn-primary">
                {t('createFirstOrder')}
              </Link>
            </div>
          )}

          <div className="section-header">
            <h3>{t('myShipments')}</h3>
          </div>
          
          {shipments.length > 0 ? (
            <div className="shipments-list">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="shipment-card">
                  <div className="card-header">
                    <span className="tracking-number">#{shipment.trackingNumber}</span>
                    <span className={`status-badge ${getStatusClass(shipment.status)}`}>
                      {getStatusTranslation(shipment.status)}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>{t('route')}:</strong> {shipment.origin} → {shipment.destination}</p>
                    <p><strong>{t('weight')}:</strong> {shipment.weight} kg</p>
                    {shipment.deliveredAt && (
                      <p><strong>{t('deliveredAt')}:</strong> {new Date(shipment.deliveredAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{t('noShipments')}</p>
          )}
        </div>
      )}

      {/* Carrier Section */}
      {user?.role === 'carrier' && (
        <div className="carrier-section">
          <div className="section-header">
            <h3>{t('availableShipments')}</h3>
          </div>
          
          {availableShipments.length > 0 ? (
            <div className="available-shipments">
              {availableShipments.map((shipment) => (
                <div key={shipment.id} className="shipment-card available">
                  <div className="card-header">
                    <span className="tracking-number">#{shipment.trackingNumber}</span>
                    <span className="status-badge status-received">{t('available')}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>{t('route')}:</strong> {shipment.origin} → {shipment.destination}</p>
                    <p><strong>{t('weight')}:</strong> {shipment.weight} kg</p>
                    <p><strong>{t('customer')}:</strong> {shipment.customerName}</p>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => handleAcceptShipment(shipment.id)}
                      className="btn-primary"
                    >
                      {t('acceptShipment')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{t('noAvailableShipments')}</p>
          )}

          <div className="section-header">
            <h3>{t('myDeliveries')}</h3>
          </div>
          
          {shipments.length > 0 ? (
            <div className="my-deliveries">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="shipment-card">
                  <div className="card-header">
                    <span className="tracking-number">#{shipment.trackingNumber}</span>
                    <span className={`status-badge ${getStatusClass(shipment.status)}`}>
                      {getStatusTranslation(shipment.status)}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>{t('route')}:</strong> {shipment.origin} → {shipment.destination}</p>
                    <p><strong>{t('weight')}:</strong> {shipment.weight} kg</p>
                    <p><strong>{t('customer')}:</strong> {shipment.customerName}</p>
                    <p><strong>{t('recipient')}:</strong> {shipment.recipientName}</p>
                    {shipment.specialInstructions && (
                      <p><strong>{t('specialInstructions')}:</strong> {shipment.specialInstructions}</p>
                    )}
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
            <p>{t('noActiveDeliveries')}</p>
          )}
        </div>
      )}

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

  const fetchPendingConfirmations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Show shipments accepted by carrier but not confirmed by operator
        setPendingConfirmations(data.filter(s => s.carrierId && s.status === 'Received' && !s.operatorConfirmed));
      }
    } catch (err) {
      console.error('Error fetching pending confirmations:', err);
    }
  };

  const fetchAllShipments = async () => {
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
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        await refetchUser();
        alert(t('profileUpdated'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  const handleAcceptShipment = async (shipmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments/${shipmentId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchAvailableShipments();
        await fetchMyShipments();
        alert(t('shipmentAccepted') || 'Shipment accepted successfully');
      } else {
        alert(t('error'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  const handleConfirmShipment = async (shipmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments/${shipmentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchPendingConfirmations();
        await fetchAllShipments();
        alert(t('shipmentConfirmed') || 'Shipment confirmed successfully');
      } else {
        alert(t('error'));
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  if (loading) {
    return <div className="loading">{t('loadingProfile')}</div>;
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

        {/* Edit Profile Form */}
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
                disabled
                className="disabled-input"
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
                required
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
                placeholder="+998 90 123 45 67"
              />
            </div>
            <button type="submit" className="btn-primary">
              {t('saveChanges')}
            </button>
          </form>
        </div>

        {/* Carrier: Available Shipments */}
        {role === 'carrier' && (
          <div className="profile-section">
            <h3>{t('availableShipments') || 'Available Shipments'}</h3>
            {availableShipments.length === 0 ? (
              <p className="no-data">{t('noAvailableShipments') || 'No available shipments'}</p>
            ) : (
              <div className="shipments-list">
                {availableShipments.map((shipment) => (
                  <div key={shipment.id} className="shipment-item">
                    <div className="shipment-info">
                      <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                      <span className="route">{shipment.origin} → {shipment.destination}</span>
                      <span className="weight">{shipment.weight || 'N/A'}</span>
                    </div>
                    <button
                      onClick={() => handleAcceptShipment(shipment.id)}
                      className="btn-primary"
                    >
                      {t('accept') || 'Accept'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Carrier: My Shipments */}
        {role === 'carrier' && (
          <div className="profile-section">
            <h3>{t('myShipments') || 'My Shipments'}</h3>
            {shipments.length === 0 ? (
              <p className="no-data">{t('noShipments')}</p>
            ) : (
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
            )}
          </div>
        )}

        {/* Operator: Pending Confirmations */}
        {role === 'operator' && (
          <div className="profile-section">
            <h3>{t('pendingConfirmations') || 'Pending Confirmations'}</h3>
            {pendingConfirmations.length === 0 ? (
              <p className="no-data">{t('noPendingConfirmations') || 'No pending confirmations'}</p>
            ) : (
              <div className="shipments-list">
                {pendingConfirmations.map((shipment) => (
                  <div key={shipment.id} className="shipment-item">
                    <div className="shipment-info">
                      <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                      <span className="route">{shipment.origin} → {shipment.destination}</span>
                      <span className="carrier-info">
                        {t('acceptedBy') || 'Accepted by'}: {shipment.carrierName || 'Carrier'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleConfirmShipment(shipment.id)}
                      className="btn-primary"
                    >
                      {t('confirm') || 'Confirm'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customer: My Orders */}
        {role === 'customer' && (
          <div className="profile-section">
            <h3>{t('myOrders') || 'My Orders'}</h3>
            {shipments.length === 0 ? (
              <p className="no-data">{t('noShipments')}</p>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
