import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageContext'
import { UserProvider } from './contexts/UserContext'
import PerformanceMonitor from './components/PerformanceMonitor/PerformanceMonitor'

// Register Service Worker for caching
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance optimization - preload critical resources
const preloadCriticalResources = () => {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  fontLink.as = 'style';
  document.head.appendChild(fontLink);

  // Preconnect to API
  const apiLink = document.createElement('link');
  apiLink.rel = 'preconnect';
  apiLink.href = 'https://logistik-pro.onrender.com';
  document.head.appendChild(apiLink);
};

// Initialize performance optimizations
preloadCriticalResources();
// V2.1 Build Force


// Optimize rendering
const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <LanguageProvider>
      <UserProvider>
        <App />
        <PerformanceMonitor />
      </UserProvider>
    </LanguageProvider>
  </StrictMode>
);
