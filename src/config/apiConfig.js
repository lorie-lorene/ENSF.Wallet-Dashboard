/**
 * 🔧 API Configuration Module
 * 
 * Centralized configuration for all API services and endpoints.
 * Handles environment-based URL configuration and endpoint definitions.
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

/**
 * Environment configuration for different deployment stages
 */
const ENV_CONFIG = {
  development: {
    userServiceUrl: 'http://localhost:8091',
    agenceServiceUrl: 'http://localhost:8092',
    moneyServiceUrl: 'http://localhost:8080'
  },
  production: {
    userServiceUrl: import.meta.env.VITE_USER_SERVICE_URL,
    agenceServiceUrl: import.meta.env.VITE_AGENCE_SERVICE_URL,
    moneyServiceUrl: import.meta.env.VITE_MONEY_SERVICE_URL
  }
};

/**
 * Get current environment configuration
 * @returns {Object} Environment-specific configuration
 */
const getCurrentEnvConfig = () => {
  const isDevelopment = import.meta.env.MODE === 'development';
  return isDevelopment ? ENV_CONFIG.development : ENV_CONFIG.production;
};

/**
 * Base URLs for different services
 */
export const BASE_URLS = {
  USER_SERVICE: getCurrentEnvConfig().userServiceUrl,
  AGENCE_SERVICE: getCurrentEnvConfig().agenceServiceUrl,
  MONEY_SERVICE: getCurrentEnvConfig().moneyServiceUrl
};

/**
 * API Endpoints Configuration
 * Organized by service for better maintainability
 */
export const ENDPOINTS = {
  // User Service endpoints
  USER_SERVICE: {
    // Authentication
    REGISTER: '/api/v1/users/register',
    LOGIN: '/api/v1/users/login',
    LOGOUT: '/api/v1/users/logout',
    REFRESH: '/api/v1/users/refresh',
    
    // User Management
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: (clientId) => `/api/v1/users/profile/${clientId}`,
    SEARCH: '/api/v1/users/search',
    STATISTICS: '/api/v1/users/statistics',
    UNLOCK: (clientId) => `/api/v1/users/${clientId}/unlock`,
    
    // Financial Operations
    BALANCE: '/api/v1/users/balance',
    TRANSACTIONS: '/api/v1/users/transactions',
    DEPOSIT: '/api/v1/users/deposit',
    WITHDRAWAL: '/api/v1/users/withdrawal',
    TRANSFER: '/api/v1/users/transfer'
  },

  // Agence Service endpoints
  AGENCE_SERVICE: {
    // Authentication
    AUTH: {
      LOGIN: '/api/v1/agence/auth/login',
      REFRESH: '/api/v1/agence/auth/refresh',
      LOGOUT: '/api/v1/agence/auth/logout',
      CHANGE_PASSWORD: '/api/v1/agence/auth/change-password'
    },
    
    // Admin Dashboard
    ADMIN: {
      DASHBOARD: '/api/v1/agence/admin/dashboard',
      DASHBOARD_HEALTH: '/api/v1/agence/admin/dashboard/health',
      RECENT_ACTIVITY: '/api/v1/agence/admin/dashboard/recent-activity'
    },
    
    // User Management
    USERS: {
      LIST: '/api/v1/agence/admin/users',
      DETAILS: (userId) => `/api/v1/agence/admin/users/${userId}`,
      STATISTICS: '/api/v1/agence/admin/users/statistics',
      EXPORT: '/api/v1/agence/admin/users/export',
      CREATE: '/api/v1/agence/admin/users',
      UPDATE: (userId) => `/api/v1/agence/admin/users/${userId}`,
      BLOCK: (userId) => `/api/v1/agence/admin/users/${userId}/block`,
      UNBLOCK: (userId) => `/api/v1/agence/admin/users/${userId}/unblock`
    },
    
    // Document Management
    DOCUMENTS: {
      PENDING: '/api/v1/agence/admin/documents/pending',
      REVIEW: (docId) => `/api/v1/agence/admin/documents/${docId}/review`,
      APPROVE: (docId) => `/api/v1/agence/admin/documents/${docId}/approve`,
      REJECT: (docId) => `/api/v1/agence/admin/documents/${docId}/reject`,
      STATISTICS: '/api/v1/agence/admin/documents/statistics',
      BULK_APPROVE: '/api/v1/agence/admin/documents/bulk-approve',
      BULK_REJECT: '/api/v1/agence/admin/documents/bulk-reject'
    }
  },

  // Money Service endpoints
  MONEY_SERVICE: {
    DEPOSIT: '/api/deposit',
    WITHDRAWAL: '/api/withdrawal',
    TRANSFER: '/api/transfer',
    PAYMENT_STATUS: (transactionId) => `/api/payment/${transactionId}/status`
  }
};

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Request timeout configurations (in milliseconds)
 */
export const TIMEOUT_CONFIG = {
  DEFAULT: 10000,        // 10 seconds
  UPLOAD: 30000,         // 30 seconds for file uploads
  DOWNLOAD: 60000,       // 60 seconds for downloads
  LONG_RUNNING: 120000   // 2 minutes for long operations
};

/**
 * Retry configuration for failed requests
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,     // 1 second
  EXPONENTIAL_BACKOFF: true
};

/**
 * Error messages for different scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de réseau. Veuillez vérifier votre connexion.',
  TIMEOUT_ERROR: 'La requête a expiré. Veuillez réessayer.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Accès non autorisé à cette ressource.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur du serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Données invalides. Veuillez vérifier vos entrées.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.'
};

export default {
  BASE_URLS,
  ENDPOINTS,
  HTTP_STATUS,
  TIMEOUT_CONFIG,
  RETRY_CONFIG,
  ERROR_MESSAGES
};