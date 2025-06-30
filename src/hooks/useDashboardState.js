/**
 * 🎛️ Dashboard State Management Hook
 * 
 * Centralized state management for dashboard UI components:
 * - Tab navigation and active states
 * - Modal states and management
 * - Filter and pagination states
 * - User interface preferences
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Dashboard state management hook
 * @returns {Object} Dashboard state and management functions
 */
export const useDashboardState = () => {
  // =====================================
  // NAVIGATION STATE
  // =====================================

  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('BANK_ADMIN');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedAgency, setSelectedAgency] = useState('all');

  // =====================================
  // UI STATE
  // =====================================

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =====================================
  // FILTER STATES
  // =====================================

  const [filters, setFilters] = useState({
    users: {
      status: 'ALL',
      search: '',
      role: 'all',
      agency: 'all',
      dateRange: '30d'
    },
    documents: {
      status: 'PENDING',
      agency: 'all',
      type: 'all',
      priority: 'all',
      dateRange: '7d'
    },
    agencies: {
      region: 'all',
      status: 'all',
      type: 'all'
    },
    transactions: {
      type: 'all',
      status: 'all',
      dateRange: '7d',
      agency: 'all',
      minAmount: '',
      maxAmount: ''
    }
  });

  // =====================================
  // PAGINATION STATES
  // =====================================

  const [pagination, setPagination] = useState({
    users: {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0
    },
    documents: {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0
    },
    agencies: {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0
    },
    transactions: {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0
    }
  });

  // =====================================
  // MODAL STATES
  // =====================================

  const [modals, setModals] = useState({
    userDetails: {
      open: false,
      user: null,
      mode: 'view' // 'view', 'edit', 'create'
    },
    documentReview: {
      open: false,
      document: null,
      action: null // 'approve', 'reject'
    },
    createUser: {
      open: false,
      initialData: null
    },
    agencyDetails: {
      open: false,
      agency: null,
      mode: 'view'
    },
    transactionDetails: {
      open: false,
      transaction: null
    },
    bulkActions: {
      open: false,
      type: null, // 'approve', 'reject', 'export'
      selectedItems: [],
      entityType: null // 'users', 'documents'
    },
    confirmAction: {
      open: false,
      title: '',
      message: '',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      onConfirm: null,
      variant: 'default' // 'default', 'danger'
    }
  });

  // =====================================
  // SELECTION STATES
  // =====================================

  const [selectedItems, setSelectedItems] = useState({
    users: [],
    documents: [],
    agencies: [],
    transactions: []
  });

  // =====================================
  // PREFERENCES STATE
  // =====================================

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'fr',
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    showNotifications: true,
    soundEnabled: false
  });

  // =====================================
  // PERSISTENCE EFFECTS
  // =====================================

  /**
   * Load preferences from localStorage on mount
   */
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('dashboardPreferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }

      const savedSidebarState = localStorage.getItem('sidebarCollapsed');
      if (savedSidebarState !== null) {
        setSidebarCollapsed(JSON.parse(savedSidebarState));
      }

      const savedUserRole = localStorage.getItem('selectedUserRole');
      if (savedUserRole) {
        setUserRole(savedUserRole);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard preferences:', error);
    }
  }, []);

  /**
   * Save preferences to localStorage
   */
  useEffect(() => {
    try {
      localStorage.setItem('dashboardPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('❌ Error saving dashboard preferences:', error);
    }
  }, [preferences]);

  /**
   * Save sidebar state
   */
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    } catch (error) {
      console.error('❌ Error saving sidebar state:', error);
    }
  }, [sidebarCollapsed]);

  /**
   * Save user role
   */
  useEffect(() => {
    try {
      localStorage.setItem('selectedUserRole', userRole);
    } catch (error) {
      console.error('❌ Error saving user role:', error);
    }
  }, [userRole]);

  // =====================================
  // FILTER MANAGEMENT
  // =====================================

  /**
   * Update filters for specific entity type
   * @param {string} entityType - Entity type (users, documents, etc.)
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((entityType, newFilters) => {
    setFilters(prev => ({
      ...prev,
      [entityType]: {
        ...prev[entityType],
        ...newFilters
      }
    }));

    // Reset pagination when filters change
    setPagination(prev => ({
      ...prev,
      [entityType]: {
        ...prev[entityType],
        page: 0
      }
    }));
  }, []);

  /**
   * Reset filters for specific entity type
   * @param {string} entityType - Entity type
   */
  const resetFilters = useCallback((entityType) => {
    const defaultFilters = {
      users: { status: 'ALL', search: '', role: 'all', agency: 'all', dateRange: '30d' },
      documents: { status: 'PENDING', agency: 'all', type: 'all', priority: 'all', dateRange: '7d' },
      agencies: { region: 'all', status: 'all', type: 'all' },
      transactions: { type: 'all', status: 'all', dateRange: '7d', agency: 'all', minAmount: '', maxAmount: '' }
    };

    setFilters(prev => ({
      ...prev,
      [entityType]: defaultFilters[entityType] || {}
    }));

    setPagination(prev => ({
      ...prev,
      [entityType]: {
        ...prev[entityType],
        page: 0
      }
    }));
  }, []);

  // =====================================
  // PAGINATION MANAGEMENT
  // =====================================

  /**
   * Update pagination for specific entity type
   * @param {string} entityType - Entity type
   * @param {Object} newPagination - New pagination values
   */
  const updatePagination = useCallback((entityType, newPagination) => {
    setPagination(prev => ({
      ...prev,
      [entityType]: {
        ...prev[entityType],
        ...newPagination
      }
    }));
  }, []);

  /**
   * Go to specific page
   * @param {string} entityType - Entity type
   * @param {number} page - Page number
   */
  const goToPage = useCallback((entityType, page) => {
    setPagination(prev => ({
      ...prev,
      [entityType]: {
        ...prev[entityType],
        page: Math.max(0, Math.min(page, prev[entityType].totalPages - 1))
      }
    }));
  }, []);

  // =====================================
  // MODAL MANAGEMENT
  // =====================================

  /**
   * Open modal with specific configuration
   * @param {string} modalType - Modal type
   * @param {Object} config - Modal configuration
   */
  const openModal = useCallback((modalType, config = {}) => {
    setModals(prev => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        open: true,
        ...config
      }
    }));
  }, []);

  /**
   * Close modal
   * @param {string} modalType - Modal type
   */
  const closeModal = useCallback((modalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: {
        ...prev[modalType],
        open: false,
        // Reset modal-specific data
        ...(modalType === 'userDetails' && { user: null, mode: 'view' }),
        ...(modalType === 'documentReview' && { document: null, action: null }),
        ...(modalType === 'createUser' && { initialData: null }),
        ...(modalType === 'agencyDetails' && { agency: null, mode: 'view' }),
        ...(modalType === 'transactionDetails' && { transaction: null }),
        ...(modalType === 'bulkActions' && { type: null, selectedItems: [], entityType: null }),
        ...(modalType === 'confirmAction' && { title: '', message: '', onConfirm: null })
      }
    }));
  }, []);

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const newModals = { ...prev };
      Object.keys(newModals).forEach(key => {
        newModals[key] = { ...newModals[key], open: false };
      });
      return newModals;
    });
  }, []);

  // =====================================
  // SELECTION MANAGEMENT
  // =====================================

  /**
   * Toggle item selection
   * @param {string} entityType - Entity type
   * @param {string} itemId - Item ID
   */
  const toggleItemSelection = useCallback((entityType, itemId) => {
    setSelectedItems(prev => {
      const currentSelection = prev[entityType] || [];
      const isSelected = currentSelection.includes(itemId);
      
      return {
        ...prev,
        [entityType]: isSelected
          ? currentSelection.filter(id => id !== itemId)
          : [...currentSelection, itemId]
      };
    });
  }, []);

  /**
   * Select all items
   * @param {string} entityType - Entity type
   * @param {Array} itemIds - Array of item IDs
   */
  const selectAllItems = useCallback((entityType, itemIds) => {
    setSelectedItems(prev => ({
      ...prev,
      [entityType]: itemIds
    }));
  }, []);

  /**
   * Clear selection
   * @param {string} entityType - Entity type
   */
  const clearSelection = useCallback((entityType) => {
    setSelectedItems(prev => ({
      ...prev,
      [entityType]: []
    }));
  }, []);

  // =====================================
  // PREFERENCES MANAGEMENT
  // =====================================

  /**
   * Update preferences
   * @param {Object} newPreferences - New preference values
   */
  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  }, []);

  // =====================================
  // UTILITY FUNCTIONS
  // =====================================

  /**
   * Reset all state to defaults
   */
  const resetDashboardState = useCallback(() => {
    setActiveTab('overview');
    setSelectedTimeRange('30d');
    setSelectedAgency('all');
    closeAllModals();
    setSelectedItems({
      users: [],
      documents: [],
      agencies: [],
      transactions: []
    });
    // Don't reset filters and pagination as they might be intentional
  }, [closeAllModals]);

  /**
   * Get active filter count for entity type
   * @param {string} entityType - Entity type
   * @returns {number} Number of active filters
   */
  const getActiveFilterCount = useCallback((entityType) => {
    const entityFilters = filters[entityType];
    if (!entityFilters) return 0;

    const defaultValues = ['all', '', 'ALL', 'PENDING'];
    return Object.values(entityFilters).filter(value => 
      value !== '' && !defaultValues.includes(value)
    ).length;
  }, [filters]);

  // =====================================
  // RETURN HOOK INTERFACE
  // =====================================

  return {
    // Navigation state
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    selectedTimeRange,
    setSelectedTimeRange,
    selectedAgency,
    setSelectedAgency,

    // UI state
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,

    // Filter state and management
    filters,
    updateFilters,
    resetFilters,
    getActiveFilterCount,

    // Pagination state and management
    pagination,
    updatePagination,
    goToPage,

    // Modal state and management
    modals,
    openModal,
    closeModal,
    closeAllModals,

    // Selection state and management
    selectedItems,
    toggleItemSelection,
    selectAllItems,
    clearSelection,

    // Preferences
    preferences,
    updatePreferences,

    // Utilities
    resetDashboardState
  };
};