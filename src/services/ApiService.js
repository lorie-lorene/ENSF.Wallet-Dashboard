/**
 * 🔗 Complete API Service for Admin Dashboard
 * 
 * This service handles ALL backend integrations for:
 * - UserService: Authentication, user management, financial operations
 * - AgenceService: All controllers (Admin, Agence, DocumentApproval, Auth)
 * 
 * Features:
 * - Professional error handling with retry mechanisms
 * - JWT token management
 * - Request/response logging
 * - Environment-based configuration
 * - Type-safe API responses
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
          adminCreateUser: '/api/v1/agence/admin/users',
          adminUpdateUser: (userId) => `/api/v1/agence/admin/users/${userId}`,
          adminBlockUser: (userId) => `/api/v1/agence/admin/users/${userId}/block`,
          adminUnblockUser: (userId) => `/api/v1/agence/admin/users/${userId}/unblock`,
          
          // Document Approval endpoints
          pendingDocuments: '/api/v1/agence/admin/documents/pending',
          documentReview: (documentId) => `/api/v1/agence/admin/documents/${documentId}/review`,
          approveDocument: (documentId) => `/api/v1/agence/admin/documents/${documentId}/approve`,
          rejectDocument: (documentId) => `/api/v1/agence/admin/documents/${documentId}/reject`,
          documentStatistics: '/api/v1/agence/admin/documents/statistics',
          bulkApproveDocuments: '/api/v1/agence/admin/documents/bulk-approve',
          bulkRejectDocuments: '/api/v1/agence/admin/documents/bulk-reject',
          
          // Agence Management endpoints
          agenceAccounts: (idAgence) => `/api/v1/agence/${idAgence}/comptes`,
          findAccount: (numeroCompte) => `/api/v1/agence/comptes/${numeroCompte}`,
          accountBalance: (numeroCompte) => `/api/v1/agence/comptes/${numeroCompte}/solde`,
          accountHistory: (numeroCompte) => `/api/v1/agence/comptes/${numeroCompte}/transactions`,
          searchAccounts: (idAgence) => `/api/v1/agence/${idAgence}/comptes/search`,
          
          // Transaction endpoints
          processTransaction: '/api/v1/agence/transactions',
          estimateTransactionFees: '/api/v1/agence/transactions/estimate-frais',
          
          // Account Management endpoints
          activateAccount: (numeroCompte) => `/api/v1/agence/comptes/${numeroCompte}/activate`,
          suspendAccount: (numeroCompte) => `/api/v1/agence/comptes/${numeroCompte}/suspend`,
          
          // KYC endpoints
          validateKYC: '/api/v1/agence/kyc/validate',
          kycReport: (idClient) => `/api/v1/agence/kyc/${idClient}/report`,
          
          // Statistics endpoints
          agenceStatistics: (idAgence) => `/api/v1/agence/${idAgence}/statistics`,
          agenceInfo: (idAgence) => `/api/v1/agence/${idAgence}/info`,
          
          // Configuration endpoints
          fraisConfiguration: '/api/v1/agence/config/frais',
          
          // Health check
          health: '/api/v1/agence/health'
        }
      }
    };

    // Request interceptors and default settings
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Token management
    this.tokenKey = 'authToken';
    this.refreshTokenKey = 'refreshToken';
  }

  // =====================================
  // AUTHENTICATION & TOKEN MANAGEMENT
  // =====================================

  /**
   * Get current authentication token
   */
  getAuthToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken, refreshToken = null) {
    localStorage.setItem(this.tokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      ...this.defaultHeaders,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // =====================================
  // CORE HTTP METHODS
  // =====================================

  /**
   * Generic API call with error handling and retry mechanism
   */
  async makeRequest(url, options = {}) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔗 API Request [Attempt ${attempt}]:`, {
          method: options.method || 'GET',
          url,
          headers: options.headers
        });

        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers
          }
        });

        // Handle different HTTP status codes
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshAuthToken();
          if (refreshed && attempt < maxRetries) {
            continue; // Retry with new token
          } else {
            this.clearTokens();
            throw new Error('UNAUTHORIZED');
          }
        }

        if (response.status === 403) {
          throw new Error('FORBIDDEN');
        }

        if (response.status === 404) {
          throw new Error('NOT_FOUND');
        }

        if (response.status >= 500) {
          throw new Error('SERVER_ERROR');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        
        console.log(`✅ API Response [${response.status}]:`, data);
        
        return {
          success: true,
          data,
          status: response.status
        };

      } catch (error) {
        lastError = error;
        console.error(`❌ API Error [Attempt ${attempt}]:`, error.message);

        // Don't retry certain errors
        if (error.message === 'FORBIDDEN' || error.message === 'NOT_FOUND') {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return {
      success: false,
      error: lastError.message,
      status: 0
    };
  }

  /**
   * Refresh authentication token
   */
  async refreshAuthToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(
        `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.refresh}`,
        {
          method: 'POST',
          headers: this.defaultHeaders,
          body: JSON.stringify({ refreshToken })
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // =====================================
  // USER SERVICE INTEGRATION
  // =====================================

  /**
   * User authentication
   */
  async loginUser(credentials) {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.login}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  /**
   * User registration
   */
  async registerUser(userData) {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.register}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  /**
   * Check registration status
   */
  async checkRegistrationStatus(email) {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.registrationStatus}?email=${encodeURIComponent(email)}`;
    return this.makeRequest(url);
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.profile}`;
    return this.makeRequest(url);
  }

  /**
   * Search clients (Admin only)
   */
  async searchClients(searchTerm, page = 0, size = 20) {
    const params = new URLSearchParams({
      searchTerm,
      page: page.toString(),
      size: size.toString()
    });
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.search}?${params}`;
    return this.makeRequest(url);
  }

  /**
   * Get user service statistics (Admin only)
   */
  async getUserServiceStatistics() {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.statistics}`;
    return this.makeRequest(url);
  }

  /**
   * Unlock user account (Admin only)
   */
  async unlockUserAccount(clientId) {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.unlock(clientId)}`;
    return this.makeRequest(url, { method: 'POST' });
  }

  /**
   * Financial operations
   */
  async makeDeposit(depositData) {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.deposit}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(depositData)
    });
  }

  async makeWithdrawal(withdrawalData) {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.withdrawal}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(withdrawalData)
    });
  }

  async makeTransfer(transferData) {
    const url = `${this.config.userService.baseUrl}${this.config.userService.endpoints.transfer}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(transferData)
    });
  }

  // =====================================
  // AGENCE SERVICE - ADMIN DASHBOARD
  // =====================================

  /**
   * Get admin dashboard overview
   */
  async getAdminDashboard() {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.dashboard}`;
    return this.makeRequest(url);
  }

  /**
   * Get system health status
   */
  async getSystemHealth() {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.dashboardHealth}`;
    return this.makeRequest(url);
  }

  /**
   * Get recent system activity
   */
  async getRecentActivity() {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.recentActivity}`;
    return this.makeRequest(url);
  }

  // =====================================
  // AGENCE SERVICE - USER MANAGEMENT
  // =====================================

  /**
   * Get users list with pagination and filters
   */
  async getUsers(page = 0, size = 20, status = null, search = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'createdAt,desc'
    });
    
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);

    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.adminUsers}?${params}`;
    return this.makeRequest(url);
  }

  /**
   * Get user details
   */
  async getUserDetails(userId) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.adminUserDetails(userId)}`;
    return this.makeRequest(url);
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.adminCreateUser}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  /**
   * Update user
   */
  async updateUser(userId, userData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.adminUpdateUser(userId)}`;
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  /**
   * Get user statistics
   */
  async getAgenceUserStatistics() {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.adminUserStatistics}`;
    return this.makeRequest(url);
  }

  /**
   * Block user
   */
  async blockUser(userId, reason) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.adminBlockUser(userId)}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Unblock user
   */
  async unblockUser(userId) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.adminUnblockUser(userId)}`;
    return this.makeRequest(url, { method: 'POST' });
  }

  // =====================================
  // AGENCE SERVICE - DOCUMENT APPROVAL
  // =====================================

  /**
   * Get pending documents for approval
   */
  async getPendingDocuments(page = 0, size = 20, agence = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'uploadedAt,desc'
    });
    
    if (agence) params.append('agence', agence);

    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.pendingDocuments}?${params}`;
    return this.makeRequest(url);
  }

  /**
   * Get document for review
   */
  async getDocumentForReview(documentId) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.documentReview(documentId)}`;
    return this.makeRequest(url);
  }

  /**
   * Approve document
   */
  async approveDocument(documentId, approvalData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.approveDocument(documentId)}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(approvalData)
    });
  }

  /**
   * Reject document
   */
  async rejectDocument(documentId, rejectionData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.rejectDocument(documentId)}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(rejectionData)
    });
  }

  /**
   * Get document approval statistics
   */
  async getDocumentStatistics() {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.documentStatistics}`;
    return this.makeRequest(url);
  }

  /**
   * Bulk approve documents
   */
  async bulkApproveDocuments(documentIds, approvalData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.bulkApproveDocuments}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ documentIds, ...approvalData })
    });
  }

  /**
   * Bulk reject documents
   */
  async bulkRejectDocuments(documentIds, rejectionData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.bulkRejectDocuments}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify({ documentIds, ...rejectionData })
    });
  }

  // =====================================
  // AGENCE SERVICE - ACCOUNT MANAGEMENT
  // =====================================

  /**
   * Get agency accounts
   */
  async getAgencyAccounts(idAgence, limit = 50) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.agenceAccounts(idAgence)}?limit=${limit}`;
    return this.makeRequest(url);
  }

  /**
   * Find account by number
   */
  async findAccount(numeroCompte) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.findAccount(numeroCompte)}`;
    return this.makeRequest(url);
  }

  /**
   * Get account balance
   */
  async getAccountBalance(numeroCompte) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.accountBalance(numeroCompte)}`;
    return this.makeRequest(url);
  }

  /**
   * Get account transaction history
   */
  async getAccountHistory(numeroCompte, limit = 20) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.accountHistory(numeroCompte)}?limit=${limit}`;
    return this.makeRequest(url);
  }

  /**
   * Search accounts with filters
   */
  async searchAccounts(idAgence, filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.searchAccounts(idAgence)}?${params}`;
    return this.makeRequest(url);
  }

  /**
   * Activate account
   */
  async activateAccount(numeroCompte, activatedBy) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.activateAccount(numeroCompte)}`;
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify({ activatedBy })
    });
  }

  /**
   * Suspend account
   */
  async suspendAccount(numeroCompte, reason, suspendedBy) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.suspendAccount(numeroCompte)}`;
    return this.makeRequest(url, {
      method: 'PUT',
      body: JSON.stringify({ reason, suspendedBy })
    });
  }

  // =====================================
  // AGENCE SERVICE - TRANSACTIONS
  // =====================================

  /**
   * Process transaction
   */
  async processTransaction(transactionData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.processTransaction}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  /**
   * Estimate transaction fees
   */
  async estimateTransactionFees(transactionData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.estimateTransactionFees}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  // =====================================
  // AGENCE SERVICE - KYC MANAGEMENT
  // =====================================

  /**
   * Validate KYC documents
   */
  async validateKYC(kycData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.validateKYC}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(kycData)
    });
  }

  /**
   * Generate KYC report
   */
  async generateKYCReport(idClient) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.kycReport(idClient)}`;
    return this.makeRequest(url);
  }

  // =====================================
  // AGENCE SERVICE - STATISTICS & INFO
  // =====================================

  /**
   * Get agency statistics
   */
  async getAgencyStatistics(idAgence) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.agenceStatistics(idAgence)}`;
    return this.makeRequest(url);
  }

  /**
   * Get agency information
   */
  async getAgencyInfo(idAgence) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.agenceInfo(idAgence)}`;
    return this.makeRequest(url);
  }

  /**
   * Get fees configuration
   */
  async getFeesConfiguration() {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.fraisConfiguration}`;
    return this.makeRequest(url);
  }

  // =====================================
  // AUTHENTICATION FOR AGENCE SERVICE
  // =====================================

  /**
   * Login to AgenceService
   */
  async loginAgenceService(credentials) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.login}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: this.defaultHeaders // Don't include auth headers for login
    });
  }

  /**
   * Logout from AgenceService
   */
  async logoutAgenceService() {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.logout}`;
    const result = await this.makeRequest(url, { method: 'POST' });
    
    if (result.success) {
      this.clearTokens();
    }
    
    return result;
  }

  /**
   * Change password in AgenceService
   */
  async changePassword(passwordData) {
    const url = `${this.config.agenceService.baseUrl}${this.config.agenceService.endpoints.changePassword}`;
    return this.makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  /**
   * Get current user role from token (if implemented)
   */
  getUserRole() {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      // Decode JWT token to get user role
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles || payload.role || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Format API errors for display
   */
  formatError(error) {
    const errorMessages = {
      'UNAUTHORIZED': 'Session expirée. Veuillez vous reconnecter.',
      'FORBIDDEN': 'Accès non autorisé.',
      'NOT_FOUND': 'Ressource introuvable.',
      'SERVER_ERROR': 'Erreur serveur. Veuillez réessayer plus tard.',
      'Network Error': 'Erreur de connexion. Vérifiez votre connexion internet.'
    };

    return errorMessages[error] || error || 'Une erreur inattendue s\'est produite.';
  }
}

// Export singleton instance
export default new ApiService();