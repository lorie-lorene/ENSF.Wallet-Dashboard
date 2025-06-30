/**
 * 🔐 Authentication Service
 * 
 * Handles all authentication-related operations:
 * - User login/logout for both User and Agence services
 * - JWT token management and automatic refresh
 * - Authentication state management
 * - Session persistence and security
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import httpClient from './httpClient.js';
import { BASE_URLS, ENDPOINTS } from '../config/apiConfig.js';

/**
 * Authentication Service Class
 * Manages authentication state and operations
 */
class AuthService {
  constructor() {
    this.currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
    this.authToken = null;
    this.refreshToken = null;
    this.tokenExpiryTime = null;
    this.refreshTimer = null;
    this.adminToken = (JSON.parse(localStorage.getItem('currentUser'))).accessToken; // For admin users, use global authToken if available
    
    // Initialize from localStorage
    this.initializeFromStorage();
  }

  /**
   * Initialize authentication state from localStorage
   */
  initializeFromStorage() {
    try {
      const storedAuth = localStorage.getItem('ensf_auth');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        
        // Check if token is still valid
        if (authData.tokenExpiryTime && new Date().getTime() < authData.tokenExpiryTime) {
          this.currentUser = authData.user;
          this.authToken = authData.token;
          this.refreshToken = authData.refreshToken;
          this.tokenExpiryTime = authData.tokenExpiryTime;
          
          // Set token in HTTP client
          httpClient.setAuthToken(this.authToken);
          
          // Schedule token refresh
          this.scheduleTokenRefresh();
          
          console.log('✅ Authentication restored from storage', this.currentUser);
        } else {
          console.log('⚠️ Stored token expired, clearing storage');
          this.clearAuthData();
        }
      }
    } catch (error) {
      console.error('❌ Error initializing auth from storage:', error);
      this.clearAuthData();
    }
  }

  /**
   * Store authentication data in localStorage
   */
  storeAuthData() {
    try {
      const authData = {
        user: this.currentUser,
        token: this.authToken,
        refreshToken: this.refreshToken,
        tokenExpiryTime: this.tokenExpiryTime
      };
      localStorage.setItem('ensf_auth', JSON.stringify(authData));
      console.log('💾 Authentication data stored');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
    }
  }

  /**
   * Clear authentication data from memory and storage
   */
  clearAuthData() {
    this.currentUser = null;
    this.authToken = null;
    this.refreshToken = null;
    this.tokenExpiryTime = null;
    
    // Clear from HTTP client
    httpClient.setAuthToken(null);
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Clear from localStorage
    localStorage.removeItem('ensf_auth');
    
    console.log('🗑️ Authentication data cleared');
  }

  /**
   * Parse JWT token to extract expiry time
   * @param {string} token - JWT token
   * @returns {number|null} Expiry time in milliseconds
   */
  parseTokenExpiry(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch (error) {
      console.error('❌ Error parsing token:', error);
      return null;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  scheduleTokenRefresh() {
    if (!this.tokenExpiryTime || !this.refreshToken) return;

    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Calculate refresh time (5 minutes before expiry)
    const refreshTime = this.tokenExpiryTime - new Date().getTime() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        console.log('🔄 Auto-refreshing token...');
        try {
          await this.refreshAuthToken();
        } catch (error) {
          console.error('❌ Auto token refresh failed:', error);
          this.logout();
        }
      }, refreshTime);
      
      console.log(`⏰ Token refresh scheduled in ${Math.round(refreshTime / 60000)} minutes`);
    } else {
      console.log('⚠️ Token expired, logging out');
      this.logout();
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    if(this.currentUser.roles.includes('ADMIN') || this.currentUser.roles.includes('AGENCE')) {
      return true;
    }
    return !!(this.currentUser && this.authToken);
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current authentication token
   * @returns {string|null} Current JWT token
   */
  getAuthToken() {
    return this.authToken;
  }

  /**
   * Login to User Service
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async loginUserService(email, password) {
    try {
      console.log('🔐 Logging in to User Service:', email);

      const response = await httpClient.post(
        `${BASE_URLS.USER_SERVICE}${ENDPOINTS.USER_SERVICE.LOGIN}`,
        { email, password }
      );

      if (response.data) {
        // Extract authentication data
        const { token, refreshToken, user } = response.data;
        
        // Set authentication state
        this.authToken = token;
        this.refreshToken = refreshToken;
        this.currentUser = user;
        this.tokenExpiryTime = this.parseTokenExpiry(token);
        
        // Set token in HTTP client
        httpClient.setAuthToken(this.authToken);
        
        // Store authentication data
        this.storeAuthData();
        
        // Schedule token refresh
        this.scheduleTokenRefresh();
        
        console.log('✅ User Service login successful:', user);
        return response.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('❌ User Service login failed:', error);
      throw error;
    }
  }

  /**
   * Login to Agence Service
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Login response
   */
  async loginAgenceService(email, password) {
    try {
      console.log('🔐 Logging in to Agence Service:', email);

      const response = await httpClient.post(
        `${BASE_URLS.AGENCE_SERVICE}${ENDPOINTS.AGENCE_SERVICE.AUTH.LOGIN}`,
        { email, password }
      );

      if (response.data) {
        // Extract authentication data
        const { token, refreshToken, user } = response.data;
        
        // Set authentication state
        this.authToken = token;
        this.refreshToken = refreshToken;
        this.currentUser = user;
        this.tokenExpiryTime = this.parseTokenExpiry(token);
        
        // Set token in HTTP client
        httpClient.setAuthToken(this.authToken);
        
        // Store authentication data
        this.storeAuthData();
        
        // Schedule token refresh
        this.scheduleTokenRefresh();
        
        console.log('✅ Agence Service login successful:', user);
        return response.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('❌ Agence Service login failed:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} Refresh response
   */
  async refreshAuthToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing authentication token');

      // Determine which service to use based on current user
      const isAgenceUser = this.currentUser?.role === 'BANK_ADMIN' || 
                          this.currentUser?.role === 'AGENCY_DIRECTOR';
      
      const baseUrl = isAgenceUser ? BASE_URLS.AGENCE_SERVICE : BASE_URLS.USER_SERVICE;
      const endpoint = isAgenceUser ? 
                      ENDPOINTS.AGENCE_SERVICE.AUTH.REFRESH : 
                      ENDPOINTS.USER_SERVICE.REFRESH;

      const response = await httpClient.post(
        `${baseUrl}${endpoint}`,
        { refreshToken: this.refreshToken }
      );

      if (response.data) {
        const { token, refreshToken } = response.data;
        
        // Update tokens
        this.authToken = token;
        if (refreshToken) {
          this.refreshToken = refreshToken;
        }
        this.tokenExpiryTime = this.parseTokenExpiry(token);
        
        // Set new token in HTTP client
        httpClient.setAuthToken(this.authToken);
        
        // Store updated data
        this.storeAuthData();
        
        // Schedule next refresh
        this.scheduleTokenRefresh();
        
        console.log('✅ Token refreshed successfully');
        return response.data;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Change password response
   */
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('🔑 Changing password for user:', this.currentUser?.email);

      if (!this.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      // Use Agence Service for admin users
      const response = await httpClient.post(
        `${BASE_URLS.AGENCE_SERVICE}${ENDPOINTS.AGENCE_SERVICE.AUTH.CHANGE_PASSWORD}`,
        {
          currentPassword,
          newPassword
        }
      );

      console.log('✅ Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Password change failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      console.log('🚪 Logging out user:', this.currentUser?.email);

      // Attempt to notify server of logout (don't wait for response)
      if (this.isAuthenticated()) {
        const isAgenceUser = this.currentUser?.role === 'BANK_ADMIN' || 
                            this.currentUser?.role === 'AGENCY_DIRECTOR';
        
        const baseUrl = isAgenceUser ? BASE_URLS.AGENCE_SERVICE : BASE_URLS.USER_SERVICE;
        const endpoint = isAgenceUser ? 
                        ENDPOINTS.AGENCE_SERVICE.AUTH.LOGOUT : 
                        ENDPOINTS.USER_SERVICE.LOGOUT;

        // Fire and forget - don't block logout on server response
        httpClient.post(`${baseUrl}${endpoint}`, {
          refreshToken: this.refreshToken
        }).catch(error => {
          console.warn('⚠️ Server logout notification failed:', error);
        });
      }

      // Clear local authentication data
      this.clearAuthData();
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if server logout fails, clear local data
      this.clearAuthData();
    }
  }

  /**
   * Register new user (User Service)
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      console.log('📝 Registering new user:', userData.email);

      const response = await httpClient.post(
        `${BASE_URLS.USER_SERVICE}${ENDPOINTS.USER_SERVICE.REGISTER}`,
        userData
      );

      console.log('✅ User registration successful');
      return response.data;
    } catch (error) {
      console.error('❌ User registration failed:', error);
      throw error;
    }
  }

  /**
   * Validate current session
   * @returns {Promise<boolean>} Session validity
   */
  async validateSession() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      // Try to fetch user profile to validate session
      const response = await httpClient.get(
        `${BASE_URLS.USER_SERVICE}${ENDPOINTS.USER_SERVICE.PROFILE}`
      );

      return response.status === 200;
    } catch (error) {
      console.error('❌ Session validation failed:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Get authentication headers for manual requests
   * @returns {Object} Headers with authorization
   */
  getAuthHeaders() {
    return this.authToken ? {
      'Authorization': `Bearer ${this.authToken}`
    } : {};
  }

  /**
   * Add authentication event listener
   * @param {string} event - Event type ('login', 'logout', 'tokenRefresh')
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (!this.eventListeners) {
      this.eventListeners = {};
    }
    
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove authentication event listener
   * @param {string} event - Event type
   * @param {Function} callback - Event callback to remove
   */
  removeEventListener(event, callback) {
    if (this.eventListeners && this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  /**
   * Emit authentication event
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  emitEvent(event, data) {
    if (this.eventListeners && this.eventListeners[event]) {
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
const authService = new AuthService();
export default authService;