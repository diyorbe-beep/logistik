// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://logistik-pro.onrender.com';

export const API_URL = API_BASE_URL;

// Debug API URL
console.log('API_URL configured as:', API_URL);

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', `${API_URL}/api/health`);
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API health check response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API health check data:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('API health check failed:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  API_URL,
  testApiConnection,
};





