import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Navbar.scss';

const Navbar = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

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

  // Protected routes where navbar should be hidden
  const protectedRoutes = ['/dashboard', '/shipments', '/users', '/vehicles'];
  const isProtectedRoute = protectedRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Hide navbar only on protected routes when authenticated
  if (isAuthenticated && isProtectedRoute) {
    return null; // Don't show navbar when authenticated on protected routes (Layout has sidebar)
  }

  return (
    <>
      {menuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <div className="logo-icon-wrapper">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8H17L15 4H9L7 8H4C2.9 8 2 8.9 2 10V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V10C22 8.9 21.1 8 20 8Z" fill="currentColor" opacity="0.9"/>
                <path d="M12 17C13.6569 17 15 15.6569 15 14C15 12.3431 13.6569 11 12 11C10.3431 11 9 12.3431 9 14C9 15.6569 10.3431 17 12 17Z" fill="white"/>
                <rect x="3" y="10" width="18" height="2" fill="currentColor" opacity="0.3"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-line1">Logistics</span>
              <span className="logo-line2">Pro</span>
            </div>
          </Link>
          <div className="navbar-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon">🏠</span>
              <span className="nav-text">{t('home')}</span>
            </Link>
            <Link to="/services" className={location.pathname === '/services' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon">📦</span>
              <span className="nav-text">{t('services')}</span>
            </Link>
            <Link to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon">💰</span>
              <span className="nav-text">{t('pricing')}</span>
            </Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon">ℹ️</span>
              <span className="nav-text">{t('about')}</span>
            </Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon">📞</span>
              <span className="nav-text">{t('contact')}</span>
            </Link>
            <Link to="/news" className={location.pathname === '/news' ? 'active' : ''} onClick={closeMenu}>
              <span className="nav-icon">📰</span>
              <span className="nav-text">{t('news')}</span>
            </Link>
          </div>
          <div className="navbar-actions">
            <LanguageSwitcher />
            {!isAuthenticated && (
              <Link to="/login" className={`btn-primary ${location.pathname === '/login' ? 'active' : ''}`} onClick={closeMenu}>
                {t('login')}
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="btn-primary" onClick={closeMenu}>
                  {t('dashboard')}
                </Link>
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
                <span className="nav-icon">🏠</span>
                <span className="nav-text">{t('home')}</span>
              </Link>
              <Link to="/services" className={location.pathname === '/services' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon">📦</span>
                <span className="nav-text">{t('services')}</span>
              </Link>
              <Link to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon">💰</span>
                <span className="nav-text">{t('pricing')}</span>
              </Link>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon">ℹ️</span>
                <span className="nav-text">{t('about')}</span>
              </Link>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon">📞</span>
                <span className="nav-text">{t('contact')}</span>
              </Link>
              <Link to="/news" className={location.pathname === '/news' ? 'active' : ''} onClick={closeMenu}>
                <span className="nav-icon">📰</span>
                <span className="nav-text">{t('news')}</span>
              </Link>
            </div>
            <div className="navbar-actions-mobile">
              <LanguageSwitcher />
              {!isAuthenticated && (
                <Link to="/login" className={`btn-primary ${location.pathname === '/login' ? 'active' : ''}`} onClick={closeMenu}>
                  {t('login')}
                </Link>
              )}
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="btn-primary" onClick={closeMenu}>
                    {t('dashboard')}
                  </Link>
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
