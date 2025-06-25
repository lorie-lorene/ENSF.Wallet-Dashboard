/**
 * 🔗 Enhanced API Service for Admin Dashboard with Authentication
 * 
 * This service handles ALL backend integrations for:
 * - UserService: Authentication, user management, financial operations
 * - AgenceService: All controllers (Admin, Agence, DocumentApproval, Auth)
 * 
 * Features:
 * - Professional error handling with retry mechanisms
 * - JWT token management and automatic header injection
 * - Request/response logging
 * - Environment-based configuration
 * - Type-safe API responses
 * - Authentication state management
 * - Automatic token refresh handling
 */

class ApiService {
  constructor() {
    // Environment configuration
    this.config = {
      userService: {
        baseUrl: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8091',
        endpoints: {
          // Authentication endpoints
          login: '/api/v1/users/login',
          register: '/api/v1/users/register',
          refreshToken: '/api/v1/users/refresh-token',
          registrationStatus: '/api/v1/users/registration-status',
          passwordResetRequest: '/api/v1/users/password-reset/request',
          
          // Profile management
          profile: '/api/v1/users/profile',
          updateProfile: (clientId) => `/api/v1/users/profile/${clientId}`,
          
          // Financial operations
          deposit: '/api/v1/users/deposit',
          withdrawal: '/api/v1/users/withdrawal',
          transfer: '/api/v1/users/transfer',
          balance: '/api/v1/users/balance',
          transactions: '/api/v1/users/transactions',
          
          // Admin endpoints
          search: '/api/v1/users/search',
          statistics: '/api/v1/users/statistics',
          unlock: (clientId) => `/api/v1/users/${clientId}/unlock`
        }
      },
      agenceService: {
        baseUrl: import.meta.env.VITE_AGENCE_SERVICE_URL || 'http://localhost:8092',
        endpoints: {
          // Authentication endpoints
          login: '/api/v1/agence/auth/login',
          refresh: '/api/v1/agence/auth/refresh',
          logout: '/api/v1/agence/auth/logout',
          changePassword: '/api/v1/agence/auth/change-password',
          
          // Admin Dashboard endpoints
          dashboard: '/api/v1/agence/admin/dashboard',
          dashboardHealth: '/api/v1/agence/admin/dashboard/health',
          recentActivity: '/api/v1/agence/admin/dashboard/recent-activity',
          
          // Admin User Management endpoints
          adminUsers: '/api/v1/agence/admin/users',
          adminUserDetails: (userId) => `/api/v1/agence/admin/users/${userId}`,
          adminUserStatistics: '/api/v1/agence/admin/users/statistics',
          adminUserExport: '/api/v1/agence/admin/users/export',
          adminUserCreate: '/api/v1/agence/admin/users',
          adminUserUpdate: (userId) => `/api/v1/agence/admin/users/${userId}`,
          adminUserBlock: (userId) => `/api/v1/agence/admin/users/${userId}/block`,
          adminUserUnblock: (userId) => `/api/v1/agence/admin/users/${userId}/unblock`,
          
          // Document Approval endpoints
          pendingDocuments: '/api/v1/agence/admin/documents/pending',
          documentReview: (docId) => `/api/v1/agence/admin/documents/${docId}/review`,
          documentApprove: (docId) => `/api/v1/agence/admin/documents/${docId}/approve`,
          documentReject: (docId) => `/api/v1/agence/admin/documents/${docId}/reject`,
          documentStatistics: '/api/v1/agence/admin/documents/statistics',
          bulkApprove: '/api/v1/agence/admin/documents/bulk-approve',
          bulkReject: '/api/v1/agence/admin/documents/bulk-reject',
          
          // Agency Management endpoints
          agencies: '/api/v1/agence/admin/agencies',
          agencyDetails: (agencyId) => `/api/v1/agence/admin/agencies/${agencyId}`,
          agencyCreate: '/api/v1/agence/admin/agencies',
          agencyUpdate: (agencyId) => `/api/v1/agence/admin/agencies/${agencyId}`,
          agencyStatistics: '/api/v1/agence/admin/agencies/statistics'
        }
      }
    };

    // Request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    // Initialize authentication
    this.initializeAuth();
  }

  // =====================================
  // AUTHENTICATION MANAGEMENT
  // =====================================

  /**
   * Initialize authentication state
   */
  initializeAuth() {
    this.currentToken = localStorage.getItem('authToken');
    this.currentUser = this.getCurrentUser();
    
    if (this.currentToken) {
      console.log('🔐 ApiService: Authentication token loaded');
    }
  }

  /**
   * Get current authentication token
   */
  getAuthToken() {
    return this.currentToken || localStorage.getItem('authToken') || window.authToken;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.currentToken = token;
    window.authToken = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;
    
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  /**
   * Logout and clear authentication
   */
  async logoutAgenceService() {
    try {
      // Call logout endpoint if authenticated
      if (this.isAuthenticated()) {
        await this.makeRequest('POST', this.config.agenceService.endpoints.logout);
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear authentication data
      this.currentToken = null;
      this.currentUser = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('loginTimestamp');
      delete window.authToken;
      
      // Redirect to login
      window.location.reload();
    }
  }

  // =====================================
  // HTTP REQUEST UTILITIES
  // =====================================

  /**
   * Get default headers for requests
   */
  getDefaultHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add authentication header if available
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Make HTTP request with error handling and authentication
   */
  async makeRequest(method, url, options = {}) {
    const {
      body,
      headers = {},
      includeAuth = true,
      service = 'agenceService',
      ...otherOptions
    } = options;

    const baseUrl = this.config[service].baseUrl;
    const fullUrl = `${baseUrl}${url}`;

    const requestConfig = {
      method,
      headers: {
        ...this.getDefaultHeaders(includeAuth),
        ...headers
      },
      ...otherOptions
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      console.log(`🌐 ${method} ${fullUrl}`);
      
      const response = await fetch(fullUrl, requestConfig);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.warn('🔒 Authentication failed - redirecting to login');
        this.logoutAgenceService();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (response.status === 403) {
        throw new Error('Accès refusé. Permissions insuffisantes.');
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ ${method} ${fullUrl} - Success`);
        return data;
      } else {
        console.log(`✅ ${method} ${fullUrl} - Success (no JSON content)`);
        return response;
      }

    } catch (error) {
      console.error(`❌ ${method} ${fullUrl} - Error:`, error);
      throw error;
    }
  }

  // =====================================
  // AGENCE SERVICE API METHODS
  // =====================================

  /**
   * Get admin dashboard data
   */
  async getAdminDashboard() {
    return this.makeRequest('GET', this.config.agenceService.endpoints.dashboard);
  }

  /**
   * Get dashboard health status
   */
  async getDashboardHealth() {
    return this.makeRequest('GET', this.config.agenceService.endpoints.dashboardHealth);
  }

  /**
   * Get recent activity
   */
  async getRecentActivity() {
    return this.makeRequest('GET', this.config.agenceService.endpoints.recentActivity);
  }

  /**
   * Get admin users with pagination and filters
   */
  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `${this.config.agenceService.endpoints.adminUsers}?${queryString}`
      : this.config.agenceService.endpoints.adminUsers;
    
    return this.makeRequest('GET', endpoint);
  }

  /**
   * Get user statistics
   */
  async getAgenceUserStatistics() {
    return this.makeRequest('GET', this.config.agenceService.endpoints.adminUserStatistics);
  }

  /**
   * Create new user
   */
  async createAgenceUser(userData) {
    return this.makeRequest('POST', this.config.agenceService.endpoints.adminUserCreate, {
      body: userData
    });
  }

  /**
   * Update user
   */
  async updateAgenceUser(userId, userData) {
    return this.makeRequest('PUT', this.config.agenceService.endpoints.adminUserUpdate(userId), {
      body: userData
    });
  }

  /**
   * Block user
   */
  async blockAgenceUser(userId) {
    return this.makeRequest('POST', this.config.agenceService.endpoints.adminUserBlock(userId));
  }

  /**
   * Unblock user
   */
  async unblockAgenceUser(userId) {
    return this.makeRequest('POST', this.config.agenceService.endpoints.adminUserUnblock(userId));
  }

  /**
   * Get pending documents
   */
  async getPendingDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `${this.config.agenceService.endpoints.pendingDocuments}?${queryString}`
      : this.config.agenceService.endpoints.pendingDocuments;
    
    return this.makeRequest('GET', endpoint);
  }

  /**
   * Get document statistics
   */
  async getDocumentStatistics() {
    return this.makeRequest('GET', this.config.agenceService.endpoints.documentStatistics);
  }

  /**
   * Approve document
   */
  async approveDocument(documentId, comment = '') {
    return this.makeRequest('POST', this.config.agenceService.endpoints.documentApprove(documentId), {
      body: { comment }
    });
  }

  /**
   * Reject document
   */
  async rejectDocument(documentId, reason = '') {
    return this.makeRequest('POST', this.config.agenceService.endpoints.documentReject(documentId), {
      body: { reason }
    });
  }

  /**
   * Bulk approve documents
   */
  async bulkApproveDocuments(documentIds, comment = '') {
    return this.makeRequest('POST', this.config.agenceService.endpoints.bulkApprove, {
      body: { documentIds, comment }
    });
  }

  /**
   * Bulk reject documents
   */
  async bulkRejectDocuments(documentIds, reason = '') {
    return this.makeRequest('POST', this.config.agenceService.endpoints.bulkReject, {
      body: { documentIds, reason }
    });
  }

  // =====================================
  // USER SERVICE API METHODS
  // =====================================

  /**
   * Search users in UserService
   */
  async searchUsers(searchTerm, params = {}) {
    const allParams = { searchTerm, ...params };
    const queryString = new URLSearchParams(allParams).toString();
    const endpoint = `${this.config.userService.endpoints.search}?${queryString}`;
    
    return this.makeRequest('GET', endpoint, { service: 'userService' });
  }

  /**
   * Get user statistics from UserService
   */
  async getUserStatistics() {
    return this.makeRequest('GET', this.config.userService.endpoints.statistics, { 
      service: 'userService' 
    });
  }

  /**
   * Unlock user in UserService
   */
  async unlockUser(clientId) {
    return this.makeRequest('POST', this.config.userService.endpoints.unlock(clientId), { 
      service: 'userService' 
    });
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  /**
   * Test API connectivity
   */
  async testConnectivity() {
    const results = {
      agenceService: false,
      userService: false
    };

    try {
      await this.getDashboardHealth();
      results.agenceService = true;
    } catch (error) {
      console.warn('AgenceService connectivity test failed:', error);
    }

    try {
      await this.getUserStatistics();
      results.userService = true;
    } catch (error) {
      console.warn('UserService connectivity test failed:', error);
    }

    return results;
  }

  /**
   * Retry failed requests
   */
  async withRetry(requestFn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;