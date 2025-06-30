/**
 * 🌐 HTTP Client Service
 * 
 * Core HTTP client with advanced features:
 * - Automatic retry mechanisms with exponential backoff
 * - JWT token management and automatic header injection
 * - Request/response interceptors for logging and error handling
 * - Timeout configuration and request cancellation
 * - Environment-based configuration
 * 
 * @author ENSF Wallet Development Team
 * @version 1.0.0
 * @since 2024
 */

import { 
  HTTP_STATUS, 
  TIMEOUT_CONFIG, 
  RETRY_CONFIG, 
  ERROR_MESSAGES 
} from '../config/apiConfig.js';

/**
 * Custom HTTP Client Class
 * Provides a standardized way to make HTTP requests with built-in error handling
 */
class HttpClient {
  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    // Add default interceptors
    this.addDefaultInterceptors();
  }

  /**
   * Add default request and response interceptors
   */
  addDefaultInterceptors() {
    // Request interceptor for logging
    this.addRequestInterceptor((config) => {
      console.log(`🔄 [${config.method?.toUpperCase()}] ${config.url}`, {
        headers: config.headers,
        body: config.body
      });
      return config;
    });

    // Response interceptor for logging
    this.addResponseInterceptor(
      (response) => {
        console.log(`✅ [${response.status}] ${response.url}`, response.data);
        return response;
      },
      (error) => {
        console.error(`❌ HTTP Error:`, error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Function to modify request config
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   * @param {Function} onSuccess - Success handler
   * @param {Function} onError - Error handler
   */
  addResponseInterceptor(onSuccess, onError) {
    this.responseInterceptors.push({ onSuccess, onError });
  }

  /**
   * Apply request interceptors
   * @param {Object} config - Request configuration
   * @returns {Object} Modified configuration
   */
  applyRequestInterceptors(config) {
    return this.requestInterceptors.reduce((acc, interceptor) => {
      return interceptor(acc) || acc;
    }, config);
  }

  /**
   * Apply response interceptors
   * @param {Response} response - HTTP response
   * @returns {Promise} Processed response
   */
  async applyResponseInterceptors(response) {
    for (const interceptor of this.responseInterceptors) {
      try {
        if (response.ok && interceptor.onSuccess) {
          response = await interceptor.onSuccess(response);
        }
      } catch (error) {
        if (interceptor.onError) {
          await interceptor.onError(error);
        }
        throw error;
      }
    }
    return response;
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    if (token) {
      this.baseHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.baseHeaders['Authorization'];
    }
  }

  /**
   * Create request configuration
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Object} Request configuration
   */
  createRequestConfig(url, options = {}) {
    const config = {
      url,
      method: options.method || 'GET',
      headers: {
        ...this.baseHeaders,
        ...options.headers
      },
      signal: options.signal,
      ...options
    };

    // Apply request interceptors
    return this.applyRequestInterceptors(config);
  }

  /**
   * Sleep function for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param {number} attempt - Current attempt number
   * @returns {number} Delay in milliseconds
   */
  calculateRetryDelay(attempt) {
    if (!RETRY_CONFIG.EXPONENTIAL_BACKOFF) {
      return RETRY_CONFIG.RETRY_DELAY;
    }
    return RETRY_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error object
   * @returns {boolean} Whether error is retryable
   */
  isRetryableError(error) {
    // Network errors and 5xx errors are retryable
    return (
      !error.response || 
      error.response.status >= 500 ||
      error.response.status === 408 // Request Timeout
    );
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async makeRequest(url, options = {}) {
    const maxRetries = options.maxRetries || RETRY_CONFIG.MAX_RETRIES;
    const timeout = options.timeout || TIMEOUT_CONFIG.DEFAULT;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Create request configuration
        const config = this.createRequestConfig(url, {
          ...options,
          signal: controller.signal
        });

        // Make the request
        const response = await fetch(config.url, config);
        
        // Clear timeout
        clearTimeout(timeoutId);

        // Apply response interceptors
        await this.applyResponseInterceptors(response);

        // Handle HTTP errors
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.response = response;
          error.status = response.status;
          
          // Parse error response if possible
          try {
            const errorData = await response.json();
            error.data = errorData;
          } catch (parseError) {
            // Ignore parse errors for error responses
          }
          
          throw error;
        }

        // Parse response data
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          url: response.url
        };

      } catch (error) {
        console.error(`❌ Request failed (attempt ${attempt}/${maxRetries}):`, error);

        // If this is the last attempt or error is not retryable, throw the error
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          // Enhance error with user-friendly message
          error.userMessage = this.getErrorMessage(error);
          throw error;
        }

        // Wait before retry
        const delay = this.calculateRetryDelay(attempt);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    if (error.name === 'AbortError') {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    
    if (!error.response) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    switch (error.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  /**
   * GET request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async get(url, options = {}) {
    return this.makeRequest(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async post(url, data, options = {}) {
    return this.makeRequest(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async put(url, data, options = {}) {
    return this.makeRequest(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * PATCH request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async patch(url, data, options = {}) {
    return this.makeRequest(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async delete(url, options = {}) {
    return this.makeRequest(url, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file
   * @param {string} url - Upload URL
   * @param {FormData} formData - Form data with file
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async upload(url, formData, options = {}) {
    const headers = { ...this.baseHeaders };
    delete headers['Content-Type']; // Let browser set content-type for FormData

    return this.makeRequest(url, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
      timeout: TIMEOUT_CONFIG.UPLOAD
    });
  }
}

// Create and export singleton instance
const httpClient = new HttpClient();
export default httpClient;