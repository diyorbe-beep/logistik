import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { API_URL } from '../../config/api';
import './News.scss';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      // News endpoint is public, no token required
      const response = await fetch(`${API_URL}/api/news`);

      if (response.ok) {
        const data = await response.json();
        // Sort by date, newest first
        const sortedNews = data.sort((a, b) => 
          new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
        );
        setNews(sortedNews);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('uz-UZ', options);
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="news-container">
          <div className="loading">{t('loadingNews')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-container">
        <div className="news-header">
          <h1>{t('news')}</h1>
          <p className="news-subtitle">
            {t('newsSubtitle') || 'Logistika sohasidagi so\'nggi yangiliklar va yangilanishlar'}
          </p>
        </div>

        {news.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>{t('noNews')}</h3>
            <p>{t('noNewsDesc') || 'Hozircha yangiliklar mavjud emas'}</p>
          </div>
        ) : (
          <div className="news-grid">
            {news.map((item, index) => (
              <article key={item.id} className="news-card" style={{ '--index': index }}>
                <div className="news-image-wrapper">
                  <div className="news-image">
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <div className="news-placeholder">
                        <span className="placeholder-icon">📰</span>
                      </div>
                    )}
                  </div>
                  <div className="news-category">
                    {item.category || t('newsCategory') || 'Yangilik'}
                  </div>
                </div>
                <div className="news-content">
                  <div className="news-meta">
                    <span className="news-date">
                      <span className="date-icon">📅</span>
                      {formatDate(item.createdAt || item.date)}
                    </span>
                    {item.author && (
                      <span className="news-author">
                        <span className="author-icon">✍️</span>
                        {item.author}
                      </span>
                    )}
                  </div>
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-summary">{item.summary || item.content?.substring(0, 150) + '...'}</p>
                  <Link to={`/news/${item.id}`} className="read-more">
                    <span>{t('readMore')}</span>
                    <span className="arrow">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
