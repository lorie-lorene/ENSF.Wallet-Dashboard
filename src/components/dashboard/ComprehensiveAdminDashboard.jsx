/**
 * 🏦 Comprehensive Admin Dashboard - Main Component (Refactored)
 * 
 * Modern, modular admin dashboard with:
 * - Clean separation of concerns using custom hooks
 * - Professional component architecture
 * - Integrated API services with new modular structure
 * - Responsive design and professional UI
 * - Real-time data management
 * 
 * @author ENSF Wallet Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useEffect } from 'react';
import { X, CreditCard, FileText } from 'lucide-react';

// Import new modular API services
import ApiService from '../../services/ApiService';

// Import custom hooks for state management
import { useDashboardData } from '../../hooks/useDashboardData';
import { useDashboardState } from '../../hooks/useDashboardState';
import { useDashboardActions } from '../../hooks/useDashboardActions';

// Import modular components
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

// Import tab components
import OverviewTab from './OverviewTab';
import UsersManagementTab from './UsersManagementTab';
import DocumentApprovalTab from './DocumentApprovalTab';

// Placeholder components for future development
const AgencyManagementTab = React.lazy(() => import('./AgencyManagementTab'));
const TransactionManagementTab = React.lazy(() => import('./TransactionManagementTab'));
const AnalyticsTab = React.lazy(() => import('./AnalyticsTab'));
const SystemHealthTab = React.lazy(() => import('./SystemHealthTab'));

/**
 * Main Admin Dashboard Component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current authenticated user
 * @param {string} props.token - Authentication token
 * @param {Function} props.onLogout - Logout callback
 */
const ComprehensiveAdminDashboard = ({ user, token, onLogout }) => {
  
  // =====================================
  // CUSTOM HOOKS
  // =====================================

  // Dashboard state management
  const {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    selectedTimeRange,
    setSelectedTimeRange,
    selectedAgency,
    setSelectedAgency,
    sidebarCollapsed,
    setSidebarCollapsed,
    filters,
    updateFilters,
    resetFilters,
    pagination,
    updatePagination,
    goToPage,
    modals,
    openModal,
    closeModal,
    closeAllModals,
    selectedItems,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    preferences,
    updatePreferences
  } = useDashboardState();

  // Dashboard data management
  const {
    dashboardData,
    combinedStatistics,
    chartData,
    loading,
    errors,
    initializeDashboard,
    refreshData,
    clearErrors
  } = useDashboardData(userRole);

  // Dashboard actions
  const {
    handleDocumentApproval,
    handleDocumentRejection,
    handleBulkDocumentApproval,
    handleBulkDocumentRejection,
    handleUserCreation,
    handleUserUpdate,
    handleUserBlocking,
    handleUserUnblocking,
    handleDeposit,
    handleWithdrawal,
    handleTransfer,
    handleUsersExport,
    handleGlobalSearch,
    showConfirmation,
    handleDangerousAction
  } = useDashboardActions({
    refreshData,
    openModal,
    closeModal,
    clearSelection
  });

  // =====================================
  // EFFECTS
  // =====================================

  /**
   * Initialize dashboard on mount and when user role changes
   */
  useEffect(() => {
    console.log('🔄 Dashboard role changed, reinitializing...', userRole);
    initializeDashboard();
  }, [userRole, initializeDashboard]);

  /**
   * Set up authentication token
   */
  useEffect(() => {
    if (token) {
      // The ApiService should already have the token from the auth flow
      console.log('🔐 Dashboard authenticated with token');
    }
  }, [token]);

  /**
   * Auto-refresh data based on preferences
   */
  useEffect(() => {
    if (!preferences.autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      refreshData('dashboard');
    }, preferences.refreshInterval);

    return () => clearInterval(interval);
  }, [preferences.autoRefresh, preferences.refreshInterval, refreshData]);

  // =====================================
  // EVENT HANDLERS
  // =====================================

  /**
   * Handle refresh all data
   */
  const handleRefreshAll = async () => {
    try {
      await initializeDashboard();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    }
  };

  // =====================================
  // RENDER FUNCTIONS
  // =====================================

  /**
   * Render error alerts
   */
  const renderErrorAlerts = () => {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {Object.entries(errors)
        .filter(([key, error]) => error != null) // Filter out null/undefined errors
        .map(([key, error]) => (
          <div key={key} className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">
                  Erreur {key}
                </span>
                <span className="text-sm text-red-700">
                  {typeof error === 'string' 
                    ? error 
                    : (error && error.message) 
                      ? error.message 
                      : 'Erreur inconnue'
                  }
                </span>
              </div>
              <button
                onClick={() => clearErrors()}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Fermer l'alerte"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

  /**
   * Render loading overlay
   */
  const renderLoadingOverlay = () => {
    if (!loading.dashboard) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-900 font-medium">Chargement des données...</span>
        </div>
      </div>
    );
  };

  /**
   * Render main content based on active tab
   */
  const renderMainContent = () => {
    // Common props passed to all tab components
    const commonTabProps = {
      // Data
      dashboardData,
      combinedStatistics,
      chartData,
      
      // State
      loading,
      errors,
      userRole,
      selectedTimeRange,
      selectedAgency,
      
      // Filters and pagination
      filters,
      updateFilters,
      resetFilters,
      pagination,
      updatePagination,
      goToPage,
      
      // Modals
      modals,
      openModal,
      closeModal,
      
      // Selections
      selectedItems,
      toggleItemSelection,
      selectAllItems,
      clearSelection,
      
      // Actions
      onRefresh: {
        dashboard: initializeDashboard,
        users: () => refreshData('users'),
        documents: () => refreshData('documents'),
        health: () => refreshData('health')
      },
      
      // Action handlers
      onAction: {
        // Document actions
        approveDocument: handleDocumentApproval,
        rejectDocument: handleDocumentRejection,
        bulkApproveDocuments: handleBulkDocumentApproval,
        bulkRejectDocuments: handleBulkDocumentRejection,
        
        // User actions
        createUser: handleUserCreation,
        updateUser: handleUserUpdate,
        blockUser: handleUserBlocking,
        unblockUser: handleUserUnblocking,
        
        // Financial actions
        deposit: handleDeposit,
        withdrawal: handleWithdrawal,
        transfer: handleTransfer,
        
        // Export actions
        exportUsers: handleUsersExport,
        
        // Search
        globalSearch: handleGlobalSearch,
        
        // Confirmation
        showConfirmation,
        handleDangerousAction
      }
    };

    // Render appropriate tab content
    switch (activeTab) {
      case 'overview':
        return <OverviewTab {...commonTabProps} />;
        
      case 'users':
        return <UsersManagementTab {...commonTabProps} />;
        
      case 'documents':
        return <DocumentApprovalTab {...commonTabProps} />;
        
      case 'agencies':
        return (
          <React.Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
            <AgencyManagementTab {...commonTabProps} />
          </React.Suspense>
        );
        
      case 'accounts':
        return (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestion des Comptes</h3>
            <p className="text-gray-500">Module de gestion des comptes bancaires en cours de développement</p>
          </div>
        );
        
      case 'transactions':
        return (
          <React.Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
            <TransactionManagementTab {...commonTabProps} />
          </React.Suspense>
        );
        
      case 'analytics':
        return (
          <React.Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
            <AnalyticsTab {...commonTabProps} />
          </React.Suspense>
        );
        
      case 'system':
        return (
          <React.Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
            <SystemHealthTab {...commonTabProps} />
          </React.Suspense>
        );
        
      case 'reports':
        return (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rapports</h3>
            <p className="text-gray-500">Module de génération et consultation des rapports en cours de développement</p>
          </div>
        );
        
      default:
        return <OverviewTab {...commonTabProps} />;
    }
  };

  // =====================================
  // MAIN RENDER
  // =====================================

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        combinedStatistics={combinedStatistics}
        systemHealth={dashboardData.agenceService.health}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          userRole={userRole}
          combinedStatistics={combinedStatistics}
          systemHealth={dashboardData.agenceService.health}
          onRefresh={handleRefreshAll}
          isLoading={loading.dashboard}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Error Alerts */}
          {renderErrorAlerts()}
          
          {/* Tab Content */}
          {renderMainContent()}
        </main>
      </div>
      
      {/* Loading Overlay */}
      {renderLoadingOverlay()}
    </div>
  );
};

export default ComprehensiveAdminDashboard;