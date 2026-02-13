import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { securityService } from './security';
import { useAuth } from './auth';
import { AppError } from './error-handling';

// Security hook for React components
export function useSecurity() {
  const { user, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [securityEvents, setSecurityEvents] = useState<Array<{
    type: string;
    message: string;
    timestamp: number;
  }>>([]);
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize security monitoring
  useEffect(() => {
    if (user) {
      startSessionMonitoring();
      startActivityTracking();
    } else {
      stopSessionMonitoring();
      stopActivityTracking();
    }

    return () => {
      stopSessionMonitoring();
      stopActivityTracking();
    };
  }, [user]);

  // Track user activity
  const trackActivity = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    activityTimeoutRef.current = setTimeout(() => {
      // User has been inactive for a period
      addSecurityEvent('inactivity_warning', 'Session will expire soon due to inactivity');
    }, 25 * 60 * 1000); // 25 minutes (5 minutes before timeout)

    // Reset session timeout
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setTimeout(() => {
      // Session expired due to inactivity
      handleSessionTimeout();
    }, 30 * 60 * 1000); // 30 minutes
  }, []);

  // Start session monitoring
  const startSessionMonitoring = useCallback(() => {
    // Set initial session timeout
    const timeout = Date.now() + (30 * 60 * 1000); // 30 minutes from now
    setSessionTimeout(timeout);
  }, []);

  // Start activity tracking
  const startActivityTracking = useCallback(() => {
    // Add event listeners for user activity
    if (Platform.OS === 'web') {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, trackActivity);
      });

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, trackActivity);
        });
      };
    }
  }, [trackActivity]);

  // Stop session monitoring
  const stopSessionMonitoring = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    setSessionTimeout(null);
  }, []);

  // Stop activity tracking
  const stopActivityTracking = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }
  }, []);

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    addSecurityEvent('session_timeout', 'Session expired due to inactivity');
    securityService.logSecurityEvent('session_timeout', user?.id);
    logout();
  }, [user, logout]);

  // Add security event
  const addSecurityEvent = useCallback((type: string, message: string) => {
    const event = {
      type,
      message,
      timestamp: Date.now(),
    };
    
    setSecurityEvents(prev => [...prev.slice(-9), event]); // Keep last 10 events
  }, []);

  // Validate password strength
  const validatePassword = useCallback((password: string) => {
    return securityService.validatePasswordStrength(password);
  }, []);

  // Generate secure token
  const generateToken = useCallback(async (length?: number) => {
    try {
      return await securityService.generateSecureToken(length);
    } catch (error) {
      addSecurityEvent('token_generation_failed', 'Failed to generate secure token');
      throw error;
    }
  }, []);

  // Sanitize input
  const sanitizeInput = useCallback((input: string) => {
    return securityService.sanitizeInput(input);
  }, []);

  // Check rate limit
  const checkRateLimit = useCallback((identifier: string) => {
    return securityService.checkRateLimit(identifier);
  }, []);

  // Get device ID
  const getDeviceId = useCallback(async () => {
    try {
      return await securityService.getDeviceId();
    } catch (error) {
      addSecurityEvent('device_id_failed', 'Failed to get device ID');
      throw error;
    }
  }, []);

  // Log security event
  const logSecurityEvent = useCallback((event: string, details?: any) => {
    securityService.logSecurityEvent(event, user?.id, details);
    addSecurityEvent(event, `Security event: ${event}`);
  }, [user?.id, addSecurityEvent]);

  // Invalidate current session
  const invalidateSession = useCallback(() => {
    if (user) {
      securityService.logSecurityEvent('session_invalidated', user.id);
      logout();
    }
  }, [user, logout]);

  // Check if session is about to expire
  const isSessionExpiringSoon = useCallback(() => {
    if (!sessionTimeout) return false;
    const timeUntilExpiry = sessionTimeout - Date.now();
    return timeUntilExpiry < 5 * 60 * 1000; // Less than 5 minutes
  }, [sessionTimeout]);

  // Get session time remaining
  const getSessionTimeRemaining = useCallback(() => {
    if (!sessionTimeout) return 0;
    return Math.max(0, sessionTimeout - Date.now());
  }, [sessionTimeout]);

  // Format time remaining for display
  const formatTimeRemaining = useCallback((milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Clear security events
  const clearSecurityEvents = useCallback(() => {
    setSecurityEvents([]);
  }, []);

  // Biometric authentication check
  const checkBiometricAvailability = useCallback(async () => {
    try {
      // This would integrate with expo-local-authentication
      // For now, return a mock implementation
      return {
        available: Platform.OS !== 'web',
        supportedMethods: Platform.OS === 'ios' ? ['touchid', 'faceid'] : ['fingerprint'],
      };
    } catch (error) {
      addSecurityEvent('biometric_check_failed', 'Failed to check biometric availability');
      return { available: false, supportedMethods: [] };
    }
  }, []);

  // Authenticate with biometrics
  const authenticateWithBiometrics = useCallback(async (reason: string = 'Authenticate to continue') => {
    try {
      // This would integrate with expo-local-authentication
      // For now, return a mock implementation
      addSecurityEvent('biometric_auth_attempt', 'Biometric authentication attempted');
      
      // Mock success - in real implementation, this would prompt for biometric auth
      return true;
    } catch (error) {
      addSecurityEvent('biometric_auth_failed', 'Biometric authentication failed');
      return false;
    }
  }, []);

  // Encrypt sensitive data
  const encryptData = useCallback(async (data: string): Promise<string> => {
    try {
      // This would integrate with expo-crypto for actual encryption
      // For now, return a mock implementation
      const salt = await securityService.generateSecureToken(16);
      const combined = data + salt;
      const hash = await require('expo-crypto').digestStringAsync(
        require('expo-crypto').CryptoDigestAlgorithm.SHA256,
        combined
      );
      return hash;
    } catch (error) {
      addSecurityEvent('encryption_failed', 'Failed to encrypt data');
      throw error;
    }
  }, []);

  // Check for suspicious activity
  const checkSuspiciousActivity = useCallback(() => {
    const recentEvents = securityEvents.filter(
      event => Date.now() - event.timestamp < 60000 // Last minute
    );

    // Check for multiple failed login attempts
    const failedLogins = recentEvents.filter(event => 
      event.type.includes('login_failed') || event.type.includes('auth_failed')
    );

    if (failedLogins.length >= 3) {
      logSecurityEvent('suspicious_activity_detected', {
        reason: 'Multiple failed authentication attempts',
        count: failedLogins.length,
      });
      return true;
    }

    return false;
  }, [securityEvents, logSecurityEvent]);

  return {
    // State
    isAuthenticated,
    securityEvents,
    sessionTimeout,
    
    // Methods
    trackActivity,
    validatePassword,
    generateToken,
    sanitizeInput,
    checkRateLimit,
    getDeviceId,
    logSecurityEvent,
    invalidateSession,
    clearSecurityEvents,
    
    // Session management
    isSessionExpiringSoon,
    getSessionTimeRemaining,
    formatTimeRemaining,
    
    // Advanced security
    checkBiometricAvailability,
    authenticateWithBiometrics,
    encryptData,
    checkSuspiciousActivity,
  };
}

// Hook for secure API calls
export function useSecureApi() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const makeSecureRequest = useCallback(async (
    url: string,
    options: RequestInit = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Add security headers
      const secureHeaders = {
        'Content-Type': 'application/json',
        'X-Device-ID': await securityService.getDeviceId(),
        ...securityService.getSecurityHeaders(),
        ...options.headers,
      };

      // Add authentication token if available
      if (user?.accessToken) {
        secureHeaders['Authorization'] = `Bearer ${user.accessToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers: secureHeaders,
      });

      if (!response.ok) {
        throw new AppError(
          `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const appError = err instanceof AppError ? err : new AppError(
        'Network request failed',
        'NETWORK_ERROR'
      );
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    makeSecureRequest,
    isLoading,
    error,
    clearError,
  };
}

// Hook for form security
export function useFormSecurity() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const lastSubmitTime = useRef<number>(0);

  const validateFormSubmission = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;

    // Prevent rapid form submissions (rate limiting)
    if (timeSinceLastSubmit < 1000) { // 1 second cooldown
      throw new AppError('Please wait before submitting again', 'RATE_LIMIT');
    }

    // Prevent too many attempts
    if (submitAttempts >= 5) {
      throw new AppError('Too many submission attempts', 'TOO_MANY_ATTEMPTS');
    }

    lastSubmitTime.current = now;
    setSubmitAttempts(prev => prev + 1);
  }, [submitAttempts]);

  const resetSubmitAttempts = useCallback(() => {
    setSubmitAttempts(0);
  }, []);

  const secureSubmit = useCallback(async (
    submitFunction: () => Promise<any>
  ) => {
    setIsSubmitting(true);
    
    try {
      validateFormSubmission();
      const result = await submitFunction();
      resetSubmitAttempts();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateFormSubmission, resetSubmitAttempts]);

  return {
    isSubmitting,
    submitAttempts,
    secureSubmit,
    resetSubmitAttempts,
  };
}
