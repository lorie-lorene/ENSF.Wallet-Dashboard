/**
 * ⚡ Dashboard Actions Hook
 * 
 * Centralized action handlers for dashboard operations:
 * - Document approval/rejection workflows
 * - User management actions
 * - Bulk operations
 * - Data export and import
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useCallback } from 'react';
import ApiService from '../services/ApiService';

/**
 * Dashboard actions hook
 * @param {Object} params - Hook parameters
 * @param {Function} params.refreshData - Function to refresh dashboard data
 * @param {Function} params.openModal - Function to open modals
 * @param {Function} params.closeModal - Function to close modals
 * @param {Function} params.clearSelection - Function to clear selections
 * @returns {Object} Action handlers
 */
export const useDashboardActions = ({
  refreshData,
  openModal,
  closeModal,
  clearSelection
}) => {

  // =====================================
  // DOCUMENT APPROVAL ACTIONS
  // =====================================

  /**
   * Handle document approval
   * @param {string} documentId - Document ID
   * @param {Object} approvalData - Approval data
   */
  const handleDocumentApproval = useCallback(async (documentId, approvalData = {}) => {
    try {
      console.log('✅ Approving document:', documentId);

      const response = await ApiService.agence.approveDocument(documentId, approvalData);
      
      // Refresh documents data
      await refreshData('documents');
      
      // Close review modal if open
      closeModal('documentReview');
      
      // Show success notification
      console.log('✅ Document approved successfully');
      
      return response;
    } catch (error) {
      console.error('❌ Document approval failed:', error);
      throw error;
    }
  }, [refreshData, closeModal]);

  /**
   * Handle document rejection
   * @param {string} documentId - Document ID
   * @param {Object} rejectionData - Rejection data
   */
  const handleDocumentRejection = useCallback(async (documentId, rejectionData) => {
    try {
      console.log('❌ Rejecting document:', documentId);

      if (!rejectionData.reason) {
        throw new Error('Rejection reason is required');
      }

      const response = await ApiService.agence.rejectDocument(documentId, rejectionData);
      
      // Refresh documents data
      await refreshData('documents');
      
      // Close review modal if open
      closeModal('documentReview');
      
      // Show success notification
      console.log('✅ Document rejected successfully');
      
      return response;
    } catch (error) {
      console.error('❌ Document rejection failed:', error);
      throw error;
    }
  }, [refreshData, closeModal]);

  /**
   * Handle bulk document approval
   * @param {Array} documentIds - Array of document IDs
   * @param {Object} approvalData - Bulk approval data
   */
  const handleBulkDocumentApproval = useCallback(async (documentIds, approvalData = {}) => {
    try {
      console.log(`✅ Bulk approving ${documentIds.length} documents`);

      const response = await ApiService.agence.bulkApproveDocuments(documentIds, approvalData);
      
      // Refresh documents data
      await refreshData('documents');
      
      // Clear selection
      clearSelection('documents');
      
      // Close bulk actions modal
      closeModal('bulkActions');
      
      console.log('✅ Bulk approval completed successfully');
      
      return response;
    } catch (error) {
      console.error('❌ Bulk document approval failed:', error);
      throw error;
    }
  }, [refreshData, clearSelection, closeModal]);

  /**
   * Handle bulk document rejection
   * @param {Array} documentIds - Array of document IDs
   * @param {Object} rejectionData - Bulk rejection data
   */
  const handleBulkDocumentRejection = useCallback(async (documentIds, rejectionData) => {
    try {
      console.log(`❌ Bulk rejecting ${documentIds.length} documents`);

      if (!rejectionData.reason) {
        throw new Error('Rejection reason is required');
      }

      const response = await ApiService.agence.bulkRejectDocuments(documentIds, rejectionData);
      
      // Refresh documents data
      await refreshData('documents');
      
      // Clear selection
      clearSelection('documents');
      
      // Close bulk actions modal
      closeModal('bulkActions');
      
      console.log('✅ Bulk rejection completed successfully');
      
      return response;
    } catch (error) {
      console.error('❌ Bulk document rejection failed:', error);
      throw error;
    }
  }, [refreshData, clearSelection, closeModal]);

  // =====================================
  // USER MANAGEMENT ACTIONS
  // =====================================

  /**
   * Handle user creation
   * @param {Object} userData - User data
   */
  const handleUserCreation = useCallback(async (userData) => {
    try {
      console.log('➕ Creating new user:', userData.email);

      const response = await ApiService.agence.createUser(userData);
      
      // Refresh users data
      await refreshData('users');
      
      // Close create user modal
      closeModal('createUser');
      
      console.log('✅ User created successfully');
      
      return response;
    } catch (error) {
      console.error('❌ User creation failed:', error);
      throw error;
    }
  }, [refreshData, closeModal]);

  /**
   * Handle user update
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   */
  const handleUserUpdate = useCallback(async (userId, updateData) => {
    try {
      console.log('📝 Updating user:', userId);

      const response = await ApiService.agence.updateUser(userId, updateData);
      
      // Refresh users data
      await refreshData('users');
      
      // Close user details modal
      closeModal('userDetails');
      
      console.log('✅ User updated successfully');
      
      return response;
    } catch (error) {
      console.error('❌ User update failed:', error);
      throw error;
    }
  }, [refreshData, closeModal]);

  /**
   * Handle user blocking
   * @param {string} userId - User ID
   * @param {string} reason - Blocking reason
   */
  const handleUserBlocking = useCallback(async (userId, reason) => {
    try {
      console.log('🚫 Blocking user:', userId);

      const response = await ApiService.agence.blockUser(userId, reason);
      
      // Refresh users data
      await refreshData('users');
      
      console.log('✅ User blocked successfully');
      
      return response;
    } catch (error) {
      console.error('❌ User blocking failed:', error);
      throw error;
    }
  }, [refreshData]);

  /**
   * Handle user unblocking
   * @param {string} userId - User ID
   */
  const handleUserUnblocking = useCallback(async (userId) => {
    try {
      console.log('✅ Unblocking user:', userId);

      const response = await ApiService.agence.unblockUser(userId);
      
      // Refresh users data
      await refreshData('users');
      
      console.log('✅ User unblocked successfully');
      
      return response;
    } catch (error) {
      console.error('❌ User unblocking failed:', error);
      throw error;
    }
  }, [refreshData]);

  // =====================================
  // FINANCIAL OPERATIONS
  // =====================================

  /**
   * Handle deposit operation
   * @param {Object} depositData - Deposit data
   */
  const handleDeposit = useCallback(async (depositData) => {
    try {
      console.log('💸 Processing deposit:', depositData.amount);

      const response = await ApiService.performFinancialOperation('deposit', depositData);
      
      // Refresh relevant data
      await refreshData('dashboard');
      
      console.log('✅ Deposit completed successfully');
      
      return response;
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      throw error;
    }
  }, [refreshData]);

  /**
   * Handle withdrawal operation
   * @param {Object} withdrawalData - Withdrawal data
   */
  const handleWithdrawal = useCallback(async (withdrawalData) => {
    try {
      console.log('💸 Processing withdrawal:', withdrawalData.amount);

      const response = await ApiService.performFinancialOperation('withdrawal', withdrawalData);
      
      // Refresh relevant data
      await refreshData('dashboard');
      
      console.log('✅ Withdrawal completed successfully');
      
      return response;
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      throw error;
    }
  }, [refreshData]);

  /**
   * Handle transfer operation
   * @param {Object} transferData - Transfer data
   */
  const handleTransfer = useCallback(async (transferData) => {
    try {
      console.log('💸 Processing transfer:', transferData.amount);

      const response = await ApiService.performFinancialOperation('transfer', transferData);
      
      // Refresh relevant data
      await refreshData('dashboard');
      
      console.log('✅ Transfer completed successfully');
      
      return response;
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      throw error;
    }
  }, [refreshData]);

  // =====================================
  // DATA EXPORT ACTIONS
  // =====================================

  /**
   * Handle users data export
   * @param {Object} exportParams - Export parameters
   */
  const handleUsersExport = useCallback(async (exportParams = {}) => {
    try {
      console.log('📤 Exporting users data');

      const response = await ApiService.agence.exportUsers(exportParams);
      
      // Create download link
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.${exportParams.format || 'csv'}`;
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Users data exported successfully');
      
      return response;
    } catch (error) {
      console.error('❌ Users export failed:', error);
      throw error;
    }
  }, []);

  /**
   * Handle documents statistics export
   * @param {Object} exportParams - Export parameters
   */
  const handleDocumentsStatsExport = useCallback(async (exportParams = {}) => {
    try {
      console.log('📤 Exporting documents statistics');

      const stats = await ApiService.agence.getDocumentStatistics(exportParams);
      
      // Convert to CSV format
      const csvData = convertStatsToCSV(stats);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document_stats_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Document statistics exported successfully');
      
      return stats;
    } catch (error) {
      console.error('❌ Document statistics export failed:', error);
      throw error;
    }
  }, []);

  // =====================================
  // CONFIRMATION ACTIONS
  // =====================================

  /**
   * Show confirmation dialog
   * @param {Object} config - Confirmation configuration
   */
  const showConfirmation = useCallback((config) => {
    openModal('confirmAction', {
      title: config.title || 'Confirmation',
      message: config.message || 'Êtes-vous sûr de vouloir continuer ?',
      confirmText: config.confirmText || 'Confirmer',
      cancelText: config.cancelText || 'Annuler',
      onConfirm: config.onConfirm,
      variant: config.variant || 'default'
    });
  }, [openModal]);

  /**
   * Handle dangerous action with confirmation
   * @param {string} title - Confirmation title
   * @param {string} message - Confirmation message
   * @param {Function} action - Action to execute
   */
  const handleDangerousAction = useCallback(async (title, message, action) => {
    return new Promise((resolve, reject) => {
      showConfirmation({
        title,
        message,
        variant: 'danger',
        onConfirm: async () => {
          try {
            const result = await action();
            closeModal('confirmAction');
            resolve(result);
          } catch (error) {
            closeModal('confirmAction');
            reject(error);
          }
        }
      });
    });
  }, [showConfirmation, closeModal]);

  // =====================================
  // SEARCH ACTIONS
  // =====================================

  /**
   * Handle global search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   */
  const handleGlobalSearch = useCallback(async (query, options = {}) => {
    try {
      console.log('🔍 Performing global search:', query);

      const results = await ApiService.globalSearch(query, options);
      
      console.log('✅ Global search completed');
      
      return results;
    } catch (error) {
      console.error('❌ Global search failed:', error);
      throw error;
    }
  }, []);

  // =====================================
  // UTILITY FUNCTIONS
  // =====================================

  /**
   * Convert statistics to CSV format
   * @param {Object} stats - Statistics object
   * @returns {string} CSV formatted string
   */
  const convertStatsToCSV = (stats) => {
    const headers = ['Métrique', 'Valeur', 'Date'];
    const rows = [];
    
    const flattenStats = (obj, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenStats(value, `${prefix}${key}.`);
        } else {
          rows.push([
            `${prefix}${key}`,
            value,
            new Date().toISOString()
          ]);
        }
      });
    };
    
    flattenStats(stats);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  /**
   * Format error message for user display
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  const formatErrorMessage = useCallback((error) => {
    if (typeof error === 'string') return error;
    if (error?.userMessage) return error.userMessage;
    if (error?.message) return error.message;
    return 'Une erreur inattendue s\'est produite';
  }, []);

  // =====================================
  // BATCH OPERATIONS
  // =====================================

  /**
   * Execute operations in batches to avoid overwhelming the server
   * @param {Array} items - Items to process
   * @param {Function} operation - Operation function
   * @param {number} batchSize - Batch size
   */
  const executeBatchOperation = useCallback(async (items, operation, batchSize = 10) => {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(item => operation(item))
        );
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push({ item: batch[index], result: result.value });
          } else {
            errors.push({ item: batch[index], error: result.reason });
          }
        });
        
        // Small delay between batches
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ Batch operation failed for batch ${i / batchSize + 1}:`, error);
        batch.forEach(item => {
          errors.push({ item, error });
        });
      }
    }
    
    return { results, errors };
  }, []);

  // =====================================
  // RETURN HOOK INTERFACE
  // =====================================

  return {
    // Document actions
    handleDocumentApproval,
    handleDocumentRejection,
    handleBulkDocumentApproval,
    handleBulkDocumentRejection,

    // User actions
    handleUserCreation,
    handleUserUpdate,
    handleUserBlocking,
    handleUserUnblocking,

    // Financial actions
    handleDeposit,
    handleWithdrawal,
    handleTransfer,

    // Export actions
    handleUsersExport,
    handleDocumentsStatsExport,

    // Confirmation actions
    showConfirmation,
    handleDangerousAction,

    // Search actions
    handleGlobalSearch,

    // Batch operations
    executeBatchOperation,

    // Utilities
    formatErrorMessage
  };
};