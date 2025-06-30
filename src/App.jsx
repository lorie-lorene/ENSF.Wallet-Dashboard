/**
 * 🚀 Main Application Component with Authentication Flow
 * 
 * Features:
 * - Authentication state management (maintaining current structure)
 * - Route protection for admin dashboard
 * - Loading states and error handling
 * - Professional UI transitions
 * - JWT token validation
 * - Integration with new modular API services
 * 
 * @author ENSF Wallet Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { Loader, Building2 } from 'lucide-react';

// Import components (maintaining current structure)
import ComprehensiveAdminDashboard from './components/dashboard/ComprehensiveAdminDashboard';
import AdminLoginPage from './components/auth/AdminLoginPage';

// Import new modular API services
import ApiService from './services/ApiService';

// Import styles
import './index.css';

/**
 * Main Application Component
 */
function App() {
  // =====================================
  // STATE MANAGEMENT (maintaining current structure)
  // =====================================
  
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null
  });

  // =====================================
  // AUTHENTICATION SERVICE (maintaining current structure with API integration)
  // =====================================
  
  /**
   * Authentication utilities (enhanced with new API service)
   */
  const AuthUtils = {
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
      const token = localStorage.getItem('authToken');
      const loginTime = localStorage.getItem('loginTimestamp');
      
      if (!token || !loginTime) return false;
      
      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - parseInt(loginTime);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      return tokenAge < maxAge;
    },

    /**
     * Get stored user data
     */
    getCurrentUser() {
      try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
      } catch {
        return null;
      }
    },

    /**
     * Get stored token
     */
    getToken() {
      return localStorage.getItem('authToken');
    },

    /**
     * Validate JWT token structure (basic check)
     */
    isValidJwtStructure(token) {
      if (!token) return false;
      
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // Try to decode the payload
        const payload = JSON.parse(atob(parts[1]));
        return payload && payload.exp && payload.exp > Date.now() / 1000;
      } catch {
        return false;
      }
    },

    /**
     * Clear authentication data
     */
    clearAuth() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('loginTimestamp');
      delete window.authToken;
      
      // Also clear API service auth
      try {
        ApiService.auth.clearAuthData();
      } catch (error) {
        console.warn('⚠️ Error clearing API service auth:', error);
      }
    }
  };

  // =====================================
  // COMPONENT LIFECYCLE (maintaining current structure)
  // =====================================
  
  useEffect(() => {
    /**
     * Initialize authentication state on app load
     */
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        
        // Check if user is authenticated
        const isAuth = AuthUtils.isAuthenticated();
        const user = AuthUtils.getCurrentUser();
        const token = AuthUtils.getToken();
        
        if (isAuth && user && token && AuthUtils.isValidJwtStructure(token)) {
          // Valid authentication found
          console.log('✅ Valid authentication found for user:', user.username || user.email);
          
          // Set auth header for API calls
          window.authToken = token;
          
          // Sync with new API service
          try {
            ApiService.http.setAuthToken(token);
          } catch (error) {
            console.warn('⚠️ Error syncing token with API service:', error);
          }
          
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: user,
            token: token
          });
        } else {
          // No valid authentication
          console.log('❌ No valid authentication found');
          
          // Clear any invalid auth data
          AuthUtils.clearAuth();
          
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null
          });
        }
        
      } catch (error) {
        console.error('❌ Error initializing authentication:', error);
        
        // Clear auth data on error
        AuthUtils.clearAuth();
        
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null
        });
      }
    };

    // Initialize authentication with a small delay
    const timer = setTimeout(initializeAuth, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // =====================================
  // EVENT HANDLERS
  // =====================================

  /**
   * Handle successful login
   * @param {Object} loginResponse - Login response from API
   */
  const handleLoginSuccess = async (loginResponse) => {
    try {
      console.log('✅ Login successful:', loginResponse);
      
      const { user, token } = loginResponse;
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
        error: null
      });
      
      console.log('🎉 User authenticated and dashboard ready');
      
    } catch (error) {
      console.error('❌ Login success handler error:', error);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la finalisation de la connexion'
      }));
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out user...');
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Logout through API service
      await ApiService.logout();
      
      // Reset authentication state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null
      });
      
      console.log('✅ Logout completed successfully');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Force logout even if API call fails
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null
      });
    }
  };

  /**
   * Handle authentication errors
   * @param {Error} error - Authentication error
   */
  const handleAuthError = (error) => {
    console.error('❌ Authentication error:', error);
    
    setAuthState(prev => ({
      ...prev,
      isLoading: false,
      error: error.userMessage || error.message || 'Erreur d\'authentification'
    }));
  };

  /**
   * Retry initialization
   */
  const handleRetry = () => {
    initializeApp();
  };

  // =====================================
  // RENDER FUNCTIONS
  // =====================================

  /**
   * Loading screen component
   */
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        {/* App Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Building2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            ENSF Wallet
          </h1>
          <p className="text-blue-200 text-sm mt-2">Administration Dashboard</p>
        </div>
        
        {/* Loading Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Loader className="h-6 w-6 animate-spin" />
          <span className="text-lg">Initialisation...</span>
        </div>
        
        {/* Loading Steps */}
        <div className="space-y-2 text-sm text-blue-200">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p>Vérification de l'authentification...</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <p>Validation des tokens...</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <p>Chargement de l'interface...</p>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Error screen component
   */
  const ErrorScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
      <div className="text-center text-white max-w-md mx-auto p-6">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold">Erreur</h1>
          <p className="text-red-200 text-sm mt-2">Une erreur s'est produite</p>
        </div>
        
        {/* Error Message */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <p className="text-sm">{authState.error}</p>
        </div>
        
        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="bg-white text-red-800 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  // =====================================
  // MAIN RENDER LOGIC
  // =====================================

  // Show error screen if there's an initialization error
  if (authState.error && !authState.isAuthenticated) {
    return <ErrorScreen />;
  }

  // Show loading screen while checking authentication
  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // Show login page if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <AdminLoginPage
        onLoginSuccess={handleLoginSuccess}
        onError={handleAuthError}
        apiService={ApiService}
      />
    );
  }

  // Show dashboard if authenticated
  return (
    <div className="App">
      <ComprehensiveAdminDashboard
        user={authState.user}
        token={authState.token}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;