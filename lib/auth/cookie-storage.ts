// Cookie-based storage for authentication
// Provides consistent storage across client and server

import { AuthTokens, User } from '@/types/auth';

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

export class CookieStorage {
  private static readonly DEFAULT_OPTIONS: CookieOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: false, // Allow client-side access
  };

  /**
   * Set a cookie
   */
  static set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') {
      console.warn('CookieStorage.set called on server side');
      return;
    }

    const cookieOptions = { ...this.DEFAULT_OPTIONS, ...options };
    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (cookieOptions.expires) {
      cookieString += `; expires=${cookieOptions.expires.toUTCString()}`;
    }

    if (cookieOptions.maxAge) {
      cookieString += `; max-age=${cookieOptions.maxAge}`;
    }

    if (cookieOptions.path) {
      cookieString += `; path=${cookieOptions.path}`;
    }

    if (cookieOptions.domain) {
      cookieString += `; domain=${cookieOptions.domain}`;
    }

    if (cookieOptions.secure) {
      cookieString += `; secure`;
    }

    if (cookieOptions.sameSite) {
      cookieString += `; samesite=${cookieOptions.sameSite}`;
    }

    if (cookieOptions.httpOnly) {
      cookieString += `; httponly`;
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value
   */
  static get(name: string): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  /**
   * Remove a cookie
   */
  static remove(name: string, options: Partial<CookieOptions> = {}): void {
    const cookieOptions = { ...this.DEFAULT_OPTIONS, ...options };
    this.set(name, '', {
      ...cookieOptions,
      expires: new Date(0), // Set to past date
    });
  }

  /**
   * Check if a cookie exists
   */
  static has(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Get all cookies as an object
   */
  static getAll(): Record<string, string> {
    if (typeof document === 'undefined') {
      return {};
    }

    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }

  /**
   * Clear all authentication cookies
   */
  static clearAuth(): void {
    const authCookies = [
      'auth_access_token',
      'auth_refresh_token',
      'auth_user',
      'auth_session',
      'auth_last_activity',
      'auth_status',
    ];

    authCookies.forEach(cookieName => {
      this.remove(cookieName);
    });
  }
}

// Authentication-specific cookie helpers
export class AuthCookieStorage {
  private static readonly TOKEN_COOKIE_OPTIONS: CookieOptions = {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: false, // Allow client-side access for state management
  };

  private static readonly USER_COOKIE_OPTIONS: CookieOptions = {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: false, // Allow client-side access for state management
  };

  private static readonly SESSION_COOKIE_OPTIONS: CookieOptions = {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: false, // Allow client-side access for state management
  };

  /**
   * Store authentication tokens
   */
  static setTokens(tokens: AuthTokens): void {
    if (tokens.access) {
      CookieStorage.set('auth_access_token', tokens.access, this.TOKEN_COOKIE_OPTIONS);
    }
    if (tokens.refresh) {
      CookieStorage.set('auth_refresh_token', tokens.refresh, this.TOKEN_COOKIE_OPTIONS);
    }
    if (tokens.expiresAt) {
      CookieStorage.set('auth_token_expires', tokens.expiresAt.toString(), this.TOKEN_COOKIE_OPTIONS);
    }
    if (tokens.refreshExpiresAt) {
      CookieStorage.set('auth_refresh_expires', tokens.refreshExpiresAt.toString(), this.TOKEN_COOKIE_OPTIONS);
    }
  }

  /**
   * Get authentication tokens
   */
  static getTokens(): Partial<AuthTokens> | null {
    const access = CookieStorage.get('auth_access_token');
    const refresh = CookieStorage.get('auth_refresh_token');
    const expiresAt = CookieStorage.get('auth_token_expires');
    const refreshExpiresAt = CookieStorage.get('auth_refresh_expires');

    if (!access && !refresh) {
      return null;
    }

    return {
      access: access || undefined,
      refresh: refresh || undefined,
      expiresAt: expiresAt ? new Date(expiresAt).getTime() : undefined,
      refreshExpiresAt: refreshExpiresAt ? new Date(refreshExpiresAt).getTime() : undefined,
    };
  }

  /**
   * Store user data
   */
  static setUser(user: User): void {
    CookieStorage.set('auth_user', JSON.stringify(user), this.USER_COOKIE_OPTIONS);
    CookieStorage.set('auth_status', 'authenticated', this.USER_COOKIE_OPTIONS);
  }

  /**
   * Get user data
   */
  static getUser(): User | null {
    const userData = CookieStorage.get('auth_user');
    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data from cookie:', error);
      return null;
    }
  }

  /**
   * Store session data
   */
  static setSession(sessionId: string, lastActivity: number): void {
    CookieStorage.set('auth_session', sessionId, this.SESSION_COOKIE_OPTIONS);
    CookieStorage.set('auth_last_activity', lastActivity.toString(), this.SESSION_COOKIE_OPTIONS);
  }

  /**
   * Get session data
   */
  static getSession(): { sessionId: string | null; lastActivity: number | null } {
    return {
      sessionId: CookieStorage.get('auth_session'),
      lastActivity: CookieStorage.get('auth_last_activity') ? 
        parseInt(CookieStorage.get('auth_last_activity')!) : null,
    };
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return CookieStorage.get('auth_status') === 'authenticated' && 
           CookieStorage.has('auth_user') && 
           CookieStorage.has('auth_access_token');
  }

  /**
   * Clear all authentication data
   */
  static clearAuth(): void {
    CookieStorage.clearAuth();
  }

  /**
   * Update last activity timestamp
   */
  static updateLastActivity(): void {
    const now = Date.now();
    CookieStorage.set('auth_last_activity', now.toString(), this.SESSION_COOKIE_OPTIONS);
  }

  /**
   * Check if session is expired
   */
  static isSessionExpired(maxAge: number = 7 * 24 * 60 * 60 * 1000): boolean {
    const lastActivity = CookieStorage.get('auth_last_activity');
    if (!lastActivity) {
      return true;
    }

    const lastActivityTime = parseInt(lastActivity);
    const now = Date.now();
    return (now - lastActivityTime) > maxAge;
  }
}

// Server-side cookie helpers for middleware
export class ServerCookieStorage {
  /**
   * Parse cookies from request headers
   */
  static parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    if (!cookieHeader) {
      return cookies;
    }

    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    return cookies;
  }

  /**
   * Get authentication status from cookies
   */
  static getAuthStatus(cookies: Record<string, string>): {
    isAuthenticated: boolean;
    user: User | null;
    tokens: Partial<AuthTokens> | null;
    sessionId: string | null;
  } {
    const isAuthenticated = cookies.auth_status === 'authenticated';
    
    let user: User | null = null;
    if (cookies.auth_user) {
      try {
        user = JSON.parse(cookies.auth_user);
      } catch (error) {
        console.error('Failed to parse user data from server cookie:', error);
      }
    }

    const tokens: Partial<AuthTokens> = {};
    if (cookies.auth_access_token) tokens.access = cookies.auth_access_token;
    if (cookies.auth_refresh_token) tokens.refresh = cookies.auth_refresh_token;
    if (cookies.auth_token_expires) tokens.expiresAt = new Date(cookies.auth_token_expires).getTime();
    if (cookies.auth_refresh_expires) tokens.refreshExpiresAt = new Date(cookies.auth_refresh_expires).getTime();

    return {
      isAuthenticated,
      user,
      tokens: Object.keys(tokens).length > 0 ? tokens : null,
      sessionId: cookies.auth_session || null,
    };
  }
}
