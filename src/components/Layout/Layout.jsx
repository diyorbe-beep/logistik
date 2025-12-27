import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Layout.scss';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const role = user?.role || '';
    const items = [];

    // Dashboard - Only for operator and admin
    if (role === 'admin' || role === 'operator') {
      items.push({
        path: '/dashboard',
        icon: '📊',
        text: t('dashboard'),
      });
    }

    // Shipments - Only for operator and admin
    if (role === 'admin' || role === 'operator') {
      items.push({
        path: '/shipments',
        icon: '📦',
        text: t('shipments'),
      });
    }

    // Users - Only for admin
    if (role === 'admin') {
      items.push({
        path: '/users',
        icon: '👥',
        text: t('users'),
      });
    }

    // Vehicles - Only for admin
    if (role === 'admin') {
      items.push({
        path: '/vehicles',
        icon: '🚚',
        text: t('vehicles'),
      });
    }

    // Carriers - Only for operator and admin
    if (role === 'admin' || role === 'operator') {
      items.push({
        path: '/carriers',
        icon: '🚛',
        text: t('carriers'),
      });
    }

    // Profile - All authenticated users
    items.push({
      path: '/profile',
      icon: '👤',
      text: t('profile'),
    });

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="layout">
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Logistics Pro</h2>
          <button className="sidebar-close" onClick={closeSidebar}>×</button>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={isActive(item.path) ? 'active' : ''}
                onClick={closeSidebar}
              >
                <span className="icon">{item.icon}</span>
                <span className="text">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <div className="language-switcher-sidebar">
            <LanguageSwitcher />
          </div>
          <button onClick={onLogout} className="logout-btn">
            <span className="icon">🚪</span>
            <span className="text">{t('logout')}</span>
          </button>
        </div>
      </nav>
      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
