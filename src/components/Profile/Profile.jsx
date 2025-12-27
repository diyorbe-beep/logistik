import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { API_URL } from '../../config/api';
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
              {role === 'admin' ? '👑' : role === 'operator' ? '⚙️' : role === 'carrier' ? '🚛' : '👤'}
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
