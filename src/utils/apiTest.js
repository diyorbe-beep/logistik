import { API_URL } from '../config/api';

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', API_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ API connection failed:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ API connection error:', error);
    return { success: false, error: error.message };
  }
};

// Test login endpoint
export const testLoginEndpoint = async () => {
  try {
    console.log('Testing login endpoint...');
    
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login test successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ Login test failed:', data);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('❌ Login test error:', error);
    return { success: false, error: error.message };
  }
};

// Wake up Render.com server
export const wakeUpServer = async () => {
  console.log('🔄 Waking up Render.com server...');
  
  try {
    // Multiple requests to ensure server wakes up
    const requests = Array.from({ length: 3 }, (_, i) => 
      fetch(`${API_URL}/api/health`, { 
        method: 'GET',
        cache: 'no-cache'
      }).catch(() => null)
    );
    
    await Promise.allSettled(requests);
    
    // Wait a bit for server to fully wake up
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test if server is responsive
    const result = await testApiConnection();
    
    if (result.success) {
      console.log('✅ Server is awake and responsive');
    } else {
      console.log('⚠️ Server may still be waking up...');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error waking up server:', error);
    return { success: false, error: error.message };
  }
};