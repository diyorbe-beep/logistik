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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useUser();
  const isAuthenticated = !!localStorage.getItem('token');

  const canAccessDashboard = user && (user.role === 'admin' || user.role === 'operator');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const protectedRoutes = ['/dashboard', '/shipments', '/users', '/vehicles', '/carriers', '/orders'];
  const isDashboardArea = protectedRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // In the dashboard area, we use the Sidebar layout instead of this Navbar
  if (isAuthenticated && isDashboardArea && location.pathname !== '/profile') {
    return null;
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {menuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
      <nav className={`navbar-saas ${scrolled || isAuthPage ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <div className="logo-mark">
              <Icons.Truck size={24} color="white" />
            </div>
            <span className="logo-text">Logistik<span className="text-primary-saas">Pro</span></span>
          </Link>

          <div className="navbar-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              {t('home')}
            </Link>
            <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>
              {t('services')}
            </Link>
            <Link to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''}>
              {t('pricing')}
            </Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
              {t('Biz Haqimizda')}
            </Link>
            <Link to="/news" className={location.pathname === '/news' ? 'active' : ''}>
              {'Yangiliklar'}
            </Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
              {t('contact') || 'Aloqa'}
            </Link>
          </div>

          <div className="navbar-actions">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="user-actions">
                <NotificationBell />
                <Link to="/profile" className="profile-btn">
                  <Icons.User size={20} />
                </Link>
                {canAccessDashboard && (
                  <Link to="/dashboard" className="btn-primary-saas">
                    Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn-ghost-saas">{t('login')}</Link>
                <Link to="/register" className="btn-primary-saas">{t('register')}</Link>
              </div>
            )}

            <button className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div className="mobile-links">
            <Link to="/" onClick={closeMenu}>{t('home')}</Link>
            <Link to="/services" onClick={closeMenu}>{t('services')}</Link>
            <Link to="/pricing" onClick={closeMenu}>{t('pricing')}</Link>
            <Link to="/about" onClick={closeMenu}>{t('about')}</Link>
            <Link to="/contact" onClick={closeMenu}>{t('contact')}</Link>
          </div>
          <div className="mobile-auth">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-ghost-saas" onClick={closeMenu}>{t('login')}</Link>
                <Link to="/register" className="btn-primary-saas" onClick={closeMenu}>{t('register')}</Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-primary-saas" onClick={closeMenu}>Dashboard</Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
