import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, LogIn, Building2, Shield, AlertCircle, 
  CheckCircle, Loader, User, Lock 
} from 'lucide-react';

/**
 * 🔐 Professional Admin Login Component
 * 
 * Features:
 * - JWT token authentication with AgenceService
 * - Professional input validation and error handling
 * - Loading states and user feedback
 * - Responsive design with modern UI
 * - Integration with backend auth endpoints
 * - Secure token storage and management
 */
const AdminLoginPage = ({ onLoginSuccess }) => {
  // =====================================
  // STATE MANAGEMENT
  // =====================================
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [state, setState] = useState({
    isLoading: false,
    showPassword: false,
    errorMessage: '',
    successMessage: ''
  });

  // =====================================
  // AUTHENTICATION SERVICE
  // =====================================
  
  /**
   * Professional Authentication API service
   */
  const AuthService = {
    // API Configuration - Update these URLs based on your environment
    BASE_URL: import.meta.env.VITE_AGENCE_SERVICE_URL || 'http://localhost:8092',
    
    /**
     * Login to AgenceService backend
     */
   async login(credentials) {
    try {
        console.log('🔐 Attempting login to AgenceService...');

        const response = await fetch(`${this.BASE_URL}/api/v1/agence/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            username: credentials.username,
            password: credentials.password
        }),
        credentials: 'include' // Optional: if you’re using cookies/session (JWT usually doesn’t need this)
        });

        console.log('📡 Response status:', response.status);

        // Handle different response codes
        if (response.status === 401) {
          throw new Error('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
        }
        
        if (response.status === 403) {
          throw new Error('Accès refusé. Votre compte n\'a pas les permissions nécessaires.');
        }
        
        if (response.status === 404) {
          throw new Error('Service d\'authentification non disponible. Contactez l\'administrateur.');
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Login response received');
        
        // Validate response structure
        if (!data.accessToken) {
          throw new Error('Token d\'authentification manquant dans la réponse du serveur');
        }

        return {
          success: true,
          token: data.accessToken,
          user: { username: data.username,
            email: data.email,
            nom: data.nom,
            prenom: data.prenom,
            roles: data.roles,
            idAgence: data.idAgence,
            nomAgence: data.nomAgence,
            accessToken: data.accessToken },
          message: data.message || 'Connexion réussie'
        };
        
      } catch (error) {
        console.error('❌ Authentication error:', error);
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          return {
            success: false,
            error: 'Impossible de joindre le serveur. Vérifiez votre connexion réseau.'
          };
        }
        
        return {
          success: false,
          error: error.message || 'Erreur de connexion inconnue'
        };
      }
    },

    /**
     * Store authentication data securely
     */
    storeAuth(token, user) {
      try {
        // Store in localStorage with timestamp
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('loginTimestamp', Date.now().toString());
        
        // Set global auth header for API calls
        window.authToken = token;
        
        console.log('✅ Authentication data stored successfully');
        return true;
      } catch (error) {
        console.error('❌ Error storing auth data:', error);
        return false;
      }
    },

    /**
     * Validate JWT token structure
     */
    isValidJwtStructure(token) {
      if (!token || typeof token !== 'string') return false;
      
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // Decode and validate payload
        const payload = JSON.parse(atob(parts[1]));
        return payload && payload.exp && payload.exp > Date.now() / 1000;
      } catch {
        return false;
      }
    }
  };

  // =====================================
  // EVENT HANDLERS
  // =====================================
  
  /**
   * Handle input changes with real-time validation
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));

    // Clear error message when user starts typing
    if (state.errorMessage) {
      setState(prev => ({ ...prev, errorMessage: '' }));
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setState(prev => ({ 
      ...prev, 
      showPassword: !prev.showPassword 
    }));
  };

  /**
   * Validate form inputs with professional rules
   */
  const validateForm = () => {
    const { username, password } = formData;
    
    if (!username || username.length < 3) {
      setState(prev => ({ 
        ...prev, 
        errorMessage: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' 
      }));
      return false;
    }
    
    if (!password || password.length < 6) {
      setState(prev => ({ 
        ...prev, 
        errorMessage: 'Le mot de passe doit contenir au moins 6 caractères' 
      }));
      return false;
    }
    
    return true;
  };

  /**
   * Handle form submission with comprehensive error handling
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    // Set loading state
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      errorMessage: '', 
      successMessage: '' 
    }));
    
    try {
      console.log('🚀 Starting login process...');
      
      // Attempt login
      const result = await AuthService.login(formData);
      
      if (result.success) {
        console.log('✅ Login successful');
        
        // Validate token structure
        if (!AuthService.isValidJwtStructure(result.token)) {
          throw new Error('Token d\'authentification invalide reçu du serveur');
        }
        
        // Store authentication data
        const stored = AuthService.storeAuth(result.token, result.user);
        if (!stored) {
          throw new Error('Erreur lors de la sauvegarde des données d\'authentification');
        }
        
        // Show success message
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          successMessage: result.message
        }));
        
        // Notify parent component if callback provided
        if (onLoginSuccess) {
          onLoginSuccess(result.token, result.user);
        } else {
          // Fallback: reload page after short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
        
      } else {
        // Handle login failure
        console.log('❌ Login failed:', result.error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          errorMessage: result.error
        }));
      }
      
    } catch (error) {
      console.error('❌ Login submission error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        errorMessage: error.message || 'Erreur lors de la connexion. Veuillez réessayer.'
      }));
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !state.isLoading) {
      handleSubmit(e);
    }
  };

  // =====================================
  // COMPONENT LIFECYCLE
  // =====================================
  
  useEffect(() => {
    // Focus on username field when component mounts
    document.getElementById('username')?.focus();
  }, []);

  // =====================================
  // RENDER COMPONENT
  // =====================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Panel - Professional Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-center">
            <div className="text-center lg:text-left">
              
              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                  <Building2 className="h-12 w-12" />
                </div>
              </div>
              
              {/* Branding */}
              <h1 className="text-4xl font-bold mb-4">
                ENSF Wallet
              </h1>
              <h2 className="text-xl font-semibold mb-6 text-blue-100">
                Administration Dashboard
              </h2>
              <p className="text-blue-100 leading-relaxed mb-8">
                Plateforme sécurisée de gestion bancaire professionnelle. 
                Accédez à votre tableau de bord administrateur pour superviser 
                les opérations, gérer les utilisateurs et approuver les documents.
              </p>
              
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-200 flex-shrink-0" />
                  <span className="text-blue-100">Authentification sécurisée</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-200 flex-shrink-0" />
                  <span className="text-blue-100">Gestion centralisée des utilisateurs</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-200 flex-shrink-0" />
                  <span className="text-blue-100">Contrôle qualité et validation</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Panel - Login Form */}
          <div className="lg:w-1/2 p-12">
            <div className="max-w-sm mx-auto">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Connexion Administrateur
                </h3>
                <p className="text-gray-600">
                  Saisissez vos identifiants pour accéder au tableau de bord
                </p>
              </div>

              {/* Error/Success Messages */}
              {state.errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{state.errorMessage}</span>
                  </div>
                </div>
              )}
              
              {state.successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 text-sm">{state.successMessage}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <div className="space-y-6" onKeyPress={handleKeyPress}>
                
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Entrez votre nom d'utilisateur"
                      disabled={state.isLoading}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={state.showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Entrez votre mot de passe"
                      disabled={state.isLoading}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      disabled={state.isLoading}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:text-gray-300"
                      tabIndex={-1}
                    >
                      {state.showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={state.isLoading || !formData.username || !formData.password}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {state.isLoading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Se connecter</span>
                    </>
                  )}
                </button>
              </div>

              {/* Footer Info */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  Système sécurisé - Accès réservé aux administrateurs autorisés
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Version 1.0.0 - ENSF Banking Platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;