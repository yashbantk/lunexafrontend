// Authentication configuration with security best practices

import type { AuthConfig } from '@/types/auth';

export const authConfig: AuthConfig = {
  // Token configuration
  tokenRefreshThreshold: 5, // Refresh token 5 minutes before expiry
  maxRefreshAttempts: 3,
  
  // Security configuration
  maxLoginAttempts: 5,
  lockoutDuration: 15, // 15 minutes lockout
  sessionTimeout: 30, // 30 minutes session timeout
  
  // Storage configuration
  storageKey: 'deyor_auth',
  useSecureStorage: true, // Use httpOnly cookies in production
  
  // API configuration
  refreshEndpoint: '/api/auth/refresh',
  logoutEndpoint: '/api/auth/logout',
  
  // Feature flags
  enableAuditLogging: true,
  enableSessionManagement: true,
  enableRateLimiting: true,
};

// Storage keys
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
  SESSION: 'auth_session',
  LAST_ACTIVITY: 'auth_last_activity',
} as const;

// Security constants
export const SECURITY_CONSTANTS = {
  // Token expiry times (in minutes)
  ACCESS_TOKEN_EXPIRY: 15, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60, // 7 days
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15, // 15 minutes
  MAX_REQUESTS_PER_WINDOW: 100,
  
  // Session management
  SESSION_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
  INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  REQUIRE_SPECIAL_CHARS: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  
  // Email validation
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Name validation
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  NAME_REGEX: /^[a-zA-Z\s'-]+$/,
} as const;

// Error codes for consistent error handling
export const AUTH_ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation errors
  EMAIL_REQUIRED: 'EMAIL_REQUIRED',
  EMAIL_INVALID: 'EMAIL_INVALID',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
  NAME_REQUIRED: 'NAME_REQUIRED',
  NAME_INVALID: 'NAME_INVALID',
  TERMS_NOT_ACCEPTED: 'TERMS_NOT_ACCEPTED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Security errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  
  // System errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
} as const;

// Audit event types
export const AUDIT_EVENT_TYPES = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  SIGNUP_SUCCESS: 'signup_success',
  SIGNUP_FAILED: 'signup_failed',
  TOKEN_REFRESH: 'token_refresh',
  TOKEN_REFRESH_FAILED: 'token_refresh_failed',
  SESSION_EXPIRED: 'session_expired',
  ACCOUNT_LOCKED: 'account_locked',
  PASSWORD_CHANGE: 'password_change',
  PROFILE_UPDATE: 'profile_update',
  SECURITY_VIOLATION: 'security_violation',
} as const;
