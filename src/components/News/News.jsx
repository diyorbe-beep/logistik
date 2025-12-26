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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/news`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('loadingNews')}</div>;
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <h1>{t('news')}</h1>
      </div>

      {news.length === 0 ? (
        <div className="empty-state">
          <p>{t('noNews')}</p>
        </div>
      ) : (
        <div className="news-grid">
          {news.map((item) => (
            <article key={item.id} className="news-card">
              <div className="news-image">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="news-placeholder">📰</div>
                )}
              </div>
              <div className="news-content">
                <span className="news-date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <Link to={`/news/${item.id}`} className="read-more">
                  {t('readMore')} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;

