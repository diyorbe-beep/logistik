import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { NotificationService } from '../../services/notificationService';
import './NotificationBell.scss';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const fetchNotifications = async () => {
        try {
            const data = await NotificationService.getAll();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    // Poll for notifications every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, link) => {
        try {
            await NotificationService.markAsRead(id);
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            if (link) {
                setIsOpen(false);
                navigate(link);
            }
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    return (
        <div className="notification-bell" ref={dropdownRef}>
            <button
                className={`bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Bildirishnomalar</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={handleMarkAllRead}>
                                Barchasini o'qilgan qilish
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-state">Yangi xabarlar yo'q</div>
                        ) : (
                            notifications.map(note => (
                                <div
                                    key={note.id}
                                    className={`notification-item ${!note.read ? 'unread' : ''}`}
                                    onClick={() => handleMarkAsRead(note.id, note.link)}
                                >
                                    <div className={`notification-icon ${note.type}`}>
                                        {note.type === 'info' && 'ℹ️'}
                                        {note.type === 'success' && '✅'}
                                        {note.type === 'warning' && '⚠️'}
                                        {note.type === 'error' && '❌'}
                                    </div>
                                    <div className="notification-content">
                                        <h4>{note.title}</h4>
                                        <p>{note.message}</p>
                                        <span className="time">{new Date(note.createdAt).toLocaleString()}</span>
                                    </div>
                                    {!note.read && <span className="unread-dot"></span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
