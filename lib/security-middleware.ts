import { securityService } from './security';
import { AppError, AuthenticationError, AuthorizationError } from './error-handling';

// Security middleware for API requests
export class SecurityMiddleware {
  // Authentication middleware
  static authenticate() {
    return async (req: any, res: any, next: any) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new AuthenticationError('No authentication token provided');
        }

        const token = authHeader.substring(7);
        const session = securityService.validateSession(token);

        if (!session) {
          throw new AuthenticationError('Invalid or expired token');
        }

        // Attach user info to request
        req.user = { id: session.userId };
        req.session = session;
        
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Authorization middleware
  static authorize(requiredRole?: string) {
    return async (req: any, res: any, next: any) => {
      try {
        if (!req.user) {
          throw new AuthenticationError('User not authenticated');
        }

        // In a real implementation, you'd check user roles from database
        // For now, we'll assume all authenticated users have basic access
        if (requiredRole) {
          // TODO: Implement role-based access control
          // const userRole = await getUserRole(req.user.id);
          // if (userRole !== requiredRole) {
          //   throw new AuthorizationError('Insufficient permissions');
          // }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Rate limiting middleware
  static rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (req: any, res: any, next: any) => {
      const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const now = Date.now();
      const clientRequests = requests.get(clientId);

      if (!clientRequests || now > clientRequests.resetTime) {
        // Reset window
        requests.set(clientId, {
          count: 1,
          resetTime: now + windowMs,
        });
        return next();
      }

      if (clientRequests.count >= maxRequests) {
        const resetIn = Math.ceil((clientRequests.resetTime - now) / 1000);
        res.set('Retry-After', resetIn.toString());
        throw new AppError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
      }

      clientRequests.count++;
      next();
    };
  }

  // CSRF protection middleware
  static csrfProtection() {
    return (req: any, res: any, next: any) => {
      // Skip CSRF for GET, HEAD, OPTIONS requests
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const csrfToken = req.headers['x-csrf-token'];
      const sessionToken = req.session?.accessToken;

      if (!csrfToken || !sessionToken) {
        throw new AppError('CSRF token missing', 'CSRF_TOKEN_MISSING', 403);
      }

      if (!securityService.validateCSRFToken(csrfToken, sessionToken)) {
        throw new AppError('Invalid CSRF token', 'CSRF_TOKEN_INVALID', 403);
      }

      next();
    };
  }

  // Input validation middleware
  static validateInput(schema: any) {
    return (req: any, res: any, next: any) => {
      try {
        // Validate request body
        if (req.body && schema.body) {
          const { error } = schema.body.validate(req.body);
          if (error) {
            throw new AppError(`Invalid input: ${error.details[0].message}`, 'VALIDATION_ERROR', 400);
          }
        }

        // Validate query parameters
        if (req.query && schema.query) {
          const { error } = schema.query.validate(req.query);
          if (error) {
            throw new AppError(`Invalid query: ${error.details[0].message}`, 'VALIDATION_ERROR', 400);
          }
        }

        // Validate path parameters
        if (req.params && schema.params) {
          const { error } = schema.params.validate(req.params);
          if (error) {
            throw new AppError(`Invalid parameters: ${error.details[0].message}`, 'VALIDATION_ERROR', 400);
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Security headers middleware
  static securityHeaders() {
    return (req: any, res: any, next: any) => {
      const headers = securityService.getSecurityHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        res.set(key, value);
      });
      next();
    };
  }

  // Request logging middleware
  static requestLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          userAgent: req.headers['user-agent'],
          ip: req.ip || req.headers['x-forwarded-for'],
          userId: req.user?.id,
        };

        // Log security-relevant events
        if (res.statusCode >= 400 || req.url.includes('/auth/')) {
          securityService.logSecurityEvent('api_request', req.user?.id, logData);
        }

        console.log('API Request:', JSON.stringify(logData));
      });

      next();
    };
  }

  // IP whitelist middleware
  static ipWhitelist(allowedIPs: string[]) {
    return (req: any, res: any, next: any) => {
      const clientIP = req.ip || req.headers['x-forwarded-for'];
      
      if (!allowedIPs.includes(clientIP)) {
        securityService.logSecurityEvent('unauthorized_ip_access', req.user?.id, { 
          clientIP, 
          url: req.url 
        });
        throw new AppError('Access denied from this IP', 'IP_NOT_ALLOWED', 403);
      }

      next();
    };
  }

  // Device verification middleware
  static deviceVerification() {
    return async (req: any, res: any, next: any) => {
      try {
        const deviceId = req.headers['x-device-id'];
        const session = req.session;

        if (!deviceId || !session) {
          throw new AuthenticationError('Device verification failed');
        }

        if (session.deviceId !== deviceId) {
          securityService.logSecurityEvent('device_mismatch', session.userId, {
            expectedDeviceId: session.deviceId,
            providedDeviceId: deviceId,
          });
          throw new AuthenticationError('Device verification failed');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Password strength validation middleware
  static validatePasswordStrength() {
    return (req: any, res: any, next: any) => {
      if (req.body.password) {
        const validation = securityService.validatePasswordStrength(req.body.password);
        
        if (!validation.isValid) {
          throw new AppError(
            `Password requirements not met: ${validation.errors.join(', ')}`,
            'WEAK_PASSWORD',
            400
          );
        }

        // Add password score to request for potential use
        req.passwordStrength = validation.score;
      }

      next();
    };
  }

  // Sanitize input middleware
  static sanitizeInput() {
    return (req: any, res: any, next: any) => {
      // Sanitize string inputs in body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
      }

      next();
    };
  }

  // Session timeout middleware
  static sessionTimeout() {
    return (req: any, res: any, next: any) => {
      const session = req.session;
      
      if (session) {
        const now = Date.now();
        const timeSinceLastActivity = now - session.lastActivity;
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes

        if (timeSinceLastActivity > sessionTimeout) {
          securityService.invalidateSession(session.accessToken);
          throw new AuthenticationError('Session expired due to inactivity');
        }

        // Update last activity
        session.lastActivity = now;
      }

      next();
    };
  }
}

// Helper function to sanitize object values
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = securityService.sanitizeInput(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Predefined middleware chains for common use cases
export const MiddlewareChains = {
  // For authentication endpoints
  auth: [
    SecurityMiddleware.rateLimit(10, 60000), // 10 requests per minute
    SecurityMiddleware.securityHeaders(),
    SecurityMiddleware.sanitizeInput(),
    SecurityMiddleware.requestLogger(),
  ],

  // For protected API endpoints
  protected: [
    SecurityMiddleware.rateLimit(100, 60000), // 100 requests per minute
    SecurityMiddleware.securityHeaders(),
    SecurityMiddleware.authenticate(),
    SecurityMiddleware.sessionTimeout(),
    SecurityMiddleware.csrfProtection(),
    SecurityMiddleware.sanitizeInput(),
    SecurityMiddleware.requestLogger(),
  ],

  // For admin endpoints
  admin: [
    SecurityMiddleware.rateLimit(50, 60000), // 50 requests per minute
    SecurityMiddleware.securityHeaders(),
    SecurityMiddleware.authenticate(),
    SecurityMiddleware.authorize('admin'),
    SecurityMiddleware.deviceVerification(),
    SecurityMiddleware.sessionTimeout(),
    SecurityMiddleware.csrfProtection(),
    SecurityMiddleware.sanitizeInput(),
    SecurityMiddleware.requestLogger(),
  ],

  // For sensitive operations (password change, etc.)
  sensitive: [
    SecurityMiddleware.rateLimit(5, 300000), // 5 requests per 5 minutes
    SecurityMiddleware.securityHeaders(),
    SecurityMiddleware.authenticate(),
    SecurityMiddleware.deviceVerification(),
    SecurityMiddleware.sessionTimeout(),
    SecurityMiddleware.csrfProtection(),
    SecurityMiddleware.sanitizeInput(),
    SecurityMiddleware.requestLogger(),
  ],
};
