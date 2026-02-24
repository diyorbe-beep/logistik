import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/client';
import { testApiConnection } from '../../config/api';
import { Icons } from '../Icons/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Loading from '../Loading/Loading';
import { translateStatus } from '../../utils/statusUtils';
import './Dashboard.scss';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    received: 0,
    pending: 0,
    monthly: [],
  });
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Test API connection as per original logic
        const connectionTest = await testApiConnection();
        if (!connectionTest.success) {
          throw new Error(`API connection failed: ${connectionTest.error}`);
        }

        await Promise.all([fetchStats(), fetchRecentShipments()]);
      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/shipments');
      const allShipments = response.data;

      const statsData = {
        total: allShipments.length,
        inTransit: allShipments.filter(s => s.status === 'In Transit').length,
        delivered: allShipments.filter(s => s.status === 'Delivered').length,
        received: allShipments.filter(s => s.status === 'Received').length,
        pending: allShipments.filter(s => s.status === 'Pending').length,
        monthly: (() => {
          const statsMap = {};
          allShipments.forEach(s => {
            if (s.createdAt) {
              const date = new Date(s.createdAt);
              const key = `${date.toLocaleString('default', { month: 'short' })}`;
              statsMap[key] = (statsMap[key] || 0) + 1;
            }
          });
          return Object.entries(statsMap).map(([name, count]) => ({ name, shipments: count }));
        })()
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };

  const fetchRecentShipments = async () => {
    try {
      const response = await api.get('/shipments');
      setShipments(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching shipments:', error);
      throw error;
    }
  };

  if (loading) return (
    <div className="dashboard-loading-saas">
      <Loading message={t('loadingDashboard')} size="large" />
    </div>
  );

  if (error) return (
    <div className="dashboard-error">
      <div className="error-content">
        <Icons.AlertCircle size={48} color="#ef4444" />
        <h2>{t('error')}</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary-saas">
          {t('retry')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-saas">
      <div className="dashboard-welcome">
        <h2>{t('welcomeBack') || 'Welcome back'}, ✨</h2>
        <p>{t('dashboardSubtitle') || 'Here is what is happening with your shipments today.'}</p>
      </div>

      <div className="stats-grid-saas">
        <div className="stat-card-saas primary">
          <div className="stat-icon"><Icons.Package size={24} /></div>
          <div className="stat-info">
            <span className="label">{t('totalShipments')}</span>
            <span className="value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card-saas info">
          <div className="stat-icon"><Icons.Plus size={24} /></div>
          <div className="stat-info">
            <span className="label">{t('received')}</span>
            <span className="value">{stats.received}</span>
          </div>
        </div>
        <div className="stat-card-saas warning">
          <div className="stat-icon"><Icons.Truck size={24} /></div>
          <div className="stat-info">
            <span className="label">{t('inTransit')}</span>
            <span className="value">{stats.inTransit}</span>
          </div>
        </div>
        <div className="stat-card-saas success">
          <div className="stat-icon"><Icons.CheckCircle size={24} /></div>
          <div className="stat-info">
            <span className="label">{t('delivered')}</span>
            <span className="value">{stats.delivered}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-container-saas">
          <div className="chart-header">
            <h3>{t('monthlyShipments')}</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthly.length > 0 ? stats.monthly : [{ name: 'None', shipments: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="shipments" fill="rgba(99, 102, 241, 0.8)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="activity-feed-saas">
          <div className="section-header-saas">
            <h3>{t('recentShipments')}</h3>
            <Link to="/shipments" className="view-all">{t('viewAll')}</Link>
          </div>
          <div className="feed-list">
            {shipments.length > 0 ? (
              shipments.map((shipment, index) => (
                <div key={shipment.id} className="feed-item" style={{ "--index": index }}>
                  <div className={`status-dot ${shipment.status.toLowerCase().replace(' ', '-')}`}></div>
                  <div className="feed-content">
                    <div className="feed-top">
                      <span className="tracking">#{shipment.trackingNumber || shipment.id}</span>
                      <span className="time">{translateStatus(t, shipment.status)}</span>
                    </div>
                    <div className="feed-bottom">
                      <span>{shipment.origin} → {shipment.destination}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">{t('noRecentShipments')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions-saas">
        <Link to="/shipments/new" className="action-btn">
          <div className="icon-box"><Icons.Plus size={20} /></div>
          <span>{t('newShipment')}</span>
        </Link>
        <Link to="/users" className="action-btn">
          <div className="icon-box"><Icons.Users size={20} /></div>
          <span>{t('manageUsers')}</span>
        </Link>
        <Link to="/vehicles" className="action-btn">
          <div className="icon-box"><Icons.Truck size={20} /></div>
          <span>{t('manageVehicles')}</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
