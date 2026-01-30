import { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '../config/api';

// API Cache for performance optimization
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Keep-alive mechanism to prevent Render.com cold starts
let keepAliveInterval;
const startKeepAlive = () => {
  if (keepAliveInterval) return;
  
  keepAliveInterval = setInterval(async () => {
    try {
      await fetch(`${API_URL}/api/health`, { 
        method: 'GET',
        mode: 'no-cors' // Prevent CORS issues for keep-alive
      });
    } catch (error) {
      // Ignore errors for keep-alive requests
    }
  }, 10 * 60 * 1000); // Every 10 minutes
};

// Start keep-alive when module loads
startKeepAlive();

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef();

  const {
    cache = true,
    immediate = true,
    dependencies = [],
    timeout = 15000 // 15 second timeout
  } = options;

  const fetchData = useCallback(async (customUrl = url, customOptions = {}) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const cacheKey = `${customUrl}_${JSON.stringify(customOptions)}`;
    
    // Check cache first
    if (cache) {
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data);
        setLoading(false);
        setError(null);
        return cached.data;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const fetchOptions = {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...customOptions.headers
        },
        ...customOptions
      };

      // Add timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );

      const fetchPromise = fetch(`${API_URL}${customUrl}`, fetchOptions);
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Cache successful responses
      if (cache) {
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      setData(result);
      setError(null);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('API Error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, cache, timeout]);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, immediate, ...dependencies]);

  const refetch = useCallback(() => fetchData(), [fetchData]);
  
  const mutate = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    fetch: fetchData
  };
};

// Optimized API functions with better error handling
export const apiRequest = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      // Don't throw for 404s during preloading
      if (response.status === 404 && options.ignoreNotFound) {
        console.log(`Endpoint not found (ignored): ${endpoint}`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Error for ${endpoint}:`, error);
    throw error;
  }
};

// Clear cache function
export const clearApiCache = () => {
  apiCache.clear();
};

// Preload critical endpoints with better error handling
export const preloadCriticalData = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  console.log('🔄 Starting critical data preload...');

  // Get user info first to determine role-based endpoints
  let userRole = null;
  try {
    const profileData = await apiRequest('/api/users/profile');
    userRole = profileData.role;
    console.log(`👤 User role: ${userRole}`);
  } catch (error) {
    console.log('⚠️ Could not fetch user profile for preloading:', error.message);
    return;
  }

  // Define endpoints based on user role
  const criticalEndpoints = [];
  
  if (userRole === 'carrier') {
    criticalEndpoints.push('/api/available-shipments', '/api/my-shipments');
  } else if (userRole === 'customer') {
    criticalEndpoints.push('/api/my-shipments', '/api/orders');
  } else if (userRole === 'operator' || userRole === 'admin') {
    criticalEndpoints.push('/api/shipments');
  }

  if (criticalEndpoints.length === 0) {
    console.log('✅ No additional endpoints to preload for this role');
    return;
  }

  // Preload in parallel with error handling
  const promises = criticalEndpoints.map(async (endpoint) => {
    try {
      await apiRequest(endpoint, { ignoreNotFound: true });
      console.log(`✅ Preloaded: ${endpoint}`);
      return { endpoint, success: true };
    } catch (error) {
      console.log(`⚠️ Preload failed for ${endpoint}:`, error.message);
      return { endpoint, success: false, error: error.message };
    }
  });

  try {
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`✅ Preload completed: ${successful}/${criticalEndpoints.length} successful`);
  } catch (error) {
    console.log('⚠️ Preload process failed:', error);
  }
};