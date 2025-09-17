// Cookie-based storage for authentication data
// Provides consistent storage across client and server

import { authConfig, SECURITY_CONSTANTS } from './config';
import type { AuthTokens, User } from '@/types/auth';
import { AuthCookieStorage } from './cookie-storage';

/**
 * Authentication storage manager using cookies
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
      AuthCookieStorage.setTokens(tokens);
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
      const tokens = AuthCookieStorage.getTokens();
      
      // Validate token structure
      if (!tokens || !tokens.access || !tokens.refresh) {
        return null;
      }
      
      return tokens as AuthTokens;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  /**
   * Store user data
   */
  setUser(user: User): void {
    try {
      AuthCookieStorage.setUser(user);
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
      const user = AuthCookieStorage.getUser();
      
      // Validate user structure
      if (!user || !user.id || !user.email) {
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      return null;
    }
  }

  /**
   * Store session data
   */
  setSession(sessionId: string, lastActivity: number): void {
    try {
      AuthCookieStorage.setSession(sessionId, lastActivity);
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Retrieve session data
   */
  getSession(): { sessionId: string; lastActivity: number } | null {
    try {
      const session = AuthCookieStorage.getSession();
      
      if (!session.sessionId || !session.lastActivity) {
        return null;
      }
      
      return {
        sessionId: session.sessionId,
        lastActivity: session.lastActivity,
      };
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Store security data (login attempts, etc.)
   * Note: Security data is stored in memory for client-side only
   */
  setSecurityData(data: Record<string, any>): void {
    try {
      if (typeof window !== 'undefined') {
        // Store in sessionStorage for security data (not cookies)
        sessionStorage.setItem(`${this.storageKey}_security`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to store security data:', error);
    }
  }

  /**
   * Retrieve security data
   */
  getSecurityData(): Record<string, any> {
    try {
      if (typeof window === 'undefined') return {};
      
      const securityData = sessionStorage.getItem(`${this.storageKey}_security`);
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
      AuthCookieStorage.clearAuth();
      
      // Also clear security data from sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`${this.storageKey}_security`);
      }
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Clear tokens only
   */
  clearTokens(): void {
    try {
      AuthCookieStorage.clearAuth();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Clear user data only
   */
  clearUser(): void {
    try {
      AuthCookieStorage.clearAuth();
    } catch (error) {
      console.error('Failed to clear user:', error);
    }
  }

  /**
   * Clear session data only
   */
  clearSession(): void {
    try {
      AuthCookieStorage.clearAuth();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if user is authenticated based on stored data
   */
  isAuthenticated(): boolean {
    try {
      return AuthCookieStorage.isAuthenticated();
    } catch (error) {
      console.error('Failed to check authentication status:', error);
      return false;
    }
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    try {
      AuthCookieStorage.updateLastActivity();
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(maxAge: number = 7 * 24 * 60 * 60 * 1000): boolean {
    try {
      return AuthCookieStorage.isSessionExpired(maxAge);
    } catch (error) {
      console.error('Failed to check session expiration:', error);
      return true;
    }
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
      isAuthenticated: this.isAuthenticated(),
      sessionExpired: this.isSessionExpired(),
    };
  }
}

// Export singleton instance
export const authStorage = AuthStorage.getInstance();