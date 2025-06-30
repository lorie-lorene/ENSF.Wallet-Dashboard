/**
 * 🔗 Main API Service - Orchestrator
 * 
 * This is the main API service that orchestrates all other services.
 * It provides a unified interface for the entire application.
 * 
 * Services included:
 * - AuthService: Authentication and authorization
 * - UserService: User management and financial operations  
 * - AgenceService: Admin dashboard and document management
 * - HttpClient: Core HTTP functionality
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import authService from './authService.js';
import userService from './userService.js';
import agenceService from './agenceService.js';
import httpClient from './httpClient.js';
import { BASE_URLS, ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES } from '../config/apiConfig.js';

/**
 * Main API Service Class
 * Provides a unified interface for all API operations
 */
class ApiService {
  constructor() {
    // Expose individual services
    this.auth = authService;
    this.user = userService;
    this.agence = agenceService;
    this.http = httpClient;
    
    // Configuration
    this.config = {
      baseUrls: BASE_URLS,
      endpoints: ENDPOINTS,
      httpStatus: HTTP_STATUS,
      errorMessages: ERROR_MESSAGES
    };

    // Initialize service
    this.initialize();
  }

  /**
   * Initialize the API service
   */
  initialize() {
    console.log('🚀 Initializing ENSF Wallet API Service');
    
    // Set up authentication event listeners
    this.setupAuthenticationListeners();
    
    // Add global error handlers
    this.setupGlobalErrorHandlers();
    
    console.log('✅ API Service initialized successfully');
  }

  /**
   * Setup authentication event listeners
   */
  setupAuthenticationListeners() {
    // Listen for authentication events
    this.auth.addEventListener('login', (userData) => {
      console.log('🔐 User logged in:', userData.email);
      this.onAuthenticationChange(true, userData);
    });

    this.auth.addEventListener('logout', () => {
      console.log('🚪 User logged out');
      this.onAuthenticationChange(false, null);
    });

    this.auth.addEventListener('tokenRefresh', (tokenData) => {
      console.log('🔄 Token refreshed successfully');
    });
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Add response interceptor for global error handling
    this.http.addResponseInterceptor(
      // Success handler
      (response) => response,
      
      // Error handler
      async (error) => {
        await this.handleGlobalError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle authentication state changes
   * @param {boolean} isAuthenticated - Authentication status
   * @param {Object|null} user - User data
   */
  onAuthenticationChange(isAuthenticated, user) {
    if (isAuthenticated) {
      // User logged in - set up authenticated context
      this.http.setAuthToken(this.auth.getAuthToken());
    } else {
      // User logged out - clear authenticated context
      this.http.setAuthToken(null);
    }
  }

  /**
   * Handle global errors
   * @param {Error} error - Error object
   */
  async handleGlobalError(error) {
    // Handle authentication errors
    if (error.status === HTTP_STATUS.UNAUTHORIZED) {
      console.warn('🚨 Authentication error detected, logging out user');
      await this.auth.logout();
      // Redirect to login page or show login modal
      this.emitEvent('authenticationError', error);
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error);
      this.emitEvent('networkError', error);
    }
    
    // Handle server errors
    if (error.status >= 500) {
      console.error('🔥 Server error:', error);
      this.emitEvent('serverError', error);
    }
  }

  // =====================================
  // CONVENIENCE METHODS
  // =====================================

  /**
   * Check if user is currently authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    return this.auth.getCurrentUser();
  }

  /**
   * Login user (auto-detects service based on email domain or role)
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} service - Optional service type ('user' or 'agence')
   * @returns {Promise<Object>} Login response
   */
  async login(email, password, service = null) {
    try {
      // Auto-detect service if not specified
      if (!service) {
        service = this.detectServiceFromEmail(email);
      }

      if (service === 'agence') {
        return await this.auth.loginAgenceService(email, password);
      } else {
        return await this.auth.loginUserService(email, password);
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Detect which service to use based on email
   * @param {string} email - User email
   * @returns {string} Service type ('user' or 'agence')
   */
  detectServiceFromEmail(email) {
    // Admin emails typically have specific domains or patterns
    const adminDomains = ['admin.ensf.com', 'agence.ensf.com'];
    const emailDomain = email.split('@')[1];
    
    if (adminDomains.includes(emailDomain) || email.includes('admin')) {
      return 'agence';
    }
    
    return 'user';
  }

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await this.auth.logout();
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard data for admin users
   * @returns {Promise<Object>} Complete dashboard data
   */
  async getDashboardData() {
    try {
      console.log('📊 Fetching comprehensive dashboard data');

      // Fetch data from multiple sources in parallel
      const [
        dashboardData,
        systemHealth,
        recentActivity,
        userStats,
        documentStats
      ] = await Promise.allSettled([
        this.agence.getDashboardData(),
        this.agence.getSystemHealth(),
        this.agence.getRecentActivity({ limit: 20 }),
        this.agence.getUserStatistics(),
        this.agence.getDocumentStatistics()
      ]);

      // Combine results
      const result = {
        dashboard: dashboardData.status === 'fulfilled' ? dashboardData.value : null,
        systemHealth: systemHealth.status === 'fulfilled' ? systemHealth.value : null,
        recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value : [],
        userStats: userStats.status === 'fulfilled' ? userStats.value : null,
        documentStats: documentStats.status === 'fulfilled' ? documentStats.value : null,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Dashboard data fetched successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get user financial summary
   * @param {string} clientId - Optional client ID
   * @returns {Promise<Object>} Financial summary
   */
  async getUserFinancialSummary(clientId = null) {
    try {
      console.log('💰 Fetching user financial summary');

      const [balance, transactions] = await Promise.allSettled([
        this.user.getBalance(clientId),
        this.user.getTransactions({ clientId, page: 0, size: 10 })
      ]);

      const result = {
        balance: balance.status === 'fulfilled' ? balance.value : 0,
        recentTransactions: transactions.status === 'fulfilled' ? 
          transactions.value.content || [] : [],
        timestamp: new Date().toISOString()
      };

      console.log('✅ Financial summary fetched successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch financial summary:', error);
      throw error;
    }
  }

  /**
   * Perform financial operation with validation
   * @param {string} operation - Operation type ('deposit', 'withdrawal', 'transfer')
   * @param {Object} operationData - Operation data
   * @returns {Promise<Object>} Operation response
   */
  async performFinancialOperation(operation, operationData) {
    try {
      console.log(`💸 Performing ${operation} operation`);

      let response;
      switch (operation.toLowerCase()) {
        case 'deposit':
          response = await this.user.deposit(operationData);
          break;
        case 'withdrawal':
          response = await this.user.withdrawal(operationData);
          break;
        case 'transfer':
          response = await this.user.transfer(operationData);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      console.log(`✅ ${operation} completed successfully`);
      return response;
    } catch (error) {
      console.error(`❌ ${operation} failed:`, error);
      throw error;
    }
  }

  /**
   * Search across multiple data sources
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Combined search results
   */
  async globalSearch(query, options = {}) {
    try {
      console.log('🔍 Performing global search:', query);

      const searchTasks = [];

      // Search users if authenticated as admin
      if (this.isAuthenticated() && this.isAdminUser()) {
        searchTasks.push(
          this.agence.getUsers({ search: query, size: 10 })
            .then(result => ({ type: 'users', data: result.content || [] }))
            .catch(() => ({ type: 'users', data: [] }))
        );
      }

      // Search user's own transactions
      if (this.isAuthenticated()) {
        searchTasks.push(
          this.user.getTransactions({ size: 10 })
            .then(result => ({ 
              type: 'transactions', 
              data: (result.content || []).filter(t => 
                t.description?.toLowerCase().includes(query.toLowerCase())
              )
            }))
            .catch(() => ({ type: 'transactions', data: [] }))
        );
      }

      const results = await Promise.allSettled(searchTasks);
      const combinedResults = {};

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          combinedResults[result.value.type] = result.value.data;
        }
      });

      console.log('✅ Global search completed');
      return combinedResults;
    } catch (error) {
      console.error('❌ Global search failed:', error);
      throw error;
    }
  }

  /**
   * Check if current user is an admin
   * @returns {boolean} Admin status
   */
  isAdminUser() {
    const user = this.getCurrentUser();
    return user && (user.role === 'BANK_ADMIN' || user.role === 'AGENCY_DIRECTOR');
  }

  /**
   * Get service health status
   * @returns {Promise<Object>} Health status of all services
   */
  async getServicesHealth() {
    try {
      console.log('🏥 Checking services health');

      const healthChecks = await Promise.allSettled([
        this.http.get(`${BASE_URLS.USER_SERVICE}/actuator/health`),
        this.http.get(`${BASE_URLS.AGENCE_SERVICE}/actuator/health`),
        this.http.get(`${BASE_URLS.MONEY_SERVICE}/actuator/health`)
      ]);

      const health = {
        userService: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        agenceService: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        moneyService: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        overall: healthChecks.every(check => check.status === 'fulfilled') ? 'healthy' : 'degraded'
      };

      console.log('✅ Services health check completed');
      return health;
    } catch (error) {
      console.error('❌ Services health check failed:', error);
      return {
        userService: 'unknown',
        agenceService: 'unknown',
        moneyService: 'unknown',
        overall: 'unknown'
      };
    }
  }

  // =====================================
  // EVENT SYSTEM
  // =====================================

  /**
   * Event listeners registry
   */
  eventListeners = {};

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emitEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in ${event} event listener:`, error);
        }
      });
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();

// For backward compatibility, also export individual services
export {
  authService,
  userService,
  agenceService,
  httpClient
};

// Export configuration
export { BASE_URLS, ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES } from '../config/apiConfig.js';

// Default export
export default apiService;