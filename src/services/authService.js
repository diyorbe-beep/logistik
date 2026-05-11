import api from '../api/client';
import { environment } from '../config/environment';

class AuthService {
  constructor() {
    this.tokenRefreshTimer = null;
    this.sessionTimeoutTimer = null;
  }

  // Secure token storage using sessionStorage instead of localStorage
  setToken(token) {
    try {
      sessionStorage.setItem('authToken', token);
      this.setupTokenRefresh();
      this.setupSessionTimeout();
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Token storage failed');
    }
  }

  getToken() {
    try {
      return sessionStorage.getItem('authToken');
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }

  removeToken() {
    try {
      sessionStorage.removeItem('authToken');
      this.clearTimers();
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  // Setup automatic token refresh
  setupTokenRefresh() {
    this.clearTokenRefreshTimer();
    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshToken();
    }, environment.TOKEN_REFRESH_THRESHOLD);
  }

  // Setup session timeout
  setupSessionTimeout() {
    this.clearSessionTimeoutTimer();
    this.sessionTimeoutTimer = setTimeout(() => {
      this.logout();
      window.location.href = '/login?reason=session_expired';
    }, environment.SESSION_TIMEOUT);
  }

  clearTimers() {
    this.clearTokenRefreshTimer();
    this.clearSessionTimeoutTimer();
  }

  clearTokenRefreshTimer() {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  clearSessionTimeoutTimer() {
    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
      this.sessionTimeoutTimer = null;
    }
  }

  // Refresh token with retry logic
  async refreshToken() {
    const currentToken = this.getToken();
    if (!currentToken) {
      throw new Error('No token to refresh');
    }

    try {
      const response = await api.post('/auth/refresh', {
        token: currentToken
      });

      const newToken = response.data.token;
      this.setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  // Login with enhanced security
  async login(credentials) {
    try {
      // Validate credentials before sending
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }

      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;

      // Validate token format
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token received');
      }

      this.setToken(token);
      return { token, user };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Enhanced error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  // Register with validation
  async register(userData) {
    try {
      // Validate required fields
      const requiredFields = ['username', 'email', 'password'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.response?.status === 409) {
        throw new Error('User already exists');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid user data');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  }

  // Logout with cleanup
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        await api.post('/auth/logout', { token });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.removeToken();
      // Clear any cached user data
      sessionStorage.removeItem('user');
      localStorage.removeItem('token'); // Clean up old localStorage usage
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Get token payload (for user info)
  getTokenPayload() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;
