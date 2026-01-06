import React from 'react';
import './Loading.scss';

const Loading = ({ 
  message = 'Yuklanmoqda...', 
  size = 'medium',
  overlay = false,
  showProgress = false,
  progress = 0 
}) => {
  const sizeClass = `loading--${size}`;
  const containerClass = overlay ? 'loading-overlay' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className={`loading ${sizeClass}`}>
        <div className="loading__spinner">
          <div className="loading__circle"></div>
          <div className="loading__circle"></div>
          <div className="loading__circle"></div>
        </div>
        
        <div className="loading__content">
          <p className="loading__message">{message}</p>
          
          {showProgress && (
            <div className="loading__progress">
              <div className="loading__progress-bar">
                <div 
                  className="loading__progress-fill"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                ></div>
              </div>
              <span className="loading__progress-text">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for better UX
export const SkeletonLoader = ({ lines = 3, height = '20px', className = '' }) => (
  <div className={`skeleton-loader ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div 
        key={i}
        className="skeleton-line"
        style={{ 
          height,
          width: i === lines - 1 ? '70%' : '100%'
        }}
      ></div>
    ))}
  </div>
);

// Card skeleton for lists
export const CardSkeleton = ({ count = 3 }) => (
  <div className="card-skeleton-container">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="card-skeleton">
        <div className="card-skeleton__header"></div>
        <div className="card-skeleton__body">
          <SkeletonLoader lines={2} />
        </div>
      </div>
    ))}
  </div>
);

export default Loading;