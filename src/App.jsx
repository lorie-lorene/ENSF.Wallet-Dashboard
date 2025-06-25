import React, { useState, useEffect } from 'react';
import { Loader, Building2 } from 'lucide-react';
import ComprehensiveAdminDashboard from './components/dashboard/ComprehensiveAdminDashboard';
import AdminLoginPage from './components/auth/AdminLoginPage';
import './index.css';

/**
 * 🚀 Main Application Component with Authentication Flow
 * 
 * Features:
 * - Authentication state management
 * - Route protection for admin dashboard
 * - Loading states and error handling
 * - Professional UI transitions
 * - JWT token validation
 */
function App() {
  // =====================================
  // STATE MANAGEMENT
  // =====================================
  
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null
  });

  // =====================================
  // AUTHENTICATION SERVICE
  // =====================================
  
  /**
   * Authentication utilities
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
    }
  };

  // =====================================
  // COMPONENT LIFECYCLE
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
          console.log('✅ Valid authentication found for user:', user.username);
          
          // Set auth header for API calls
          window.authToken = token;
          
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
   */
  const handleLoginSuccess = (token, user) => {
    console.log('✅ Login successful, updating app state');
    
    // Set auth header for API calls
    window.authToken = token;
    
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: user,
      token: token
    });
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    console.log('🚪 Logging out user');
    
    // Clear authentication data
    AuthUtils.clearAuth();
    
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null
    });
  };

  // =====================================
  // LOADING SCREEN COMPONENT
  // =====================================
  
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        {/* App Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold">ENSF Wallet</h1>
          <p className="text-blue-200 text-sm">Administration Dashboard</p>
        </div>
        
        {/* Loading Indicator */}
        <div className="flex items-center justify-center gap-3">
          <Loader className="h-6 w-6 animate-spin" />
          <span className="text-lg">Initialisation...</span>
        </div>
        
        {/* Loading Steps */}
        <div className="mt-6 space-y-2 text-sm text-blue-200">
          <p>🔍 Vérification de l'authentification...</p>
          <p>🔐 Validation des tokens...</p>
          <p>⚡ Chargement de l'interface...</p>
        </div>
      </div>
    </div>
  );

  // =====================================
  // CONDITIONAL RENDERING
  // =====================================
  
  // Show loading screen while checking authentication
  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // Show login page if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <AdminLoginPage
        onLoginSuccess={handleLoginSuccess}
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