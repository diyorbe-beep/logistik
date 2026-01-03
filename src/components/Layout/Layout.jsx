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
        <span className="hamburger-icon">☰</span>
      </button>
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚛</span>
            <h2>Logistics Pro</h2>
          </div>
          <button className="sidebar-close" onClick={closeSidebar}>
            <span>✖️</span>
          </button>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            <span>{user?.username?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="user-details">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-text">{item.text}</span>
                {isActive(item.path) && <span className="active-indicator"></span>}
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="sidebar-footer">
          <div className="language-switcher-sidebar">
            <LanguageSwitcher />
          </div>
          <button onClick={onLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">{t('logout')}</span>
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        <div className="content-wrapper">
          <div className="container">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
