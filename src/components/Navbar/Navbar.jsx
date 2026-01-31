import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { Icons } from '../Icons/Icons';

import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import NotificationBell from '../Notifications/NotificationBell';
import './Navbar.scss';

const Navbar = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useUser();

  // Check if user can access dashboard
  const canAccessDashboard = user && (user.role === 'admin' || user.role === 'operator');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Protected routes where navbar should be hidden (excluding profile)
  const protectedRoutes = ['/dashboard', '/shipments', '/users', '/vehicles'];
  const isProtectedRoute = protectedRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Hide navbar on protected routes when authenticated (but always show on profile)
  if (isAuthenticated && isProtectedRoute && location.pathname !== '/profile') {
    return null; // Don't show navbar when authenticated on protected routes except profile
  }

  return (
    <>
      {menuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <div className="logo-icon-wrapper">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8H17L15 4H9L7 8H4C2.9 8 2 8.9 2 10V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V10C22 8.9 21.1 8 20 8Z" fill="currentColor" opacity="0.9" />
                <path d="M12 17C13.6569 17 15 15.6569 15 14C15 12.3431 13.6569 11 12 11C10.3431 11 9 12.3431 9 14C9 15.6569 10.3431 17 12 17Z" fill="white" />
                <rect x="3" y="10" width="18" height="2" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-line1">Logistics</span>
              <span className="logo-line2">Pro</span>
            </div>
          </Link>
          <div className="navbar-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon"><Icons.Home size={18} /></span>
              <span className="nav-text">{t('home')}</span>
            </Link>
            <Link to="/services" className={location.pathname === '/services' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon"><Icons.Package size={18} /></span>
              <span className="nav-text">{t('services')}</span>
            </Link>
            <Link to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon"><Icons.DollarSign size={18} /></span>
              <span className="nav-text">{t('pricing')}</span>
            </Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon"><Icons.Info size={18} /></span>
              <span className="nav-text">{t('about')}</span>
            </Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon"><Icons.Phone size={18} /></span>
              <span className="nav-text">{t('contact')}</span>
            </Link>
            <Link to="/news" className={location.pathname === '/news' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon"><Icons.FileText size={18} /></span>
              <span className="nav-text">{t('news')}</span>
            </Link>
          </div>
          <div className="navbar-actions">
            <LanguageSwitcher />
            {isAuthenticated && <NotificationBell />}
            {!isAuthenticated && (
              <Link to="/login" className={`btn-primary ${location.pathname === '/login' ? 'active' : ''}`} onClick={closeMenu}>
                {t('login')}
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link to="/orders/new" className="btn-secondary" onClick={closeMenu}>
                  {t('createOrder')}
                </Link>
                {canAccessDashboard && (
                  <Link to="/dashboard" className="btn-primary" onClick={closeMenu}>
                    {t('dashboard')}
                  </Link>
                )}
                <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''} onClick={closeMenu}>
                  {t('profile')}
                </Link>
              </>
            )}
          </div>
          <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <div className="navbar-links-mobile">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon"><Icons.Home size={18} /></span>
                <span className="nav-text">{t('home')}</span>
              </Link>
              <Link to="/services" className={location.pathname === '/services' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon"><Icons.Package size={18} /></span>
                <span className="nav-text">{t('services')}</span>
              </Link>
              <Link to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon"><Icons.DollarSign size={18} /></span>
                <span className="nav-text">{t('pricing')}</span>
              </Link>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon"><Icons.Info size={18} /></span>
                <span className="nav-text">{t('about')}</span>
              </Link>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon"><Icons.Phone size={18} /></span>
                <span className="nav-text">{t('contact')}</span>
              </Link>
              <Link to="/news" className={location.pathname === '/news' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon"><Icons.FileText size={18} /></span>
                <span className="nav-text">{t('news')}</span>
              </Link>
            </div>
            <div className="navbar-actions-mobile">
              <LanguageSwitcher />
              {isAuthenticated && <NotificationBell />}
              {!isAuthenticated && (
                <Link to="/login" className={`btn-primary ${location.pathname === '/login' ? 'active' : ''}`} onClick={closeMenu}>
                  {t('login')}
                </Link>
              )}
              {isAuthenticated && (
                <>
                  <Link to="/orders/new" className="btn-secondary" onClick={closeMenu}>
                    {t('createOrder')}
                  </Link>
                  {canAccessDashboard && (
                    <Link to="/dashboard" className="btn-primary" onClick={closeMenu}>
                      {t('dashboard')}
                    </Link>
                  )}
                  <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''} onClick={closeMenu}>
                    {t('profile')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
