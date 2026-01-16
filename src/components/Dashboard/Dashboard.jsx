import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/client';
import { testApiConnection } from '../../config/api';
import { Icons } from '../Icons/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Loading from '../Loading/Loading';
import './Dashboard.scss';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    received: 0,
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

        // First test API connection
        console.log('Testing API connection...');
        const connectionTest = await testApiConnection();
        if (!connectionTest.success) {
          throw new Error(`API connection failed: ${connectionTest.error}`);
        }
        console.log('API connection successful');

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

  /* API Connection test removed as we trust the client */

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      // Note: Backend endpoint for stats might need to be /shipments/stats or similar
      // For now, let's assume we can calculate from shipments list if stats endpoint doesn't exist yet
      // Or if we implemented it. We didn't explicitly implement /api/stats in backend.
      // So let's fetch shipments and calculate manually for now to be safe.

      const response = await api.get('/shipments');
      const allShipments = response.data;

      const statsData = {
        total: allShipments.length,
        inTransit: allShipments.filter(s => s.status === 'In Transit').length,
        delivered: allShipments.filter(s => s.status === 'Delivered').length,
        received: allShipments.filter(s => s.status === 'Received').length,
        monthly: [] // Would need more logic
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };

  const fetchRecentShipments = async () => {
    try {
      console.log('Fetching shipments...');
      const response = await api.get('/shipments');
      setShipments(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching shipments:', error);
      throw error;
    }
  };

  // Prepare chart data
  const statusChartData = [
    { name: t('received'), value: stats.received, color: '#06b6d4' },
    { name: t('inTransit'), value: stats.inTransit, color: '#f59e0b' },
    { name: t('delivered'), value: stats.delivered, color: '#10b981' },
  ];

  // Convert monthly data from backend to chart format
  const monthlyData = stats.monthly?.map((item) => {
    const [year, month] = item.month.split('-');
    const monthNames = [t('jan'), t('feb'), t('mar'), t('apr'), t('may'), t('jun'), t('jul'), t('aug'), t('sep'), t('oct'), t('nov'), t('dec')];
    return {
      month: monthNames[parseInt(month) - 1] || month,
      shipments: item.count,
    };
  }) || [];

  if (loading) {
    return <Loading message="Dashboard yuklanmoqda..." size="large" />;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <h2>Dashboard yuklanmadi</h2>
          <p>Xatolik: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Qayta yuklash
          </button>
        </div>
      </div>
    );
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
          <div className="stat-icon total"><Icons.Package size={32} color="#2563eb" /></div>
          <div className="stat-content">
            <h3>{t('totalShipments')}</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon received"><Icons.CheckCircle size={32} color="#06b6d4" /></div>
          <div className="stat-content">
            <h3>{t('received')}</h3>
            <p className="stat-value">{stats.received}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon in-transit"><Icons.Truck size={32} color="#f59e0b" /></div>
          <div className="stat-content">
            <h3>{t('inTransit')}</h3>
            <p className="stat-value">{stats.inTransit}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon delivered"><Icons.CheckCircle size={32} color="#10b981" /></div>
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
