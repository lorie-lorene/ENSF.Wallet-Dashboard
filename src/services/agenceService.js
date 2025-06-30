/**
 * 🏦 Agence Management Service
 * 
 * Handles all agence-related operations:
 * - Admin dashboard data and analytics
 * - User management and administration
 * - Document approval workflow
 * - System health monitoring
 * - Agency statistics and reporting
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import httpClient from './httpClient.js';
import authService from './authService.js';
import { BASE_URLS, ENDPOINTS } from '../config/apiConfig.js';

/**
 * Agence Service Class
 * Manages all agence-related API operations
 */
class AgenceService {
  constructor() {
    this.baseUrl = BASE_URLS.AGENCE_SERVICE;
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
  // ADMIN DASHBOARD OPERATIONS
  // =====================================

  /**
   * Get comprehensive dashboard data
   * @returns {Promise<Object>} Dashboard data including statistics and metrics
   */
  async getDashboardData() {
    try {
      this.ensureAuthenticated();
      console.log('📊 Fetching admin dashboard data');

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.ADMIN.DASHBOARD}`
      );

      console.log('✅ Dashboard data fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get system health status
   * @returns {Promise<Object>} System health metrics
   */
  async getSystemHealth() {
    try {
      this.ensureAuthenticated();
      console.log('🏥 Fetching system health status');

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.ADMIN.DASHBOARD_HEALTH}`
      );

      console.log('✅ System health data fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch system health:', error);
      throw error;
    }
  }

  /**
   * Get recent activity feed
   * @param {Object} params - Activity parameters
   * @param {number} params.limit - Number of activities to fetch
   * @param {string} params.type - Activity type filter
   * @returns {Promise<Object>} Recent activities
   */
  async getRecentActivity(params = {}) {
    try {
      this.ensureAuthenticated();
      console.log('🕐 Fetching recent activity');

      const { limit = 50, type } = params;
      const queryParams = new URLSearchParams({ limit: limit.toString() });
      
      if (type) queryParams.append('type', type);

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.ADMIN.RECENT_ACTIVITY}?${queryParams}`
      );

      console.log(`✅ Fetched ${response.data.length} recent activities`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch recent activity:', error);
      throw error;
    }
  }

  // =====================================
  // USER MANAGEMENT OPERATIONS
  // =====================================

  /**
   * Get paginated list of users
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @param {string} params.search - Search query
   * @param {string} params.status - Status filter
   * @param {string} params.role - Role filter
   * @returns {Promise<Object>} Paginated user list
   */
  async getUsers(params = {}) {
    try {
      this.ensureAuthenticated();
      console.log('👥 Fetching users list');

      const {
        page = 0,
        size = 20,
        search,
        status,
        role,
        sortBy = 'createdAt',
        sortDirection = 'desc'
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection
      });

      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);
      if (role) queryParams.append('role', role);

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.USERS.LIST}?${queryParams}`
      );

      console.log(`✅ Fetched ${response.data.content?.length || 0} users`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  }

  /**
   * Get detailed user information
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User details
   */
  async getUserDetails(userId) {
    try {
      this.ensureAuthenticated();
      console.log('👤 Fetching user details for:', userId);

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.USERS.DETAILS(userId)}`
      );

      console.log('✅ User details fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user details:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics and metrics
   */
  async getUserStatistics() {
    try {
      this.ensureAuthenticated();
      console.log('📈 Fetching user statistics');

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.USERS.STATISTICS}`
      );

      console.log('✅ User statistics fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user statistics:', error);
      throw error;
    }
  }

  /**
   * Export users data
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (csv, excel)
   * @param {Array} params.fields - Fields to export
   * @param {Object} params.filters - Export filters
   * @returns {Promise<Blob>} Export file
   */
  async exportUsers(params = {}) {
    try {
      this.ensureAuthenticated();
      console.log('📤 Exporting users data');

      const { format = 'csv', fields, filters } = params;
      
      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.USERS.EXPORT}`,
        {
          format,
          fields,
          filters
        },
        {
          responseType: 'blob'
        }
      );

      console.log('✅ Users data exported successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to export users:', error);
      throw error;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User creation data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      this.ensureAuthenticated();
      console.log('➕ Creating new user:', userData.email);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.USERS.CREATE}`,
        userData
      );

      console.log('✅ User created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   * @param {string} userId - User ID
   * @param {Object} updateData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    try {
      this.ensureAuthenticated();
      console.log('📝 Updating user:', userId);

      const response = await httpClient.put(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.USERS.UPDATE(userId)}`,
        updateData
      );

      console.log('✅ User updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Block user account
   * @param {string} userId - User ID to block
   * @param {string} reason - Reason for blocking
   * @returns {Promise<Object>} Block response
   */
  async blockUser(userId, reason) {
    try {
      this.ensureAuthenticated();
      console.log('🚫 Blocking user:', userId);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.USERS.BLOCK(userId)}`,
        { reason }
      );

      console.log('✅ User blocked successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to block user:', error);
      throw error;
    }
  }

  /**
   * Unblock user account
   * @param {string} userId - User ID to unblock
   * @returns {Promise<Object>} Unblock response
   */
  async unblockUser(userId) {
    try {
      this.ensureAuthenticated();
      console.log('✅ Unblocking user:', userId);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.USERS.UNBLOCK(userId)}`,
        {}
      );

      console.log('✅ User unblocked successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to unblock user:', error);
      throw error;
    }
  }

  // =====================================
  // DOCUMENT APPROVAL OPERATIONS
  // =====================================

  /**
   * Get pending documents for approval
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @param {string} params.type - Document type filter
   * @param {string} params.priority - Priority filter
   * @returns {Promise<Object>} Paginated pending documents
   */
  async getPendingDocuments(params = {}) {
    try {
      this.ensureAuthenticated();
      console.log('📋 Fetching pending documents');

      const {
        page = 0,
        size = 20,
        type,
        priority,
        sortBy = 'submissionDate',
        sortDirection = 'desc'
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection
      });

      if (type) queryParams.append('type', type);
      if (priority) queryParams.append('priority', priority);

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.DOCUMENTS.PENDING}?${queryParams}`
      );

      console.log(`✅ Fetched ${response.data.content?.length || 0} pending documents`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch pending documents:', error);
      throw error;
    }
  }

  /**
   * Get document details for review
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document details
   */
  async getDocumentForReview(documentId) {
    try {
      this.ensureAuthenticated();
      console.log('📄 Fetching document for review:', documentId);

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.DOCUMENTS.REVIEW(documentId)}`
      );

      console.log('✅ Document details fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch document details:', error);
      throw error;
    }
  }

  /**
   * Approve document
   * @param {string} documentId - Document ID
   * @param {Object} approvalData - Approval data
   * @param {string} approvalData.comments - Approval comments
   * @param {Array} approvalData.conditions - Approval conditions
   * @returns {Promise<Object>} Approval response
   */
  async approveDocument(documentId, approvalData = {}) {
    try {
      this.ensureAuthenticated();
      console.log('✅ Approving document:', documentId);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.DOCUMENTS.APPROVE(documentId)}`,
        {
          comments: approvalData.comments || '',
          conditions: approvalData.conditions || [],
          approvedBy: authService.getCurrentUser()?.id,
          approvalDate: new Date().toISOString()
        }
      );

      console.log('✅ Document approved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to approve document:', error);
      throw error;
    }
  }

  /**
   * Reject document
   * @param {string} documentId - Document ID
   * @param {Object} rejectionData - Rejection data
   * @param {string} rejectionData.reason - Rejection reason
   * @param {string} rejectionData.comments - Additional comments
   * @returns {Promise<Object>} Rejection response
   */
  async rejectDocument(documentId, rejectionData) {
    try {
      this.ensureAuthenticated();
      console.log('❌ Rejecting document:', documentId);

      const { reason, comments } = rejectionData;
      
      if (!reason) {
        throw new Error('Rejection reason is required');
      }

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.DOCUMENTS.REJECT(documentId)}`,
        {
          reason,
          comments: comments || '',
          rejectedBy: authService.getCurrentUser()?.id,
          rejectionDate: new Date().toISOString()
        }
      );

      console.log('✅ Document rejected successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to reject document:', error);
      throw error;
    }
  }

  /**
   * Get document approval statistics
   * @param {Object} params - Statistics parameters
   * @param {string} params.period - Time period (daily, weekly, monthly)
   * @param {string} params.startDate - Start date
   * @param {string} params.endDate - End date
   * @returns {Promise<Object>} Document statistics
   */
  async getDocumentStatistics(params = {}) {
    try {
      this.ensureAuthenticated();
      console.log('📊 Fetching document statistics');

      const { period = 'monthly', startDate, endDate } = params;
      const queryParams = new URLSearchParams({ period });
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await httpClient.get(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.DOCUMENTS.STATISTICS}?${queryParams}`
      );

      console.log('✅ Document statistics fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch document statistics:', error);
      throw error;
    }
  }

  /**
   * Bulk approve documents
   * @param {Array} documentIds - Array of document IDs
   * @param {Object} approvalData - Bulk approval data
   * @returns {Promise<Object>} Bulk approval response
   */
  async bulkApproveDocuments(documentIds, approvalData = {}) {
    try {
      this.ensureAuthenticated();
      console.log(`✅ Bulk approving ${documentIds.length} documents`);

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.DOCUMENTS.BULK_APPROVE}`,
        {
          documentIds,
          comments: approvalData.comments || '',
          approvedBy: authService.getCurrentUser()?.id,
          approvalDate: new Date().toISOString()
        }
      );

      console.log('✅ Documents bulk approved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to bulk approve documents:', error);
      throw error;
    }
  }

  /**
   * Bulk reject documents
   * @param {Array} documentIds - Array of document IDs
   * @param {Object} rejectionData - Bulk rejection data
   * @returns {Promise<Object>} Bulk rejection response
   */
  async bulkRejectDocuments(documentIds, rejectionData) {
    try {
      this.ensureAuthenticated();
      console.log(`❌ Bulk rejecting ${documentIds.length} documents`);

      const { reason, comments } = rejectionData;
      
      if (!reason) {
        throw new Error('Rejection reason is required');
      }

      const response = await httpClient.post(
        `${this.baseUrl}${ENDPOINTS.AGENCE_SERVICE.DOCUMENTS.BULK_REJECT}`,
        {
          documentIds,
          reason,
          comments: comments || '',
          rejectedBy: authService.getCurrentUser()?.id,
          rejectionDate: new Date().toISOString()
        }
      );

      console.log('✅ Documents bulk rejected successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to bulk reject documents:', error);
      throw error;
    }
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date string
   */
  formatDate(date, options = {}) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Douala'
    };
    
    return new Intl.DateTimeFormat('fr-FR', { ...defaultOptions, ...options })
      .format(dateObj);
  }

  /**
   * Get user status display
   * @param {string} status - User status
   * @returns {Object} Status display info
   */
  getUserStatusDisplay(status) {
    const statusMap = {
      'ACTIVE': { label: 'Actif', color: 'green', icon: 'check-circle' },
      'INACTIVE': { label: 'Inactif', color: 'gray', icon: 'minus-circle' },
      'BLOCKED': { label: 'Bloqué', color: 'red', icon: 'x-circle' },
      'PENDING': { label: 'En attente', color: 'yellow', icon: 'clock' },
      'SUSPENDED': { label: 'Suspendu', color: 'orange', icon: 'pause-circle' }
    };
    return statusMap[status] || { label: status, color: 'gray', icon: 'help-circle' };
  }

  /**
   * Get document type display
   * @param {string} type - Document type
   * @returns {Object} Type display info
   */
  getDocumentTypeDisplay(type) {
    const typeMap = {
      'ID_CARD': { label: 'Carte d\'identité', icon: 'id-card' },
      'PASSPORT': { label: 'Passeport', icon: 'book-open' },
      'PROOF_OF_ADDRESS': { label: 'Justificatif de domicile', icon: 'home' },
      'BANK_STATEMENT': { label: 'Relevé bancaire', icon: 'file-text' },
      'PAYSLIP': { label: 'Bulletin de paie', icon: 'dollar-sign' },
      'BUSINESS_LICENSE': { label: 'Licence commerciale', icon: 'briefcase' }
    };
    return typeMap[type] || { label: type, icon: 'file' };
  }

  /**
   * Get document priority display
   * @param {string} priority - Document priority
   * @returns {Object} Priority display info
   */
  getDocumentPriorityDisplay(priority) {
    const priorityMap = {
      'LOW': { label: 'Faible', color: 'green', order: 1 },
      'MEDIUM': { label: 'Moyen', color: 'yellow', order: 2 },
      'HIGH': { label: 'Élevé', color: 'orange', order: 3 },
      'URGENT': { label: 'Urgent', color: 'red', order: 4 }
    };
    return priorityMap[priority] || { label: priority, color: 'gray', order: 0 };
  }

  /**
   * Calculate percentage change
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {Object} Percentage change info
   */
  calculatePercentageChange(current, previous) {
    if (previous === 0) {
      return { percentage: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'neutral' };
    }
    
    const percentage = ((current - previous) / previous) * 100;
    const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    
    return {
      percentage: Math.abs(percentage),
      trend,
      formatted: `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`
    };
  }

  /**
   * Generate dashboard summary
   * @param {Object} dashboardData - Raw dashboard data
   * @returns {Object} Processed dashboard summary
   */
  generateDashboardSummary(dashboardData) {
    const summary = {
      totalUsers: dashboardData.userStats?.total || 0,
      activeUsers: dashboardData.userStats?.active || 0,
      pendingDocuments: dashboardData.documentStats?.pending || 0,
      totalTransactions: dashboardData.transactionStats?.total || 0,
      systemHealth: dashboardData.systemHealth?.overall || 'unknown'
    };

    // Calculate growth rates
    if (dashboardData.previousPeriod) {
      summary.userGrowth = this.calculatePercentageChange(
        summary.totalUsers, 
        dashboardData.previousPeriod.totalUsers || 0
      );
      
      summary.transactionGrowth = this.calculatePercentageChange(
        summary.totalTransactions,
        dashboardData.previousPeriod.totalTransactions || 0
      );
    }

    return summary;
  }
}

// Create and export singleton instance
const agenceService = new AgenceService();
export default agenceService;