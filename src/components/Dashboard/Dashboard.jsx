import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.scss';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    received: 0,
  });
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchStats();
    fetchRecentShipments();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentShipments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/shipments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShipments(data.slice(0, 5)); // Get last 5 shipments
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  // Prepare chart data
  const statusChartData = [
    { name: t('received'), value: stats.received, color: '#06b6d4' },
    { name: t('inTransit'), value: stats.inTransit, color: '#f59e0b' },
    { name: t('delivered'), value: stats.delivered, color: '#10b981' },
  ];

  const monthlyData = [
    { month: t('jan'), shipments: 12 },
    { month: t('feb'), shipments: 19 },
    { month: t('mar'), shipments: 15 },
    { month: t('apr'), shipments: 22 },
    { month: t('may'), shipments: 18 },
    { month: t('jun'), shipments: 25 },
  ];

  if (loading) {
    return <div className="dashboard-loading">{t('loadingDashboard')}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t('dashboard')}</h1>
        <Link to="/shipments/new" className="btn-primary">
          {t('newShipment')}
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📦</div>
          <div className="stat-content">
            <h3>{t('totalShipments')}</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon received">📥</div>
          <div className="stat-content">
            <h3>{t('received')}</h3>
            <p className="stat-value">{stats.received}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon in-transit">🚚</div>
          <div className="stat-content">
            <h3>{t('inTransit')}</h3>
            <p className="stat-value">{stats.inTransit}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon delivered">✅</div>
          <div className="stat-content">
            <h3>{t('delivered')}</h3>
            <p className="stat-value">{stats.delivered}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>{t('statusDistribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t('monthlyShipments')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="shipments" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="recent-shipments">
        <div className="section-header">
          <h2>{t('recentShipments')}</h2>
          <Link to="/shipments" className="btn-secondary">
            {t('viewAll')}
          </Link>
        </div>
        {shipments.length > 0 ? (
          <div className="shipments-list">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="shipment-item">
                <div className="shipment-info">
                  <span className="tracking-number">#{shipment.trackingNumber || shipment.id}</span>
                  <span className="route">{shipment.origin} → {shipment.destination}</span>
                </div>
                <span className={`status-badge status-${shipment.status.toLowerCase().replace(' ', '-')}`}>
                  {shipment.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">{t('noRecentShipments')}</p>
        )}
      </div>

      <div className="dashboard-actions">
        <Link to="/shipments" className="action-card">
          <h3>{t('manageShipments')}</h3>
          <p>{t('manageShipmentsDesc')}</p>
        </Link>
        <Link to="/users" className="action-card">
          <h3>{t('manageUsers')}</h3>
          <p>{t('manageUsersDesc')}</p>
        </Link>
        <Link to="/vehicles" className="action-card">
          <h3>{t('manageVehicles')}</h3>
          <p>{t('manageVehiclesDesc')}</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
