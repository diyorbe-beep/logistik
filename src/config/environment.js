// Environment configuration with validation
const getRequiredEnv = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getEnvWithDefault = (key, defaultValue) => {
  return import.meta.env[key] || defaultValue;
};

export const environment = {
  // API Configuration
  API_URL: getEnvWithDefault('VITE_API_URL', 'http://localhost:5000'),
  API_TIMEOUT: parseInt(getEnvWithDefault('VITE_API_TIMEOUT', '10000')),
  
  // Application Configuration
  APP_NAME: getEnvWithDefault('VITE_APP_NAME', 'Logistics Pro'),
  APP_VERSION: getEnvWithDefault('VITE_APP_VERSION', '1.0.0'),
  
  // Feature Flags
  ENABLE_ANALYTICS: getEnvWithDefault('VITE_ENABLE_ANALYTICS', 'false') === 'true',
  ENABLE_DEBUG: getEnvWithDefault('VITE_ENABLE_DEBUG', 'false') === 'true',
  
  // Security
  TOKEN_REFRESH_THRESHOLD: parseInt(getEnvWithDefault('VITE_TOKEN_REFRESH_THRESHOLD', '300000')), // 5 minutes
  SESSION_TIMEOUT: parseInt(getEnvWithDefault('VITE_SESSION_TIMEOUT', '3600000')), // 1 hour
  
  // Performance
  CACHE_DURATION: parseInt(getEnvWithDefault('VITE_CACHE_DURATION', '300000')), // 5 minutes
  RETRY_ATTEMPTS: parseInt(getEnvWithDefault('VITE_RETRY_ATTEMPTS', '3')),
  
  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test'
};

// Validate critical environment variables
export const validateEnvironment = () => {
  const errors = [];
  
  if (!environment.API_URL) {
    errors.push('API_URL is required');
  }
  
  if (environment.API_TIMEOUT < 1000) {
    errors.push('API_TIMEOUT must be at least 1000ms');
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

export default environment;
