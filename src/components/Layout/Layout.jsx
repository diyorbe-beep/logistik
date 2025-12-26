import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Layout.scss';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const { t } = useTranslation();
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
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={closeSidebar}>
              <span className="icon">📊</span>
              <span className="text">{t('dashboard')}</span>
            </Link>
          </li>
          <li>
            <Link to="/shipments" className={isActive('/shipments') ? 'active' : ''} onClick={closeSidebar}>
              <span className="icon">📦</span>
              <span className="text">{t('shipments')}</span>
            </Link>
          </li>
          <li>
            <Link to="/users" className={isActive('/users') ? 'active' : ''} onClick={closeSidebar}>
              <span className="icon">👥</span>
              <span className="text">{t('users')}</span>
            </Link>
          </li>
          <li>
            <Link to="/vehicles" className={isActive('/vehicles') ? 'active' : ''} onClick={closeSidebar}>
              <span className="icon">🚚</span>
              <span className="text">{t('vehicles')}</span>
            </Link>
          </li>
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
        {children}
      </main>
    </div>
  );
};

export default Layout;
