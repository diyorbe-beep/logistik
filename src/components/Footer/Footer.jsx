import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Icons } from '../Icons/Icons';
import './Footer.scss';

const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-saas">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <div className="logo-mark">
                                <Icons.Truck size={24} color="white" />
                            </div>
                            <span className="logo-text">Logistik<span className="text-primary-saas">Pro</span></span>
                        </Link>
                        <p className="footer-description">
                            Professional Transport & Logistics Management System.
                            Efficiency, transparency, and reliability at your fingertips.
                        </p>
                        <div className="social-links">
                            <a href="#" aria-label="Telegram"><Icons.Send size={20} /></a>
                            <a href="#" aria-label="Instagram"><Icons.Instagram size={20} /></a>
                            <a href="#" aria-label="Facebook"><Icons.Facebook size={20} /></a>
                            <a href="#" aria-label="LinkedIn"><Icons.Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-nav">
                        <div className="footer-col">
                            <h4>{t('platform') || 'Platforma'}</h4>
                            <ul>
                                <li><Link to="/">{t('home')}</Link></li>
                                <li><Link to="/services">{t('services')}</Link></li>
                                <li><Link to="/pricing">{t('pricing')}</Link></li>
                                <li><Link to="/about">{t('about')}</Link></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>{t('resources') || 'Resurslar'}</h4>
                            <ul>
                                <li><Link to="/news">{t('news') || 'Yangiliklar'}</Link></li>
                                <li><Link to="/faq">{t('faq') || 'Yo\'riqnoma'}</Link></li>
                                <li><Link to="/support">{t('support') || 'Yordam'}</Link></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>{t('contact') || 'Bog\'lanish'}</h4>
                            <ul className="contact-info">
                                <li>
                                    <Icons.MapPin size={16} />
                                    <span>Amir Temur shoh ko'chasi, Toshkent</span>
                                </li>
                                <li>
                                    <Icons.Phone size={16} />
                                    <span>+998 (90) 123-45-67</span>
                                </li>
                                <li>
                                    <Icons.Mail size={16} />
                                    <span>info@logistikpro.uz</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} LogistikPro. {t('allRightsReserved') || 'Barcha huquqlar himoyalangan.'}</p>
                    <div className="footer-legal">
                        <Link to="/privacy">{t('privacyPolicy') || 'Maxfiylik siyosati'}</Link>
                        <Link to="/terms">{t('termsOfService') || 'Foydalanish shartlari'}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
