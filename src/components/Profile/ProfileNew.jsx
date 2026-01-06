import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useApi } from '../../hooks/useApi';
import { Icons } from '../Icons/Icons';
import Loading, { SkeletonLoader, CardSkeleton } from '../Loading/Loading';
import DeliveryCompletionModal from '../DeliveryCompletion/DeliveryCompletionModal';
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

  // Optimized API calls with caching
  const { 
    data: myShipments = [], 
    loading: shipmentsLoading, 
    refetch: refetchShipments 
  } = useApi('/api/my-shipments', {
    immediate: !!contextUser,
    dependencies: [contextUser?.id]
  });

  const { 
    data: availableShipments = [], 
    loading: availableLoading, 
    refetch: refetchAvailable 
  } = useApi('/api/available-shipments', {
    immediate: contextUser?.role === 'carrier',
    dependencies: [contextUser?.role]
  });

  const { 
    data: orders = [], 
    loading: ordersLoading, 
    refetch: refetchOrders 
  } = useApi('/api/orders', {
    immediate: contextUser?.role === 'customer',
    dependencies: [contextUser?.role]
  });

  // Combined loading state
  const loading = userLoading || shipmentsLoading || availableLoading || ordersLoading;

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
    if (contextUser?.role === 'carrier') {
      refetchAvailable();
    } else if (contextUser?.role === 'customer') {
      refetchOrders();
    }
  }, [contextUser?.role, refetchUser, refetchShipments, refetchAvailable, refetchOrders]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Loading state with better UX
  if (loading && !user) {
    return <Loading message="Profil ma'lumotlari yuklanmoqda..." size="large" />;
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
    if (role === 'carrier') {
      return {
        total: myShipments.length,
        completed: myShipments.filter(s => s.status === 'Delivered').length,
        inProgress: myShipments.filter(s => s.status === 'In Transit').length,
        available: availableShipments.length
      };
    } else if (role === 'customer') {
      return {
        total: orders.length,
        completed: orders.filter(o => o.status === 'Completed').length,
        pending: orders.filter(o => o.status === 'Pending').length,
        shipments: myShipments.length
      };
    }
    return {};
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
              <h1>{user?.username || 'Foydalanuvchi'}</h1>
              <p className="user-role">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={refreshData} className="btn-refresh">
              Yangilash
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Chiqish
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
                <span>Jami</span>
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Jami yuk tashishlar</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>Tugal</span>
              </div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>Yakunlangan</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>Jarayon</span>
              </div>
              <div className="stat-info">
                <h3>{stats.inProgress}</h3>
                <p>Jarayonda</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>Yangi</span>
              </div>
              <div className="stat-info">
                <h3>{stats.available}</h3>
                <p>Mavjud yuklar</p>
              </div>
            </div>
          </>
        )}
        
        {role === 'customer' && (
          <>
            <div className="stat-card">
              <div className="stat-icon">
                <span>Buyurtma</span>
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Jami buyurtmalar</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>Tugal</span>
              </div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>Yakunlangan</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>Kutish</span>
              </div>
              <div className="stat-info">
                <h3>{stats.pending}</h3>
                <p>Kutilmoqda</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <span>Yuk</span>
              </div>
              <div className="stat-info">
                <h3>{stats.shipments}</h3>
                <p>Yuk tashishlar</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Umumiy ko'rinish
        </button>
        
        {role === 'carrier' && (
          <>
            <button 
              className={`tab ${activeTab === 'available' ? 'active' : ''}`}
              onClick={() => handleTabChange('available')}
            >
              Mavjud yuklar ({availableShipments.length})
            </button>
            <button 
              className={`tab ${activeTab === 'my-shipments' ? 'active' : ''}`}
              onClick={() => handleTabChange('my-shipments')}
            >
              Mening yuklarim ({myShipments.length})
            </button>
          </>
        )}
        
        {role === 'customer' && (
          <>
            <button 
              className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              Buyurtmalarim ({orders.length})
            </button>
            <button 
              className={`tab ${activeTab === 'shipments' ? 'active' : ''}`}
              onClick={() => handleTabChange('shipments')}
            >
              Yuk tashishlar ({myShipments.length})
            </button>
          </>
        )}
        
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabChange('settings')}
        >
          Sozlamalar
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="welcome-card">
              <h2>Xush kelibsiz, {user?.username}!</h2>
              <p>Bu yerda siz o'zingizning faoliyatingizni kuzatishingiz mumkin.</p>
            </div>
            
            {role === 'carrier' && (
              <div className="quick-actions">
                <h3>Tezkor harakatlar</h3>
                <div className="action-buttons">
                  <button onClick={() => handleTabChange('available')} className="action-btn">
                    Mavjud yuklarni ko'rish
                  </button>
                  <button onClick={() => handleTabChange('my-shipments')} className="action-btn">
                    Mening yuklarim
                  </button>
                </div>
              </div>
            )}
            
            {role === 'customer' && (
              <div className="quick-actions">
                <h3>Tezkor harakatlar</h3>
                <div className="action-buttons">
                  <Link to="/orders/new" className="action-btn">
                    Yangi buyurtma berish
                  </Link>
                  <button onClick={() => handleTabChange('orders')} className="action-btn">
                    Buyurtmalarimni ko'rish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && role === 'carrier' && (
          <div className="shipments-content">
            <h3>Mavjud yuklar</h3>
            {availableLoading ? (
              <CardSkeleton count={3} />
            ) : availableShipments.length > 0 ? (
              <div className="shipments-grid">
                {availableShipments.map(shipment => (
                  <div key={shipment.id} className="shipment-card">
                    <div className="shipment-header">
                      <h4>#{shipment.id}</h4>
                      <span className="status available">Mavjud</span>
                    </div>
                    <div className="shipment-details">
                      <p><strong>Dan:</strong> {shipment.origin}</p>
                      <p><strong>Ga:</strong> {shipment.destination}</p>
                      <p><strong>Og'irligi:</strong> {shipment.weight} kg</p>
                    </div>
                    <button className="btn-accept">
                      Qabul qilish
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Hozircha mavjud yuklar yo'q</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-shipments' && (
          <div className="shipments-content">
            <h3>Mening yuk tashishlarim</h3>
            {shipmentsLoading ? (
              <CardSkeleton count={3} />
            ) : myShipments.length > 0 ? (
              <div className="shipments-grid">
                {myShipments.map(shipment => (
                  <div key={shipment.id} className="shipment-card">
                    <div className="shipment-header">
                      <h4>#{shipment.id}</h4>
                      <span className={`status ${shipment.status.toLowerCase()}`}>
                        {shipment.status}
                      </span>
                    </div>
                    <div className="shipment-details">
                      <p><strong>Dan:</strong> {shipment.origin}</p>
                      <p><strong>Ga:</strong> {shipment.destination}</p>
                      <p><strong>Og'irligi:</strong> {shipment.weight} kg</p>
                    </div>
                    {shipment.status === 'In Transit' && (
                      <button 
                        className="btn-complete"
                        onClick={() => setDeliveryModal({ isOpen: true, shipment })}
                      >
                        Yetkazib berishni yakunlash
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Hozircha yuk tashishlar yo'q</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-content">
            <div className="settings-card">
              <h3>Profil sozlamalari</h3>
              <form className="settings-form">
                <div className="form-group">
                  <label>Foydalanuvchi nomi</label>
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Telefon</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn-save">
                  Saqlash
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Completion Modal */}
      {deliveryModal.isOpen && (
        <DeliveryCompletionModal
          shipment={deliveryModal.shipment}
          onClose={() => setDeliveryModal({ isOpen: false, shipment: null })}
          onComplete={refreshData}
        />
      )}
    </div>
  );
};

export default ProfileNew;