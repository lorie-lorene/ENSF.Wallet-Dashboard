/**
 * 📊 Dashboard Data Management Hook
 * 
 * Custom hook for managing dashboard data, loading states, and API calls.
 * Provides centralized state management for the admin dashboard.
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../services/ApiService';

/**
 * Dashboard data management hook
 * @param {string} userRole - Current user role (BANK_ADMIN or AGENCY_DIRECTOR)
 * @returns {Object} Dashboard data and management functions
 */
export const useDashboardData = (userRole = 'BANK_ADMIN') => {
  // =====================================
  // STATE MANAGEMENT
  // =====================================
  
  // Data state - organized by service
  const [dashboardData, setDashboardData] = useState({
    userService: {
      statistics: null,
      clients: []
    },
    agenceService: {
      dashboard: null,
      users: null,
      documents: null,
      agencies: null,
      transactions: null,
      health: null,
      recentActivity: []
    }
  });
  
  // Loading states for different operations
  const [loading, setLoading] = useState({
    dashboard: false,
    users: false,
    documents: false,
    agencies: false,
    transactions: false,
    statistics: false,
    health: false,
    recentActivity: false
  });
  
  // Error states
  const [errors, setErrors] = useState({});

  // =====================================
  // UTILITY FUNCTIONS
  // =====================================

  /**
   * Safe error formatting
   * @param {Error} error - Error object
   * @returns {string} Formatted error message
   */
  const safeFormatError = useCallback((error) => {
    if (typeof error === 'string') return error;
    if (error?.userMessage) return error.userMessage;
    if (error?.message) return error.message;
    return 'Une erreur inattendue s\'est produite';
  }, []);

  /**
   * Update loading state for specific operation
   * @param {string} operation - Operation name
   * @param {boolean} isLoading - Loading state
   */
  const setOperationLoading = useCallback((operation, isLoading) => {
    setLoading(prev => ({ ...prev, [operation]: isLoading }));
  }, []);

  /**
   * Update error state for specific operation
   * @param {string} operation - Operation name
   * @param {Error|null} error - Error object or null to clear
   */
  const setOperationError = useCallback((operation, error) => {
    setErrors(prev => ({ 
      ...prev, 
      [operation]: error ? safeFormatError(error) : null 
    }));
  }, [safeFormatError]);

  // =====================================
  // DATA FETCHING FUNCTIONS
  // =====================================

  /**
   * Fetch user service statistics (real client data)
   */
  const fetchUserServiceData = useCallback(async () => {
    try {
      console.log('📊 Fetching REAL client statistics from UserService...');
      setOperationLoading('statistics', true);
      setOperationError('statistics', null);

      const statistics = await ApiService.user.getUserStatistics();
      
      setDashboardData(prev => ({
        ...prev,
        userService: {
          ...prev.userService,
          statistics
        }
      }));

      console.log('✅ User statistics fetched successfully:', statistics);
      return statistics;
    } catch (error) {
      console.error('❌ Failed to fetch user statistics:', error);
      setOperationError('statistics', error);
      throw error;
    } finally {
      setOperationLoading('statistics', false);
    }
  }, [setOperationLoading, setOperationError]);

  /**
   * Fetch agence service dashboard data
   */
  const fetchAgenceServiceDashboard = useCallback(async () => {
    try {
      console.log('🏦 Fetching AgenceService dashboard data...');
      setOperationLoading('dashboard', true);
      setOperationError('dashboard', null);

      const dashboard = await ApiService.agence.getDashboardData();
      
      setDashboardData(prev => ({
        ...prev,
        agenceService: {
          ...prev.agenceService,
          dashboard
        }
      }));

      console.log('✅ Agence dashboard data fetched successfully');
      return dashboard;
    } catch (error) {
      console.error('❌ Failed to fetch agence dashboard:', error);
      setOperationError('dashboard', error);
      throw error;
    } finally {
      setOperationLoading('dashboard', false);
    }
  }, [setOperationLoading, setOperationError]);

  /**
   * Fetch system health status
   */
  const fetchSystemHealth = useCallback(async () => {
    try {
      console.log('🏥 Fetching system health...');
      setOperationLoading('health', true);
      setOperationError('health', null);

      const health = await ApiService.agence.getSystemHealth();
      
      setDashboardData(prev => ({
        ...prev,
        agenceService: {
          ...prev.agenceService,
          health
        }
      }));

      console.log('✅ System health fetched successfully:', health);
      return health;
    } catch (error) {
      console.error('❌ Failed to fetch system health:', error);
      setOperationError('health', error);
      throw error;
    } finally {
      setOperationLoading('health', false);
    }
  }, [setOperationLoading, setOperationError]);

  /**
   * Fetch pending documents
   */
  const fetchPendingDocuments = useCallback(async (params = {}) => {
    try {
      console.log('📋 Fetching pending documents...');
      setOperationLoading('documents', true);
      setOperationError('documents', null);

      const documents = await ApiService.agence.getPendingDocuments(params);
      console.log("documents", documents);
      setDashboardData(prev => ({
        ...prev,
        agenceService: {
          ...prev.agenceService,
          documents
        }
      }));

      console.log(`✅ Fetched ${documents.content?.length || 0} pending documents`);
      return documents;
    } catch (error) {
      console.error('❌ Failed to fetch pending documents:', error);
      setOperationError('documents', error);
      throw error;
    } finally {
      setOperationLoading('documents', false);
    }
  }, [setOperationLoading, setOperationError]);

  /**
   * Fetch users list
   */
  const fetchUsers = useCallback(async (params = {}) => {
    try {
      console.log('👥 Fetching users list...');
      setOperationLoading('users', true);
      setOperationError('users', null);

      const users = await ApiService.agence.getUsers(params);
      
      setDashboardData(prev => ({
        ...prev,
        agenceService: {
          ...prev.agenceService,
          users
        }
      }));

      console.log(`✅ Fetched ${users.content?.length || 0} users`);
      return users;
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      setOperationError('users', error);
      throw error;
    } finally {
      setOperationLoading('users', false);
    }
  }, [setOperationLoading, setOperationError]);

  /**
   * Fetch recent activity
   */
  const fetchRecentActivity = useCallback(async (params = { limit: 20 }) => {
    try {
      console.log('🕐 Fetching recent activity...');
      setOperationLoading('recentActivity', true);
      setOperationError('recentActivity', null);

      const recentActivity = await ApiService.agence.getRecentActivity(params);
      
      setDashboardData(prev => ({
        ...prev,
        agenceService: {
          ...prev.agenceService,
          recentActivity
        }
      }));

      console.log(`✅ Fetched ${recentActivity.length} recent activities`);
      return recentActivity;
    } catch (error) {
      console.error('❌ Failed to fetch recent activity:', error);
      setOperationError('recentActivity', error);
      throw error;
    } finally {
      setOperationLoading('recentActivity', false);
    }
  }, [setOperationLoading, setOperationError]);

  // =====================================
  // COMPREHENSIVE DATA INITIALIZATION
  // =====================================

  /**
   * Initialize dashboard with all required data
   */
  const initializeDashboard = useCallback(async () => {
    try {
      console.log('🚀 Starting comprehensive dashboard initialization...');
      setOperationLoading('dashboard', true);
      setOperationError('dashboard', null);

      // Execute all data fetching operations in parallel
      const results = await Promise.allSettled([
        fetchUserServiceData(),
        fetchAgenceServiceDashboard(),
        fetchSystemHealth(),
        fetchPendingDocuments(),
        fetchRecentActivity()
      ]);
      
      // Log results for debugging
      const functionNames = [
        'fetchUserServiceData',
        'fetchAgenceServiceDashboard',
        'fetchSystemHealth',
        'fetchPendingDocuments',
        'fetchRecentActivity'
      ];
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ ${functionNames[index]} failed:`, result.reason);
        } else {
          console.log(`✅ ${functionNames[index]} completed`);
        }
      });

      console.log('✅ Dashboard initialization completed');

    } catch (error) {
      console.error('❌ Dashboard initialization error:', error);
      setOperationError('dashboard', error);
    } finally {
      setOperationLoading('dashboard', false);
    }
  }, [
    fetchUserServiceData,
    fetchAgenceServiceDashboard,
    fetchSystemHealth,
    fetchPendingDocuments,
    fetchRecentActivity,
    setOperationLoading,
    setOperationError
  ]);

  // =====================================
  // COMPUTED STATISTICS
  // =====================================

  /**
   * Combined statistics from all services
   */
  const combinedStatistics = useMemo(() => {
    const userStats = dashboardData.userService.statistics;
    const agenceStats = dashboardData.agenceService.dashboard?.userStatistics;
    const documentsStats = dashboardData.agenceService.documents;
    
    if (!userStats && !agenceStats) return null;

    // Check if we have real data from UserService
    const isRealData = userStats?.source === 'UserService';
    
    return {
      // Client statistics (REAL data from UserService)
      totalClients: userStats?.totalClients || 0,
      activeClients: userStats?.activeClients || 0,
      pendingClients: userStats?.pendingClients || 0,
      blockedClients: userStats?.blockedClients || 0,
      rejectedClients: userStats?.rejectedClients || 0,
      newClientsToday: userStats?.newClientsToday || 0,
      newClientsThisWeek: userStats?.newClientsThisWeek || 0,
      newClientsThisMonth: userStats?.newClientsThisMonth || 0,
      
      // System users (AgenceService data)
      totalUsers: agenceStats?.totalUsers || 0,
      activeUsers: agenceStats?.activeUsers || 0,
      pendingUsers: agenceStats?.pendingUsers || 0,
      blockedUsers: agenceStats?.blockedUsers || 0,
      
      // Documents
      pendingDocuments: documentsStats?.totalElements || 0,
      
      // Health
      systemHealth: dashboardData.agenceService.health?.status || 'UNKNOWN',
      
      // Data source information
      dataSource: {
        clients: userStats?.source || 'Unknown',
        isRealData: isRealData,
        lastUpdated: userStats?.generatedAt || new Date().toISOString()
      },
      
      // Additional real data metrics
      clientsWithAccounts: userStats?.clientsWithAccounts || 0,
      clientsWithTransactions: userStats?.clientsWithTransactions || 0,
      totalAccountBalance: userStats?.totalAccountBalance || 0,
      
      // Distribution data
      agencyDistribution: userStats?.agencyDistribution || {},
      statusDistribution: userStats?.statusDistribution || {},
      registrationTrends: userStats?.registrationTrends || {}
    };
  }, [dashboardData]);

  /**
   * Chart data for visualizations
   */
  const chartData = useMemo(() => {
    if (!combinedStatistics) return [];

    // Use real status distribution if available
    if (combinedStatistics.statusDistribution && Object.keys(combinedStatistics.statusDistribution).length > 0) {
      return Object.entries(combinedStatistics.statusDistribution).map(([status, count]) => ({
        name: getStatusDisplayName(status),
        value: count,
        color: getStatusColor(status)
      }));
    }

    // Fallback to basic distribution
    return [
      { name: 'Clients Actifs', value: combinedStatistics.activeClients, color: '#10B981' },
      { name: 'En Attente', value: combinedStatistics.pendingClients, color: '#F59E0B' },
      { name: 'Bloqués', value: combinedStatistics.blockedClients, color: '#EF4444' },
      { name: 'Rejetés', value: combinedStatistics.rejectedClients || 0, color: '#6B7280' }
    ].filter(item => item.value > 0); // Only show non-zero values
  }, [combinedStatistics]);

  // =====================================
  // HELPER FUNCTIONS
  // =====================================

  /**
   * Get status display name
   * @param {string} status - Status code
   * @returns {string} Display name
   */
  const getStatusDisplayName = (status) => {
    const statusMap = {
      'ACTIVE': 'Clients Actifs',
      'PENDING': 'En Attente',
      'BLOCKED': 'Bloqués',
      'REJECTED': 'Rejetés'
    };
    return statusMap[status] || status;
  };

  /**
   * Get status color
   * @param {string} status - Status code
   * @returns {string} Color hex code
   */
  const getStatusColor = (status) => {
    const colorMap = {
      'ACTIVE': '#10B981',
      'PENDING': '#F59E0B',
      'BLOCKED': '#EF4444',
      'REJECTED': '#6B7280'
    };
    return colorMap[status] || '#6B7280';
  };

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Refresh specific data type
   * @param {string} dataType - Type of data to refresh
   */
  const refreshData = useCallback(async (dataType) => {
    const refreshFunctions = {
      dashboard: initializeDashboard,
      users: fetchUsers,
      documents: fetchPendingDocuments,
      health: fetchSystemHealth,
      statistics: fetchUserServiceData,
      recentActivity: fetchRecentActivity
    };

    const refreshFunction = refreshFunctions[dataType];
    if (refreshFunction) {
      await refreshFunction();
    } else {
      console.warn(`⚠️ No refresh function found for data type: ${dataType}`);
    }
  }, [
    initializeDashboard,
    fetchUsers,
    fetchPendingDocuments,
    fetchSystemHealth,
    fetchUserServiceData,
    fetchRecentActivity
  ]);

  // =====================================
  // INITIALIZATION EFFECT
  // =====================================

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  // =====================================
  // RETURN HOOK INTERFACE
  // =====================================

  return {
    // Data
    dashboardData,
    combinedStatistics,
    chartData,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Actions
    initializeDashboard,
    fetchUserServiceData,
    fetchAgenceServiceDashboard,
    fetchSystemHealth,
    fetchPendingDocuments,
    fetchUsers,
    fetchRecentActivity,
    refreshData,
    clearErrors,
    
    // Utilities
    setOperationLoading,
    setOperationError,
    safeFormatError,
    getStatusDisplayName,
    getStatusColor
  };
};