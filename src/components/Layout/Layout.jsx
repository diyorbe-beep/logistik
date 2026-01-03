import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { Icons } from '../Icons/Icons';
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
        icon: <Icons.BarChart size={20} />,
        text: t('dashboard'),
      });
    }

    // Shipments - Only for operator and admin
    if (role === 'admin' || role === 'operator') {
      items.push({
        path: '/shipments',
        icon: <Icons.Package size={20} />,
        text: t('shipments'),
      });
    }

    // Users - Only for admin
    if (role === 'admin') {
      items.push({
        path: '/users',
        icon: <Icons.Users size={20} />,
        text: t('users'),
      });
    }

    // Vehicles - Only for admin
    if (role === 'admin') {
      items.push({
        path: '/vehicles',
        icon: <Icons.Truck size={20} />,
        text: t('vehicles'),
      });
    }

    // Carriers - Only for operator and admin
    if (role === 'admin' || role === 'operator') {
      items.push({
        path: '/carriers',
        icon: <Icons.Users size={20} />,
        text: t('carriers'),
      });
    }

    // Profile - All authenticated users
    items.push({
      path: '/profile',
      icon: <Icons.User size={20} />,
      text: t('profile'),
    });

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="layout">
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        <Icons.Menu size={24} />
      </button>
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Icons.Truck size={28} color="#2563eb" />
            <h2>Logistics Pro</h2>
          </div>
          <button className="sidebar-close" onClick={closeSidebar}>
            <Icons.Close size={20} />
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
            <Icons.LogOut size={18} />
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
