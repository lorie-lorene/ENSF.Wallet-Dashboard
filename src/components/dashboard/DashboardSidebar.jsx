/**
 * 🧭 Dashboard Sidebar Component
 * 
 * Navigation sidebar for the admin dashboard with:
 * - Role-based navigation items
 * - Collapsible design
 * - Badge notifications
 * - Professional styling
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import {
  Home, Users, FileImage, Building2, CreditCard, DollarSign,
  BarChart3, Settings, FileText, LogOut, Menu
} from 'lucide-react';
import ApiService from '../../services/ApiService';

/**
 * Dashboard Sidebar Component
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.setActiveTab - Function to set active tab
 * @param {string} props.userRole - User role (BANK_ADMIN or AGENCY_DIRECTOR)
 * @param {Function} props.setUserRole - Function to set user role
 * @param {boolean} props.sidebarCollapsed - Sidebar collapse state
 * @param {Function} props.setSidebarCollapsed - Function to toggle sidebar
 * @param {Object} props.combinedStatistics - Statistics for badge notifications
 * @param {Object} props.systemHealth - System health status
 */
const DashboardSidebar = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  sidebarCollapsed,
  setSidebarCollapsed,
  combinedStatistics,
  systemHealth
}) => {

  // =====================================
  // NAVIGATION CONFIGURATION
  // =====================================

  /**
   * Navigation items configuration
   */
  const navigationItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: Home,
      badge: null,
      description: 'Aperçu général du système'
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      badge: combinedStatistics?.pendingUsers,
      description: 'Gestion des utilisateurs système'
    },
    {
      id: 'documents',
      label: 'Approbation Documents',
      icon: FileImage,
      badge: combinedStatistics?.pendingDocuments,
      description: 'Validation des documents KYC'
    },
    {
      id: 'agencies',
      label: userRole === 'BANK_ADMIN' ? 'Agences' : 'Mon Agence',
      icon: Building2,
      badge: null,
      description: userRole === 'BANK_ADMIN' ? 'Gestion des agences' : 'Informations de votre agence'
    },
    {
      id: 'accounts',
      label: 'Gestion Comptes',
      icon: CreditCard,
      badge: null,
      description: 'Gestion des comptes clients'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: DollarSign,
      badge: null,
      description: 'Suivi des transactions'
    },
    {
      id: 'analytics',
      label: 'Analyses',
      icon: BarChart3,
      badge: null,
      description: 'Analyses et rapports avancés'
    },
    {
      id: 'system',
      label: 'Système',
      icon: Settings,
      badge: systemHealth?.status === 'DOWN' ? 1 : null,
      description: 'État et configuration système'
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: FileText,
      badge: null,
      description: 'Génération de rapports'
    }
  ];

  // =====================================
  // ROLE CONFIGURATION
  // =====================================

  /**
   * Role options for the selector
   */
  const roleOptions = [
    {
      value: 'BANK_ADMIN',
      label: 'Directeur Banque',
      description: 'Accès complet à toutes les fonctionnalités'
    },
    {
      value: 'AGENCY_DIRECTOR',
      label: 'Directeur Agence',
      description: 'Accès limité aux données de l\'agence'
    }
  ];

  // =====================================
  // EVENT HANDLERS
  // =====================================

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await ApiService.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('loginTimestamp');
      window.location.href = '/login';
      // The main app will handle the authentication state change
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if server call fails
      localStorage.clear();
      window.location.href = '/login';
      window.location.reload();
    }
  };

  /**
   * Handle navigation item click
   * @param {string} tabId - Tab identifier
   */
  const handleNavigationClick = (tabId) => {
    setActiveTab(tabId);
    
    // Auto-collapse sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  /**
   * Handle role change
   * @param {Event} event - Select change event
   */
  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setUserRole(newRole);
    
    // Reset to overview when role changes
    setActiveTab('overview');
    
    console.log(`🔄 Role changed to: ${newRole}`);
  };

  // =====================================
  // RENDER FUNCTIONS
  // =====================================

  /**
   * Render navigation item
   * @param {Object} item - Navigation item
   * @returns {JSX.Element} Navigation item component
   */
  const renderNavigationItem = (item) => (
    <button
      key={item.id}
      onClick={() => handleNavigationClick(item.id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative group ${
        activeTab === item.id 
          ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:transform hover:scale-105'
      }`}
      title={sidebarCollapsed ? item.label : item.description}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      
      {!sidebarCollapsed && (
        <>
          <span className="text-sm font-medium">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="absolute right-2 top-2 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {sidebarCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.label}
          {item.badge && item.badge > 0 && (
            <span className="ml-1 bg-red-500 px-1 rounded-full">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </div>
      )}
    </button>
  );

  /**
   * Render role selector
   * @returns {JSX.Element} Role selector component
   */
  const renderRoleSelector = () => {
    if (sidebarCollapsed) return null;

    return (
      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-2">
          Rôle actuel
        </label>
        <select 
          value={userRole}
          onChange={handleRoleChange}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          {roleOptions.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          {roleOptions.find(r => r.value === userRole)?.description}
        </p>
      </div>
    );
  };

  /**
   * Render sidebar header
   * @returns {JSX.Element} Sidebar header component
   */
  const renderHeader = () => (
    <div className="p-6 border-b border-gray-700">
      <div className="flex items-center justify-between">
        {!sidebarCollapsed && (
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              {userRole === 'BANK_ADMIN' ? 'Direction Générale' : 'Direction Agence'}
            </p>
            
            {/* System status indicator */}
            <div className={`flex items-center gap-2 mt-2 text-xs ${
              systemHealth?.status === 'UP' 
                ? 'text-green-400'
                : systemHealth?.status === 'PARTIAL'
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                systemHealth?.status === 'UP' 
                  ? 'bg-green-400'
                  : systemHealth?.status === 'PARTIAL'
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
              } animate-pulse`}></div>
              <span>
                {systemHealth?.status === 'UP' ? 'Système opérationnel' :
                 systemHealth?.status === 'PARTIAL' ? 'Système dégradé' :
                 'Système en panne'}
              </span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors group"
          title={sidebarCollapsed ? 'Développer le menu' : 'Réduire le menu'}
        >
          <Menu className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );

  /**
   * Render sidebar footer
   * @returns {JSX.Element} Sidebar footer component
   */
  const renderFooter = () => (
    <div className="p-4 border-t border-gray-700">
      <button 
        onClick={handleLogout}
        className="w-full flex items-center gap-3 p-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 group"
        title="Se déconnecter"
      >
        <LogOut className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
        {!sidebarCollapsed && (
          <span className="text-sm font-medium">Déconnexion</span>
        )}
      </button>
    </div>
  );

  // =====================================
  // MAIN RENDER
  // =====================================

  return (
    <div className={`${
      sidebarCollapsed ? 'w-16' : 'w-72'
    } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
      
      {/* Header */}
      {renderHeader()}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {/* Role Selector */}
          {renderRoleSelector()}

          {/* Navigation Items */}
          {navigationItems.map(renderNavigationItem)}
        </div>
      </nav>

      {/* Footer */}
      {renderFooter()}
    </div>
  );
};

export default DashboardSidebar;