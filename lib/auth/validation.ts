// Comprehensive validation utilities for authentication

import { SECURITY_CONSTANTS, AUTH_ERROR_CODES } from './config';
import type { LoginCredentials, SignupCredentials, AuthError } from '@/types/auth';

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: AuthError[];
}

/**
 * Create a validation error
 */
function createError(code: string, message: string, field?: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): AuthError {
  return {
    code,
    message,
    field,
    timestamp: Date.now(),
    severity,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: AuthError } {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: createError(AUTH_ERROR_CODES.EMAIL_REQUIRED, 'Email is required', 'email', 'high'),
    };
  }

  const trimmedEmail = email.trim();
  
  if (!SECURITY_CONSTANTS.EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: createError(AUTH_ERROR_CODES.EMAIL_INVALID, 'Please enter a valid email address', 'email', 'medium'),
    };
  }

  // Additional email validation
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: createError(AUTH_ERROR_CODES.EMAIL_INVALID, 'Email address is too long', 'email', 'medium'),
    };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: AuthError[] } {
  const errors: AuthError[] = [];

  if (!password) {
    errors.push(createError(AUTH_ERROR_CODES.PASSWORD_REQUIRED, 'Password is required', 'password', 'high'));
    return { isValid: false, errors };
  }

  // Length validation
  if (password.length < SECURITY_CONSTANTS.MIN_PASSWORD_LENGTH) {
    errors.push(createError(
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
      `Password must be at least ${SECURITY_CONSTANTS.MIN_PASSWORD_LENGTH} characters long`,
      'password',
      'high'
    ));
  }

  if (password.length > SECURITY_CONSTANTS.MAX_PASSWORD_LENGTH) {
    errors.push(createError(
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
      `Password must be no more than ${SECURITY_CONSTANTS.MAX_PASSWORD_LENGTH} characters long`,
      'password',
      'medium'
    ));
  }

  // Character requirements
  if (SECURITY_CONSTANTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push(createError(
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
      'Password must contain at least one uppercase letter',
      'password',
      'medium'
    ));
  }

  if (SECURITY_CONSTANTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push(createError(
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
      'Password must contain at least one lowercase letter',
      'password',
      'medium'
    ));
  }

  if (SECURITY_CONSTANTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push(createError(
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
      'Password must contain at least one number',
      'password',
      'medium'
    ));
  }

  if (SECURITY_CONSTANTS.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(createError(
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
      'Password must contain at least one special character',
      'password',
      'medium'
    ));
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push(createError(
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
      'Password is too common. Please choose a more secure password',
      'password',
      'high'
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate name field
 */
export function validateName(name: string, fieldName: 'firstName' | 'lastName'): { isValid: boolean; error?: AuthError } {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: createError(AUTH_ERROR_CODES.NAME_REQUIRED, `${fieldName} is required`, fieldName, 'high'),
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < SECURITY_CONSTANTS.MIN_NAME_LENGTH) {
    return {
      isValid: false,
      error: createError(
        AUTH_ERROR_CODES.NAME_INVALID,
        `${fieldName} must be at least ${SECURITY_CONSTANTS.MIN_NAME_LENGTH} characters long`,
        fieldName,
        'medium'
      ),
    };
  }

  if (trimmedName.length > SECURITY_CONSTANTS.MAX_NAME_LENGTH) {
    return {
      isValid: false,
      error: createError(
        AUTH_ERROR_CODES.NAME_INVALID,
        `${fieldName} must be no more than ${SECURITY_CONSTANTS.MAX_NAME_LENGTH} characters long`,
        fieldName,
        'medium'
      ),
    };
  }

  if (!SECURITY_CONSTANTS.NAME_REGEX.test(trimmedName)) {
    return {
      isValid: false,
      error: createError(
        AUTH_ERROR_CODES.NAME_INVALID,
        `${fieldName} contains invalid characters`,
        fieldName,
        'medium'
      ),
    };
  }

  return { isValid: true };
}

/**
 * Validate login credentials
 */
export function validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
  const errors: AuthError[] = [];

  // Validate email
  const emailValidation = validateEmail(credentials.email);
  if (!emailValidation.isValid && emailValidation.error) {
    errors.push(emailValidation.error);
  }

  // Validate password
  const passwordValidation = validatePassword(credentials.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate signup credentials
 */
export function validateSignupCredentials(credentials: SignupCredentials): ValidationResult {
  const errors: AuthError[] = [];

  // Validate email
  const emailValidation = validateEmail(credentials.email);
  if (!emailValidation.isValid && emailValidation.error) {
    errors.push(emailValidation.error);
  }

  // Validate first name
  const firstNameValidation = validateName(credentials.firstName, 'firstName');
  if (!firstNameValidation.isValid && firstNameValidation.error) {
    errors.push(firstNameValidation.error);
  }

  // Validate last name
  const lastNameValidation = validateName(credentials.lastName, 'lastName');
  if (!lastNameValidation.isValid && lastNameValidation.error) {
    errors.push(lastNameValidation.error);
  }

  // Validate password
  const passwordValidation = validatePassword(credentials.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  // Validate password confirmation
  if (credentials.password !== credentials.confirmPassword) {
    errors.push(createError(
      AUTH_ERROR_CODES.PASSWORD_MISMATCH,
      'Passwords do not match',
      'confirmPassword',
      'high'
    ));
  }

  // Validate terms acceptance
  if (!credentials.acceptTerms) {
    errors.push(createError(
      AUTH_ERROR_CODES.TERMS_NOT_ACCEPTED,
      'You must accept the terms and conditions',
      'acceptTerms',
      'high'
    ));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize input data
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  // In production, implement proper CSRF token validation
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement proper CSRF token validation
    return token.length > 0;
  }
  
  // Development: basic validation
  return token.length > 0;
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(attempts: number, windowStart: number): { isValid: boolean; error?: AuthError } {
  const now = Date.now();
  const windowDuration = SECURITY_CONSTANTS.RATE_LIMIT_WINDOW * 60 * 1000; // Convert to milliseconds
  
  // Reset if window has passed
  if (now - windowStart > windowDuration) {
    return { isValid: true };
  }
  
  if (attempts >= SECURITY_CONSTANTS.MAX_REQUESTS_PER_WINDOW) {
    return {
      isValid: false,
      error: createError(
        AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Too many requests. Please try again later.',
        undefined,
        'high'
      ),
    };
  }
  
  return { isValid: true };
}

/**
 * Validate session timeout
 */
export function validateSessionTimeout(lastActivity: number): { isValid: boolean; error?: AuthError } {
  const now = Date.now();
  const timeout = SECURITY_CONSTANTS.INACTIVITY_TIMEOUT;
  
  if (now - lastActivity > timeout) {
    return {
      isValid: false,
      error: createError(
        AUTH_ERROR_CODES.SESSION_EXPIRED,
        'Session has expired due to inactivity',
        undefined,
        'medium'
      ),
    };
  }
  
  return { isValid: true };
}

/**
 * Validate token expiry
 */
export function validateTokenExpiry(expiresAt: number): { isValid: boolean; error?: AuthError } {
  const now = Date.now();
  
  if (now >= expiresAt) {
    return {
      isValid: false,
      error: createError(
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        'Authentication token has expired',
        undefined,
        'medium'
      ),
    };
  }
  
  return { isValid: true };
}

/**
 * Check if token needs refresh
 */
export function shouldRefreshToken(expiresAt: number): boolean {
  const now = Date.now();
  const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  return (expiresAt - now) <= refreshThreshold;
}
