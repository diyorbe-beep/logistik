import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { Icons } from '../Icons/Icons';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import NotificationBell from '../Notifications/NotificationBell';
import './Layout.scss';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: <Icons.Home size={18} />,
      text: t('dashboard'),
      roles: ['admin', 'operator']
    },
    {
      path: '/orders',
      icon: <Icons.FileText size={18} />,
      text: t('orders'),
      roles: ['admin', 'operator']
    },
    {
      path: '/shipments',
      icon: <Icons.Package size={18} />,
      text: t('shipments'),
      roles: ['admin', 'operator']
    },
    {
      path: '/vehicles',
      icon: <Icons.Truck size={18} />,
      text: t('vehicles'),
      roles: ['admin']
    },
    {
      path: '/carriers',
      icon: <Icons.Users size={18} />,
      text: t('carriers'),
      roles: ['admin', 'operator']
    },
    {
      path: '/users',
      icon: <Icons.User size={18} />,
      text: t('users'),
      roles: ['admin']
    }
  ].filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <div className={`dashboard-layout ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Overlay for mobile */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>}

      <aside className={`sidebar-saas ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="logo-mark">
              <Icons.Truck size={20} color="white" />
            </div>
            {!collapsed && <span className="logo-text">LogistikPro</span>}
          </Link>
          <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Icons.ArrowRight size={14} /> : <Icons.ArrowLeft size={14} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {!collapsed && <span className="section-label">Main Menu</span>}
            <ul className="nav-list">
              {menuItems.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    title={collapsed ? item.text : ''}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && <span className="nav-text">{item.text}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="user-info">
                <span className="name">{user?.username}</span>
                <span className="role">{user?.role}</span>
              </div>
            )}
            {!collapsed && (
              <button onClick={onLogout} className="logout-btn" title="Logout">
                <Icons.LogOut size={16} />
              </button>
            )}
          </div>
          {!collapsed && (
            <div className="sidebar-settings">
              <LanguageSwitcher />
            </div>
          )}
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="mobile-toggle" onClick={() => setMobileOpen(true)}>
              <Icons.Menu size={20} />
            </button>
            <h1 className="page-title">
              {menuItems.find(i => isActive(i.path))?.text || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <NotificationBell />
              <Link to="/profile" className="profile-link">
                <Icons.User size={18} />
              </Link>
            </div>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="container">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
