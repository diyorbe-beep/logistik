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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  if (isAuthenticated) {
    return null; // Don't show navbar when authenticated (Layout has sidebar)
  }

  return (
    <>
      {menuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <span className="logo-icon">🚚</span>
            <span className="logo-text">Logistics Pro</span>
          </Link>
          <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`hamburger ${menuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <LanguageSwitcher />
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
              {t('home')}
            </Link>
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''} onClick={closeMenu}>
              {t('login')}
            </Link>
            <Link to="/register" className={`btn-primary ${location.pathname === '/register' ? 'active' : ''}`} onClick={closeMenu}>
              {t('register')}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
