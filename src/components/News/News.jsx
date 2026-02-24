import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Icons } from '../Icons/Icons';
import PageHeader from '../Common/PageHeader';
import './News.scss';

const DUMMY_NEWS = [
  {
    id: 1,
    title: 'Sun\'iy intellekt orqali logistikani avtomatlashtirish',
    category: 'Texnologiya',
    date: '2025-10-15',
    author: 'Aziz Raximov',
    summary: 'Yangi AI modellarimiz orqali endilikda yuklarni taqsimlash va marshrutlarni optimallashtirish 30% ga tezlashdi.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 2,
    title: 'Yashil Logistika: Uglerod chiqindilarini kamaytirish',
    category: 'Eko-innovatsiya',
    date: '2025-10-12',
    author: 'Malika Karimova',
    summary: 'LogistikPro yangi eko-tashabbus doirasida barcha yetkazib berish jarayonlarida uglerod izini 15% ga kamaytirdi.',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 3,
    title: 'Yangi omborxona boshqaruv tizimi (WMS) ishga tushdi',
    category: 'Platforma',
    date: '2025-10-08',
    author: 'Temur Aliyev',
    summary: 'Mijozlarimiz uchun to\'liq avtomatlashtirilgan va real vaqtda ishlovchi ombor boshqaruv tizimi taqdim etilmoqda.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 4,
    title: 'Xalqaro yuk tashish qoidalari 2026-yil uchun yangilandi',
    category: 'Qonunchilik',
    date: '2025-10-05',
    author: 'Zebo Qodirova',
    summary: 'Yangi yildan kuchga kiradigan xalqaro logistika qoidalari haqida malumot va LogistikPro orqali ularga qanday moslashish tahlili.',
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 5,
    title: 'Havo transporti orqali yetkazib berish narxlari pasaydi',
    category: 'Bozor tahlili',
    date: '2025-10-01',
    author: 'Sanjar Tursunov',
    summary: 'LogistikPro tarmog\'ining kengayishi sababli endi havo transporti narxlari barcha mijozlar uchun tariflar doirasida arzonlashdi.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 6,
    title: 'B2B mijozlar uchun maxsus mobil ilova tez kunda',
    category: 'Anons',
    date: '2025-09-28',
    author: 'Nodirbek Sobirov',
    summary: 'Tez orada barcha biznes mijozlarimiz yuklarni to\'g\'ridan-to\'g\'ri mobil telefon orqali boshqarish imkoniyatiga ega bo\'ladilar.',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800',
  }
];

const News = () => {
  const [news] = useState(DUMMY_NEWS);
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('uz-UZ', options);
  };

  return (
    <div className="news-page-modern">
      <PageHeader
        badge={t('news')}
        title={t('news') || 'Yangiliklar'}
        description={t('newsSubtitle') || 'Logistika va biznes tahlillari sohasidagi so\'nggi yangiliklar'}
        centered
      />
      <div className="container">

        <div className="news-grid">
          {news.map((item, index) => (
            <article key={item.id} className="news-card fade-in" style={{ '--index': index }}>
              <div className="news-image-wrapper">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="news-img" />
                ) : (
                  <div className="news-placeholder">
                    <Icons.FileText size={32} color="#6b7280" />
                  </div>
                )}
                <div className="news-category">
                  {item.category}
                </div>
              </div>
              <div className="news-content">
                <div className="news-meta">
                  <span className="news-date">
                    <Icons.Calendar size={14} className="icon-meta" />
                    {formatDate(item.date)}
                  </span>
                  <span className="news-author">
                    <Icons.User size={14} className="icon-meta" />
                    {item.author}
                  </span>
                </div>
                <h3 className="news-title">{item.title}</h3>
                <p className="news-summary">{item.summary}</p>
                <Link to={`/news/${item.id}`} className="read-more">
                  <span>{t('readMore') || 'Batafsil'}</span>
                  <Icons.ArrowRight size={16} className="arrow" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
