// Unit tests for authentication validation utilities

import {
  validateEmail,
  validatePassword,
  validateName,
  validateLoginCredentials,
  validateSignupCredentials,
  sanitizeInput,
  validateCSRFToken,
  validateRateLimit,
  validateSessionTimeout,
  validateTokenExpiry,
  shouldRefreshToken,
} from '@/lib/auth/validation';
import { AUTH_ERROR_CODES } from '@/lib/auth/config';

describe('Authentication Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example',
        'test@.com',
        'test@example..com',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error?.code).toBeOneOf([AUTH_ERROR_CODES.EMAIL_REQUIRED, AUTH_ERROR_CODES.EMAIL_INVALID]);
      });
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.EMAIL_INVALID);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MyStr0ng#Pass',
        'ComplexP@ssw0rd',
        'Test123$',
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        '', // empty
        '123456', // too short, no letters
        'password', // no numbers, no special chars
        'Password', // no numbers, no special chars
        'password123', // no special chars, no uppercase
        'PASSWORD123', // no special chars, no lowercase
        'Pass123', // too short
        'a'.repeat(130), // too long
      ];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should reject common passwords', () => {
      const commonPasswords = [
        'password',
        '123456',
        'qwerty',
        'abc123',
        'password123',
        'admin',
      ];

      commonPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.code === AUTH_ERROR_CODES.PASSWORD_TOO_WEAK)).toBe(true);
      });
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      const validNames = [
        'John',
        'Mary-Jane',
        "O'Connor",
        'José',
        'Jean-Pierre',
        'Li Wei',
      ];

      validNames.forEach(name => {
        const result = validateName(name, 'firstName');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = [
        '', // empty
        'A', // too short
        'a'.repeat(51), // too long
        'John123', // contains numbers
        'John@Doe', // contains special chars
        'John<script>', // contains HTML
      ];

      invalidNames.forEach(name => {
        const result = validateName(name, 'firstName');
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('validateLoginCredentials', () => {
    it('should validate correct login credentials', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!',
        rememberMe: false,
      };

      const result = validateLoginCredentials(credentials);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid login credentials', () => {
      const invalidCredentials = [
        { email: '', password: 'Password123!' },
        { email: 'invalid-email', password: 'Password123!' },
        { email: 'test@example.com', password: '' },
        { email: 'test@example.com', password: 'weak' },
      ];

      invalidCredentials.forEach(credentials => {
        const result = validateLoginCredentials(credentials);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateSignupCredentials', () => {
    it('should validate correct signup credentials', () => {
      const credentials = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      };

      const result = validateSignupCredentials(credentials);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid signup credentials', () => {
      const invalidCredentials = [
        { email: '', firstName: 'John', lastName: 'Doe', password: 'Password123!', confirmPassword: 'Password123!', acceptTerms: true },
        { email: 'test@example.com', firstName: '', lastName: 'Doe', password: 'Password123!', confirmPassword: 'Password123!', acceptTerms: true },
        { email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'Password123!', confirmPassword: 'Different123!', acceptTerms: true },
        { email: 'test@example.com', firstName: 'John', lastName: 'Doe', password: 'Password123!', confirmPassword: 'Password123!', acceptTerms: false },
      ];

      invalidCredentials.forEach(credentials => {
        const result = validateSignupCredentials(credentials);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize malicious input', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'onclick="alert(\'xss\')"',
        'test<script>alert("xss")</script>test',
      ];

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onclick=');
      });
    });

    it('should preserve valid input', () => {
      const validInputs = [
        'John Doe',
        'test@example.com',
        'Valid Input 123',
      ];

      validInputs.forEach(input => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).toBe(input.trim());
      });
    });
  });

  describe('validateRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const now = Date.now();
      const result = validateRateLimit(5, now - 1000); // 5 requests in last second
      expect(result.isValid).toBe(true);
    });

    it('should reject requests exceeding rate limit', () => {
      const now = Date.now();
      const result = validateRateLimit(150, now - 1000); // 150 requests in last second
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED);
    });

    it('should reset rate limit after window expires', () => {
      const now = Date.now();
      const windowStart = now - (20 * 60 * 1000); // 20 minutes ago
      const result = validateRateLimit(150, windowStart);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateSessionTimeout', () => {
    it('should allow active sessions', () => {
      const now = Date.now();
      const lastActivity = now - (10 * 60 * 1000); // 10 minutes ago
      const result = validateSessionTimeout(lastActivity);
      expect(result.isValid).toBe(true);
    });

    it('should reject expired sessions', () => {
      const now = Date.now();
      const lastActivity = now - (40 * 60 * 1000); // 40 minutes ago
      const result = validateSessionTimeout(lastActivity);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.SESSION_EXPIRED);
    });
  });

  describe('validateTokenExpiry', () => {
    it('should allow valid tokens', () => {
      const now = Date.now();
      const expiresAt = now + (10 * 60 * 1000); // 10 minutes from now
      const result = validateTokenExpiry(expiresAt);
      expect(result.isValid).toBe(true);
    });

    it('should reject expired tokens', () => {
      const now = Date.now();
      const expiresAt = now - (10 * 60 * 1000); // 10 minutes ago
      const result = validateTokenExpiry(expiresAt);
      expect(result.isValid).toBe(false);
      expect(result.error?.code).toBe(AUTH_ERROR_CODES.TOKEN_EXPIRED);
    });
  });

  describe('shouldRefreshToken', () => {
    it('should return true when token needs refresh', () => {
      const now = Date.now();
      const expiresAt = now + (3 * 60 * 1000); // 3 minutes from now
      const result = shouldRefreshToken(expiresAt);
      expect(result).toBe(true);
    });

    it('should return false when token is still valid', () => {
      const now = Date.now();
      const expiresAt = now + (10 * 60 * 1000); // 10 minutes from now
      const result = shouldRefreshToken(expiresAt);
      expect(result).toBe(false);
    });
  });
});
