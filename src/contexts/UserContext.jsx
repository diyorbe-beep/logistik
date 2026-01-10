import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api';
import { preloadCriticalData } from '../hooks/useApi';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Optimized profile fetch with timeout and retry
  const fetchUserProfile = useCallback(async (retryCount = 0) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Add timeout for faster failure detection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        
        // Preload critical data after successful login (with delay to avoid overwhelming server)
        setTimeout(() => {
          preloadCriticalData().catch((error) => {
            console.log('Preload failed:', error);
            // Don't show error to user, just log it
          });
        }, 1000); // 1 second delay
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        setUser(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      
      // Retry logic for network issues
      if (retryCount < 2 && (err.name === 'AbortError' || err.message.includes('fetch'))) {
        setTimeout(() => {
          fetchUserProfile(retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setError(err.message);
      
      // If persistent error, clear token
      if (retryCount >= 2) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user data is already cached
    const cachedUser = sessionStorage.getItem('user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
        // Still fetch fresh data in background
        fetchUserProfile();
        return;
      } catch (e) {
        sessionStorage.removeItem('user');
      }
    }

    fetchUserProfile();
  }, [fetchUserProfile]);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    // Cache user data for faster subsequent loads
    sessionStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setError(null);
  }, []);

  // Cache user data when it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      error,
      updateUser, 
      logout, 
      refetchUser: fetchUserProfile 
    }}>
      {children}
    </UserContext.Provider>
  );
};



