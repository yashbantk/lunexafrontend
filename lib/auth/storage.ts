// Secure storage utilities for authentication data

import { authConfig, SECURITY_CONSTANTS } from './config';
import type { AuthTokens, User } from '@/types/auth';

/**
 * Secure storage interface for different storage mechanisms
 */
interface SecureStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * LocalStorage implementation with security checks
 */
class LocalSecureStorage implements SecureStorage {
  private isClient = typeof window !== 'undefined';

  getItem(key: string): string | null {
    if (!this.isClient) return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
    }
  }

  removeItem(key: string): void {
    if (!this.isClient) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  clear(): void {
    if (!this.isClient) return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

/**
 * SessionStorage implementation with security checks
 */
class SessionSecureStorage implements SecureStorage {
  private isClient = typeof window !== 'undefined';

  getItem(key: string): string | null {
    if (!this.isClient) return null;
    
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isClient) return;
    
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to write to sessionStorage:', error);
    }
  }

  removeItem(key: string): void {
    if (!this.isClient) return;
    
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
    }
  }

  clear(): void {
    if (!this.isClient) return;
    
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
}

/**
 * Memory storage for server-side rendering
 */
class MemoryStorage implements SecureStorage {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// Storage instance based on environment
const storage: SecureStorage = (() => {
  if (typeof window === 'undefined') {
    return new MemoryStorage();
  }
  
  // Use sessionStorage for sensitive data in production
  if (authConfig.useSecureStorage && process.env.NODE_ENV === 'production') {
    return new SessionSecureStorage();
  }
  
  return new LocalSecureStorage();
})();

/**
 * Encrypt sensitive data before storage
 */
function encryptData(data: any): string {
  try {
    // In production, use proper encryption
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement proper encryption using Web Crypto API
      return btoa(JSON.stringify(data));
    }
    
    // Development: simple base64 encoding
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Failed to encrypt data:', error);
    throw new Error('Data encryption failed');
  }
}

/**
 * Decrypt sensitive data after retrieval
 */
function decryptData(encryptedData: string): any {
  try {
    // In production, use proper decryption
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement proper decryption using Web Crypto API
      return JSON.parse(atob(encryptedData));
    }
    
    // Development: simple base64 decoding
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
}

/**
 * Authentication storage manager
 */
export class AuthStorage {
  private static instance: AuthStorage;
  private storageKey = authConfig.storageKey;

  static getInstance(): AuthStorage {
    if (!AuthStorage.instance) {
      AuthStorage.instance = new AuthStorage();
    }
    return AuthStorage.instance;
  }

  /**
   * Store authentication tokens securely
   */
  setTokens(tokens: AuthTokens): void {
    try {
      const encryptedTokens = encryptData(tokens);
      storage.setItem(`${this.storageKey}_tokens`, encryptedTokens);
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * Retrieve authentication tokens
   */
  getTokens(): AuthTokens | null {
    try {
      const encryptedTokens = storage.getItem(`${this.storageKey}_tokens`);
      if (!encryptedTokens) return null;
      
      const tokens = decryptData(encryptedTokens);
      
      // Validate token structure
      if (!tokens || !tokens.access || !tokens.refresh) {
        this.clearTokens();
        return null;
      }
      
      return tokens;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Store user data
   */
  setUser(user: User): void {
    try {
      const encryptedUser = encryptData(user);
      storage.setItem(`${this.storageKey}_user`, encryptedUser);
    } catch (error) {
      console.error('Failed to store user:', error);
      throw new Error('User storage failed');
    }
  }

  /**
   * Retrieve user data
   */
  getUser(): User | null {
    try {
      const encryptedUser = storage.getItem(`${this.storageKey}_user`);
      if (!encryptedUser) return null;
      
      const user = decryptData(encryptedUser);
      
      // Validate user structure
      if (!user || !user.id || !user.email) {
        this.clearUser();
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      this.clearUser();
      return null;
    }
  }

  /**
   * Store session data
   */
  setSession(sessionId: string, lastActivity: number): void {
    try {
      const sessionData = { sessionId, lastActivity };
      storage.setItem(`${this.storageKey}_session`, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Retrieve session data
   */
  getSession(): { sessionId: string; lastActivity: number } | null {
    try {
      const sessionData = storage.getItem(`${this.storageKey}_session`);
      if (!sessionData) return null;
      
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Store security data (login attempts, etc.)
   */
  setSecurityData(data: Record<string, any>): void {
    try {
      storage.setItem(`${this.storageKey}_security`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store security data:', error);
    }
  }

  /**
   * Retrieve security data
   */
  getSecurityData(): Record<string, any> {
    try {
      const securityData = storage.getItem(`${this.storageKey}_security`);
      if (!securityData) return {};
      
      return JSON.parse(securityData);
    } catch (error) {
      console.error('Failed to retrieve security data:', error);
      return {};
    }
  }

  /**
   * Clear all authentication data
   */
  clearAll(): void {
    try {
      storage.removeItem(`${this.storageKey}_tokens`);
      storage.removeItem(`${this.storageKey}_user`);
      storage.removeItem(`${this.storageKey}_session`);
      storage.removeItem(`${this.storageKey}_security`);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Clear tokens only
   */
  clearTokens(): void {
    storage.removeItem(`${this.storageKey}_tokens`);
  }

  /**
   * Clear user data only
   */
  clearUser(): void {
    storage.removeItem(`${this.storageKey}_user`);
  }

  /**
   * Clear session data only
   */
  clearSession(): void {
    storage.removeItem(`${this.storageKey}_session`);
  }

  /**
   * Check if user is authenticated based on stored data
   */
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    const user = this.getUser();
    
    if (!tokens || !user) return false;
    
    // Check if tokens are expired
    const now = Date.now();
    if (tokens.expiresAt && now >= tokens.expiresAt) {
      this.clearTokens();
      return false;
    }
    
    return true;
  }

  /**
   * Get storage statistics for debugging
   */
  getStorageStats(): Record<string, any> {
    const tokens = this.getTokens();
    const user = this.getUser();
    const session = this.getSession();
    const security = this.getSecurityData();
    
    return {
      hasTokens: !!tokens,
      hasUser: !!user,
      hasSession: !!session,
      tokenExpiry: tokens?.expiresAt ? new Date(tokens.expiresAt).toISOString() : null,
      lastActivity: session?.lastActivity ? new Date(session.lastActivity).toISOString() : null,
      loginAttempts: security.loginAttempts || 0,
      isLocked: security.isLocked || false,
    };
  }
}

// Export singleton instance
export const authStorage = AuthStorage.getInstance();
