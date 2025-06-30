/**
 * 👥 User Management Service
 * 
 * Handles all user-related operations:
 * - User profile management
 * - User search and filtering
 * - User statistics and analytics
 * - Account operations (balance, transactions)
 * - Financial operations (deposit, withdrawal, transfer)
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import httpClient from './httpClient.js';
import authService from './authService.js';
import { BASE_URLS, ENDPOINTS } from '../config/apiConfig.js';

/**
 * User Service Class
 * Manages all user-related API operations
 */
class UserService {
  constructor() {
    this.baseUrl = BASE_URLS.USER_SERVICE;
  }

  /**
   * Ensure user is authenticated before making requests
   * @throws {Error} If user is not authenticated
   */
  ensureAuthenticated() {
    if (!authService.isAuthenticated()) {
      throw new Error('User not authenticated. Please login first.');
    }
  }

  // =====================================
  // PROFILE MANAGEMENT
  // =====================================

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentProfile() {
    try {
      this.ensureAuthenticated();
      console.log('👤 Fetching current user profile');

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.PROFILE}`
      );

      console.log('✅ Profile fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} clientId - Client ID
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(clientId, profileData) {
    try {
      this.ensureAuthenticated();
      console.log('📝 Updating profile for client:', clientId);

      const response = await httpClient.put(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.UPDATE_PROFILE(clientId)}`,
        profileData
      );

      console.log('✅ Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Unlock user account
   * @param {string} clientId - Client ID to unlock
   * @returns {Promise<Object>} Unlock response
   */
  async unlockUser(clientId) {
    try {
      this.ensureAuthenticated();
      console.log('🔓 Unlocking user account:', clientId);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.UNLOCK(clientId)}`,
        {}
      );

      console.log('✅ User account unlocked successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to unlock user:', error);
      throw error;
    }
  }

  // =====================================
  // USER SEARCH AND MANAGEMENT
  // =====================================

  /**
   * Search users with filters
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.query - Search query
   * @param {number} searchParams.page - Page number (default: 0)
   * @param {number} searchParams.size - Page size (default: 20)
   * @param {string} searchParams.status - User status filter
   * @param {string} searchParams.role - User role filter
   * @returns {Promise<Object>} Paginated user search results
   */
  async searchUsers(searchParams = {}) {
    try {
      this.ensureAuthenticated();
      console.log('🔍 Searching users with params:', searchParams);

      const {
        query = '',
        page = 0,
        size = 20,
        status,
        role,
        sortBy = 'createdAt',
        sortDirection = 'desc'
      } = searchParams;

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection
      });

      if (query) queryParams.append('query', query);
      if (status) queryParams.append('status', status);
      if (role) queryParams.append('role', role);

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.SEARCH}?${queryParams}`
      );

      console.log(`✅ Found ${response.data.totalElements} users`);
      return response.data;
    } catch (error) {
      console.error('❌ User search failed:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics() {
    try {
      this.ensureAuthenticated();
      console.log('📊 Fetching user statistics');

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.STATISTICS}`
      );

      console.log('✅ User statistics fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user statistics:', error);
      throw error;
    }
  }

  // =====================================
  // FINANCIAL OPERATIONS
  // =====================================

  /**
   * Get user account balance
   * @param {string} clientId - Client ID (optional, uses current user if not provided)
   * @returns {Promise<number>} Account balance
   */
  async getBalance(clientId) {
    try {
      this.ensureAuthenticated();
      
      const targetClientId = clientId || authService.getCurrentUser()?.idClient;
      if (!targetClientId) {
        throw new Error('No client ID available');
      }

      console.log('💰 Fetching balance for client:', targetClientId);

      const queryParams = new URLSearchParams({ clientId: targetClientId });
      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.BALANCE}?${queryParams}`
      );

      const balance = response.data?.balance || 0;
      console.log(`✅ Balance fetched: ${balance} FCFA`);
      return balance;
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
      throw error;
    }
  }

  /**
   * Get user transaction history
   * @param {Object} params - Transaction parameters
   * @param {string} params.clientId - Client ID
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @param {string} params.type - Transaction type filter
   * @param {string} params.startDate - Start date filter
   * @param {string} params.endDate - End date filter
   * @returns {Promise<Object>} Paginated transaction history
   */
  async getTransactions(params = {}) {
    try {
      this.ensureAuthenticated();
      
      const {
        clientId = authService.getCurrentUser()?.idClient,
        page = 0,
        size = 20,
        type,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortDirection = 'desc'
      } = params;

      if (!clientId) {
        throw new Error('No client ID available');
      }

      console.log('📋 Fetching transactions for client:', clientId);

      // Build query parameters
      const queryParams = new URLSearchParams({
        clientId,
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection
      });

      if (type) queryParams.append('type', type);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.TRANSACTIONS}?${queryParams}`
      );

      console.log(`✅ Fetched ${response.data.content?.length || 0} transactions`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
      throw error;
    }
  }

  /**
   * Perform deposit operation
   * @param {Object} depositData - Deposit information
   * @param {string} depositData.payer - Payer phone number
   * @param {number} depositData.amount - Deposit amount
   * @param {string} depositData.description - Transaction description
   * @returns {Promise<Object>} Deposit response
   */
  async deposit(depositData) {
    try {
      this.ensureAuthenticated();
      
      const { payer, amount, description } = depositData;
      
      // Validate deposit data
      if (!payer || !amount || amount <= 0) {
        throw new Error('Invalid deposit data');
      }

      if (amount < 100) {
        throw new Error('Le montant minimum pour un dépôt est de 100 FCFA');
      }

      if (amount > 10000000) {
        throw new Error('Le montant maximum pour un dépôt est de 10,000,000 FCFA');
      }

      console.log(`💸 Processing deposit: ${amount} FCFA from ${payer}`);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.DEPOSIT}`,
        {
          payer,
          amount,
          description: description || 'Dépôt sur compte',
          externalId: '',
          callback: ''
        }
      );

      console.log('✅ Deposit processed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      throw error;
    }
  }

  /**
   * Perform withdrawal operation
   * @param {Object} withdrawalData - Withdrawal information
   * @param {string} withdrawalData.payee - Payee phone number
   * @param {number} withdrawalData.amount - Withdrawal amount
   * @param {string} withdrawalData.description - Transaction description
   * @returns {Promise<Object>} Withdrawal response
   */
  async withdrawal(withdrawalData) {
    try {
      this.ensureAuthenticated();
      
      const { payee, amount, description } = withdrawalData;
      
      // Validate withdrawal data
      if (!payee || !amount || amount <= 0) {
        throw new Error('Invalid withdrawal data');
      }

      if (amount < 100) {
        throw new Error('Le montant minimum pour un retrait est de 100 FCFA');
      }

      console.log(`💸 Processing withdrawal: ${amount} FCFA to ${payee}`);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.WITHDRAWAL}`,
        {
          payee,
          amount,
          description: description || 'Retrait de compte',
          externalId: '',
          callback: ''
        }
      );

      console.log('✅ Withdrawal processed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      throw error;
    }
  }

  /**
   * Perform transfer operation
   * @param {Object} transferData - Transfer information
   * @param {string} transferData.receiverClientId - Receiver client ID
   * @param {number} transferData.amount - Transfer amount
   * @param {string} transferData.description - Transaction description
   * @returns {Promise<Object>} Transfer response
   */
  async transfer(transferData) {
    try {
      this.ensureAuthenticated();
      
      const { receiverClientId, amount, description } = transferData;
      const senderClientId = authService.getCurrentUser()?.idClient;
      
      // Validate transfer data
      if (!senderClientId || !receiverClientId || !amount || amount <= 0) {
        throw new Error('Invalid transfer data');
      }

      if (senderClientId === receiverClientId) {
        throw new Error('Impossible de transférer vers le même compte');
      }

      if (amount < 100) {
        throw new Error('Le montant minimum pour un transfert est de 100 FCFA');
      }

      console.log(`💸 Processing transfer: ${amount} FCFA to ${receiverClientId}`);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.USER_SERVICE.TRANSFER}`,
        {
          senderClientId,
          receiverClientId,
          amount,
          description: description || 'Transfert entre comptes'
        }
      );

      console.log('✅ Transfer processed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      throw error;
    }
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  /**
   * Format currency amount
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('XAF', 'FCFA');
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} Validation result
   */
  validatePhoneNumber(phoneNumber) {
    // Cameroon phone number validation
    const phoneRegex = /^(\+237|237)?[6-9]\d{8}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * Get transaction type display name
   * @param {string} type - Transaction type
   * @returns {string} Display name
   */
  getTransactionTypeDisplay(type) {
    const typeMap = {
      'DEPOSIT': 'Dépôt',
      'WITHDRAWAL': 'Retrait',
      'TRANSFER': 'Transfert',
      'PAYMENT': 'Paiement'
    };
    return typeMap[type] || type;
  }

  /**
   * Get transaction status display
   * @param {string} status - Transaction status
   * @returns {Object} Status display info
   */
  getTransactionStatusDisplay(status) {
    const statusMap = {
      'PENDING': { label: 'En attente', color: 'yellow', icon: 'clock' },
      'COMPLETED': { label: 'Terminé', color: 'green', icon: 'check' },
      'FAILED': { label: 'Échoué', color: 'red', icon: 'x' },
      'CANCELLED': { label: 'Annulé', color: 'gray', icon: 'minus' }
    };
    return statusMap[status] || { label: status, color: 'gray', icon: 'help' };
  }
}

// Create and export singleton instance
const userService = new UserService();
export default userService;