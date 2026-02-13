import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AppError } from './error-handling';

// Security configuration
const SECURITY_CONFIG = {
  // Token expiration times (in seconds)
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days
  SESSION_TIMEOUT: 30 * 60, // 30 minutes of inactivity
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW: 15 * 60, // 15 minutes
  RATE_LIMIT_WINDOW: 60, // 1 minute
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  
  // Encryption
  ENCRYPTION_ALGORITHM: 'SHA256',
  TOKEN_SECRET: 'apex-health-secret-key', // In production, use environment variables
};

// Rate limiting interface
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  windowStart: number;
}

// Security session interface
interface SecuritySession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  lastActivity: number;
  deviceId: string;
}

// In-memory rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

// In-memory session store (in production, use secure database)
const sessionStore = new Map<string, SecuritySession>();

export class SecurityService {
  private static instance: SecurityService;
  
  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Password strength validation
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
    } else {
      score += 1;
    }

    // Uppercase check
    if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Lowercase check
    if (SECURITY_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // Numbers check
    if (SECURITY_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // Special characters check
    if (SECURITY_CONFIG.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    // Common patterns check
    const commonPatterns = [
      /123456/, /password/i, /qwerty/i, /admin/i, /letmein/i,
      /abc123/i, /iloveyou/i, /monkey/i, /dragon/i, /football/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns that are not secure');
        score = Math.max(0, score - 2);
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, Math.min(5, score)),
    };
  }

  // Generate secure random token
  async generateSecureToken(length: number = 32): Promise<string> {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(length);
      return Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      throw new AppError('Failed to generate secure token', 'TOKEN_GENERATION_ERROR');
    }
  }

  // Hash password with salt
  async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    try {
      const passwordSalt = salt || await this.generateSecureToken(16);
      const combined = password + passwordSalt;
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined
      );
      return { hash, salt: passwordSalt };
    } catch (error) {
      throw new AppError('Failed to hash password', 'PASSWORD_HASH_ERROR');
    }
  }

  // Verify password against hash
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const { hash: computedHash } = await this.hashPassword(password, salt);
      return computedHash === hash;
    } catch (error) {
      return false;
    }
  }

  // Rate limiting check
  checkRateLimit(identifier: string, maxAttempts: number = 5, windowSeconds: number = 60): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry) {
      // First attempt
      rateLimitStore.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        windowStart: now,
      });
      return true;
    }

    // Check if window has expired
    if (now - entry.windowStart > windowSeconds * 1000) {
      // Reset window
      rateLimitStore.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        windowStart: now,
      });
      return true;
    }

    // Check if limit exceeded
    if (entry.attempts >= maxAttempts) {
      return false;
    }

    // Increment attempts
    entry.attempts += 1;
    return true;
  }

  // Check login attempts
  checkLoginAttempts(email: string): { allowed: boolean; attemptsRemaining: number; resetTime?: number } {
    const allowed = this.checkRateLimit(
      `login:${email}`,
      SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      SECURITY_CONFIG.LOGIN_ATTEMPT_WINDOW
    );

    const entry = rateLimitStore.get(`login:${email}`);
    const attemptsRemaining = entry ? 
      Math.max(0, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - entry.attempts) : 
      SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;

    const resetTime = entry ? 
      entry.windowStart + (SECURITY_CONFIG.LOGIN_ATTEMPT_WINDOW * 1000) : 
      undefined;

    return { allowed, attemptsRemaining, resetTime };
  }

  // Create security session
  async createSession(userId: string, deviceId: string): Promise<SecuritySession> {
    const now = Date.now();
    const session: SecuritySession = {
      userId,
      accessToken: await this.generateSecureToken(),
      refreshToken: await this.generateSecureToken(),
      expiresAt: now + (SECURITY_CONFIG.ACCESS_TOKEN_EXPIRY * 1000),
      lastActivity: now,
      deviceId,
    };

    sessionStore.set(session.accessToken, session);
    
    // Store refresh token separately
    await this.storeRefreshToken(session.refreshToken, userId);
    
    return session;
  }

  // Validate session
  validateSession(accessToken: string): SecuritySession | null {
    const session = sessionStore.get(accessToken);
    
    if (!session) {
      return null;
    }

    const now = Date.now();
    
    // Check if token expired
    if (now > session.expiresAt) {
      sessionStore.delete(accessToken);
      return null;
    }

    // Check session timeout
    if (now - session.lastActivity > SECURITY_CONFIG.SESSION_TIMEOUT * 1000) {
      sessionStore.delete(accessToken);
      return null;
    }

    // Update last activity
    session.lastActivity = now;
    return session;
  }

  // Refresh session
  async refreshSession(refreshToken: string): Promise<SecuritySession | null> {
    try {
      const userId = await this.getStoredRefreshToken(refreshToken);
      if (!userId) {
        return null;
      }

      const deviceId = await this.getDeviceId();
      const newSession = await this.createSession(userId, deviceId);
      
      // Remove old refresh token
      await this.removeRefreshToken(refreshToken);
      
      return newSession;
    } catch (error) {
      return null;
    }
  }

  // Invalidate session
  invalidateSession(accessToken: string): void {
    const session = sessionStore.get(accessToken);
    if (session) {
      sessionStore.delete(accessToken);
      this.removeRefreshToken(session.refreshToken);
    }
  }

  // Invalidate all user sessions
  async invalidateAllUserSessions(userId: string): Promise<void> {
    for (const [token, session] of sessionStore.entries()) {
      if (session.userId === userId) {
        sessionStore.delete(token);
        await this.removeRefreshToken(session.refreshToken);
      }
    }
  }

  // Secure storage helpers
  private async storeRefreshToken(token: string, userId: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage for web (less secure, but necessary)
      localStorage.setItem(`refresh_token_${userId}`, token);
    } else {
      await SecureStore.setItemAsync(`refresh_token_${userId}`, token);
    }
  }

  private async getStoredRefreshToken(token: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('refresh_token_')) {
          const storedToken = localStorage.getItem(key);
          if (storedToken === token) {
            return key.replace('refresh_token_', '');
          }
        }
      }
      return null;
    } else {
      // For native, we'd need to iterate through secure store
      // This is simplified - in production, maintain a mapping
      return null;
    }
  }

  private async removeRefreshToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('refresh_token_')) {
          const storedToken = localStorage.getItem(key);
          if (storedToken === token) {
            localStorage.removeItem(key);
            break;
          }
        }
      }
    } else {
      // Native implementation would be similar
    }
  }

  // Get device ID for fingerprinting
  async getDeviceId(): Promise<string> {
    const storedDeviceId = Platform.OS === 'web' ? 
      localStorage.getItem('device_id') : 
      await SecureStore.getItemAsync('device_id');

    if (storedDeviceId) {
      return storedDeviceId;
    }

    const newDeviceId = await this.generateSecureToken();
    if (Platform.OS === 'web') {
      localStorage.setItem('device_id', newDeviceId);
    } else {
      await SecureStore.setItemAsync('device_id', newDeviceId);
    }

    return newDeviceId;
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  // Generate CSRF token
  async generateCSRFToken(): Promise<string> {
    return await this.generateSecureToken(24);
  }

  // Validate CSRF token
  validateCSRFToken(token: string, sessionToken: string): boolean {
    // In production, store CSRF tokens in session and validate
    return token.length === 48 && sessionToken.length > 0;
  }

  // Security headers for API requests
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
    };
  }

  // Log security events
  logSecurityEvent(event: string, userId?: string, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      details,
      level: this.getSecurityEventLevel(event),
    };

    // In production, send to security monitoring service
    if (!__DEV__) {
      console.warn('Security Event:', JSON.stringify(logEntry));
    } else {
      console.log('Security Event (Dev):', logEntry);
    }
  }

  private getSecurityEventLevel(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = ['account_breach', 'data_exfiltration', 'privilege_escalation'];
    const highEvents = ['multiple_failed_logins', 'suspicious_activity', 'session_hijack'];
    const mediumEvents = ['password_change', 'login_attempt', 'session_expiry'];

    if (criticalEvents.includes(event)) return 'critical';
    if (highEvents.includes(event)) return 'high';
    if (mediumEvents.includes(event)) return 'medium';
    return 'low';
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [token, session] of sessionStore.entries()) {
      if (now > session.expiresAt) {
        sessionStore.delete(token);
      }
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
