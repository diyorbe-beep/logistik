import { useEffect, useState } from 'react';
import { API_URL } from '../../config/api';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    apiResponseTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    connectionStatus: 'checking'
  });

  useEffect(() => {
    // Monitor API response time
    const measureApiResponse = async () => {
      const start = performance.now();
      try {
        await fetch(`${API_URL}/api/health`, { method: 'HEAD' });
        const end = performance.now();
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: Math.round(end - start),
          connectionStatus: 'connected'
        }));
      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          connectionStatus: 'disconnected'
        }));
      }
    };

    // Monitor memory usage
    const measureMemory = () => {
      if ('memory' in performance) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    // Initial measurements
    measureApiResponse();
    measureMemory();

    // Set up intervals
    const apiInterval = setInterval(measureApiResponse, 30000); // Every 30 seconds
    const memoryInterval = setInterval(measureMemory, 5000); // Every 5 seconds

    return () => {
      clearInterval(apiInterval);
      clearInterval(memoryInterval);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div>API: {metrics.apiResponseTime}ms</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
      <div>Status: <span style={{ 
        color: metrics.connectionStatus === 'connected' ? '#4CAF50' : '#f44336' 
      }}>
        {metrics.connectionStatus}
      </span></div>
    </div>
  );
};

export default PerformanceMonitor;