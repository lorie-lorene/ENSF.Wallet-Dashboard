/**
 * 📱 Dashboard Header Component
 * 
 * Top header for the admin dashboard with:
 * - Role-based title and information
 * - System health indicators
 * - Real-time notifications
 * - Quick action buttons
 * - User profile information
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import {
  Bell, Search, RefreshCw, Download, Settings, User,
  Wifi, WifiOff, AlertTriangle, CheckCircle, Clock,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import ApiService from '../../services/ApiService';

/**
 * Dashboard Header Component
 * @param {Object} props - Component props
 * @param {string} props.userRole - Current user role
 * @param {Object} props.combinedStatistics - Dashboard statistics
 * @param {Object} props.systemHealth - System health status
 * @param {Function} props.onRefresh - Refresh callback
 * @param {boolean} props.isLoading - Loading state
 */
const DashboardHeader = ({
  userRole,
  combinedStatistics,
  systemHealth,
  onRefresh,
  isLoading = false
}) => {
  // =====================================
  // STATE MANAGEMENT
  // =====================================

  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // =====================================
  // EFFECTS
  // =====================================

  /**
   * Update current time every minute
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  /**
   * Get current user information
   */
  useEffect(() => {
    const user = ApiService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  /**
   * Generate notifications based on system state
   */
  useEffect(() => {
    const newNotifications = [];

    // System health notifications
    if (systemHealth?.status === 'DOWN') {
      newNotifications.push({
        id: 'system-down',
        type: 'error',
        title: 'Système en panne',
        message: 'Certains services sont indisponibles',
        timestamp: new Date()
      });
    } else if (systemHealth?.status === 'PARTIAL') {
      newNotifications.push({
        id: 'system-degraded',
        type: 'warning',
        title: 'Système dégradé',
        message: 'Performances réduites détectées',
        timestamp: new Date()
      });
    }

    // Pending documents notifications
    if (combinedStatistics?.pendingDocuments > 10) {
      newNotifications.push({
        id: 'pending-docs',
        type: 'info',
        title: 'Documents en attente',
        message: `${combinedStatistics.pendingDocuments} documents nécessitent une approbation`,
        timestamp: new Date()
      });
    }

    // Pending users notifications
    if (combinedStatistics?.pendingUsers > 5) {
      newNotifications.push({
        id: 'pending-users',
        type: 'info',
        title: 'Utilisateurs en attente',
        message: `${combinedStatistics.pendingUsers} utilisateurs en attente de validation`,
        timestamp: new Date()
      });
    }

    setNotifications(newNotifications);
  }, [systemHealth, combinedStatistics]);

  // =====================================
  // HELPER FUNCTIONS
  // =====================================

  /**
   * Format current date and time
   * @returns {Object} Formatted date and time
   */
  const getFormattedDateTime = () => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Douala'
    };

    return {
      date: currentTime.toLocaleDateString('fr-FR', options),
      time: currentTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Douala'
      })
    };
  };

  /**
   * Get role-specific title and description
   * @returns {Object} Title and description
   */
  const getRoleInfo = () => {
    const roleMap = {
      'BANK_ADMIN': {
        title: 'Direction Générale',
        description: 'Tableau de bord administrateur principal',
        permissions: 'Accès complet à toutes les fonctionnalités'
      },
      'AGENCY_DIRECTOR': {
        title: 'Direction Agence',
        description: 'Tableau de bord directeur d\'agence',
        permissions: 'Accès limité aux données de l\'agence'
      }
    };

    return roleMap[userRole] || roleMap['BANK_ADMIN'];
  };

  /**
   * Get system health display info
   * @returns {Object} Health display information
   */
  const getHealthDisplayInfo = () => {
    const status = systemHealth?.status || 'UNKNOWN';
    
    const statusMap = {
      'UP': {
        label: 'Opérationnel',
        color: 'text-green-600 bg-green-100',
        icon: CheckCircle,
        pulse: false
      },
      'PARTIAL': {
        label: 'Dégradé',
        color: 'text-yellow-600 bg-yellow-100',
        icon: AlertTriangle,
        pulse: true
      },
      'DOWN': {
        label: 'En panne',
        color: 'text-red-600 bg-red-100',
        icon: WifiOff,
        pulse: true
      },
      'UNKNOWN': {
        label: 'Inconnu',
        color: 'text-gray-600 bg-gray-100',
        icon: Clock,
        pulse: false
      }
    };

    return statusMap[status];
  };

  /**
   * Calculate system performance metrics
   * @returns {Object} Performance metrics
   */
  const getPerformanceMetrics = () => {
    if (!combinedStatistics) return null;

    const totalClients = combinedStatistics.totalClients || 0;
    const activeClients = combinedStatistics.activeClients || 0;
    const pendingDocs = combinedStatistics.pendingDocuments || 0;

    return {
      clientActivity: totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0,
      systemLoad: pendingDocs < 10 ? 'Faible' : pendingDocs < 50 ? 'Modérée' : 'Élevée',
      responseTime: systemHealth?.status === 'UP' ? 'Optimal' : 'Dégradé'
    };
  };

  // =====================================
  // EVENT HANDLERS
  // =====================================

  /**
   * Handle refresh button click
   */
  const handleRefresh = async () => {
    if (onRefresh && !isLoading) {
      await onRefresh();
    }
  };

  /**
   * Handle notification click
   */
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  /**
   * Handle export data
   */
  const handleExportData = async () => {
    try {
      console.log('📤 Exporting dashboard data...');
      // Implementation for data export
      // This would typically call the API service to generate a report
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  };

  // =====================================
  // RENDER FUNCTIONS
  // =====================================

  /**
   * Render notifications dropdown
   * @returns {JSX.Element} Notifications dropdown
   */
  const renderNotifications = () => {
    if (!showNotifications) return null;

    return (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-500">{notifications.length} nouvelle(s)</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    notification.type === 'error' ? 'bg-red-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {notification.timestamp.toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  /**
   * Render system metrics
   * @returns {JSX.Element} System metrics component
   */
  const renderSystemMetrics = () => {
    const performanceMetrics = getPerformanceMetrics();
    if (!performanceMetrics) return null;

    return (
      <div className="hidden lg:flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <span className="text-gray-600">
            Activité: {performanceMetrics.clientActivity}%
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            performanceMetrics.systemLoad === 'Faible' ? 'bg-green-500' :
            performanceMetrics.systemLoad === 'Modérée' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          <span className="text-gray-600">
            Charge: {performanceMetrics.systemLoad}
          </span>
        </div>
      </div>
    );
  };

  // =====================================
  // MAIN RENDER
  // =====================================

  const { date, time } = getFormattedDateTime();
  const roleInfo = getRoleInfo();
  const healthInfo = getHealthDisplayInfo();
  const HealthIcon = healthInfo.icon;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Date */}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {roleInfo.title}
                {isLoading && (
                  <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {roleInfo.description} - {date}
              </p>
            </div>
            
            {/* System Health Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${healthInfo.color}`}>
              <HealthIcon className={`h-4 w-4 ${healthInfo.pulse ? 'animate-pulse' : ''}`} />
              <span className="font-medium">{healthInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Center Section - System Metrics */}
        <div className="hidden xl:block">
          {renderSystemMetrics()}
        </div>

        {/* Right Section - Actions and User Info */}
        <div className="flex items-center gap-4">
          {/* Current Time */}
          <div className="hidden md:block text-right">
            <div className="text-lg font-semibold text-gray-900">{time}</div>
            <div className="text-xs text-gray-500">Douala, Cameroun</div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportData}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Exporter les données"
            >
              <Download className="h-5 w-5" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              {renderNotifications()}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {currentUser?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile System Metrics */}
      <div className="xl:hidden mt-4 pt-4 border-t border-gray-100">
        {renderSystemMetrics()}
      </div>
    </header>
  );
};

export default DashboardHeader;