// Redirect handler for preserving intended destinations after authentication
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { routeConfigManager } from './route-config';

// Cookie utilities
const COOKIE_NAMES = {
  REDIRECT_AFTER_LOGIN: 'redirect_after_login',
  REDIRECT_AFTER_LOGOUT: 'redirect_after_logout',
} as const;

// Get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Set cookie
function setCookie(name: string, value: string, maxAge: number = 60 * 10): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; secure; samesite=lax`;
}

// Delete cookie
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Redirect handler hook
export function useRedirectHandler() {
  const router = useRouter();

  // Handle post-login redirect
  const handlePostLoginRedirect = (fallbackUrl: string = '/proposal') => {
    console.log('handlePostLoginRedirect called with fallback:', fallbackUrl);
    const redirectUrl = getCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGIN);
    console.log('Redirect URL from cookie:', redirectUrl);
    
    if (redirectUrl) {
      // Clear the redirect cookie
      deleteCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGIN);
      
      // Validate the redirect URL to prevent open redirects
      if (isValidRedirectUrl(redirectUrl)) {
        console.log('Redirecting to saved URL:', redirectUrl);
        router.push(redirectUrl);
        return;
      } else {
        console.log('Invalid redirect URL, using fallback');
      }
    }
    
    // Use fallback URL
    console.log('Redirecting to fallback URL:', fallbackUrl);
    router.push(fallbackUrl);
  };

  // Handle post-logout redirect
  const handlePostLogoutRedirect = (fallbackUrl: string = '/') => {
    const redirectUrl = getCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGOUT);
    
    if (redirectUrl) {
      // Clear the redirect cookie
      deleteCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGOUT);
      
      // Validate the redirect URL
      if (isValidRedirectUrl(redirectUrl)) {
        router.push(redirectUrl);
        return;
      }
    }
    
    // Use fallback URL
    router.push(fallbackUrl);
  };

  // Set redirect URL for after login
  const setPostLoginRedirect = (url: string) => {
    if (isValidRedirectUrl(url)) {
      setCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGIN, url);
    }
  };

  // Set redirect URL for after logout
  const setPostLogoutRedirect = (url: string) => {
    if (isValidRedirectUrl(url)) {
      setCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGOUT, url);
    }
  };

  // Clear all redirect cookies
  const clearRedirects = () => {
    deleteCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGIN);
    deleteCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGOUT);
  };

  return {
    handlePostLoginRedirect,
    handlePostLogoutRedirect,
    setPostLoginRedirect,
    setPostLogoutRedirect,
    clearRedirects,
  };
}

// Validate redirect URL to prevent open redirects
function isValidRedirectUrl(url: string): boolean {
  try {
    // Must be a relative URL or same origin
    if (url.startsWith('/')) {
      return true;
    }
    
    // Check if it's a valid URL
    const urlObj = new URL(url, window.location.origin);
    
    // Must be same origin
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
}

// Server-side redirect handler (for middleware)
export function createServerRedirectHandler(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return {
    // Set redirect cookie for post-login
    setPostLoginRedirect: (response: any) => {
      if (response.cookies && typeof response.cookies.set === 'function') {
        response.cookies.set(COOKIE_NAMES.REDIRECT_AFTER_LOGIN, pathname, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 10, // 10 minutes
        });
      }
    },
    
    // Set redirect cookie for post-logout
    setPostLogoutRedirect: (response: any) => {
      if (response.cookies && typeof response.cookies.set === 'function') {
        response.cookies.set(COOKIE_NAMES.REDIRECT_AFTER_LOGOUT, pathname, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 10, // 10 minutes
        });
      }
    },
  };
}

// Utility function for getting redirect URL from cookies
export function getRedirectUrl(cookieName: keyof typeof COOKIE_NAMES): string | null {
  return getCookie(COOKIE_NAMES[cookieName]);
}

// Utility function for setting redirect URL in cookies
export function setRedirectUrl(
  cookieName: keyof typeof COOKIE_NAMES,
  url: string,
  maxAge: number = 60 * 10
): void {
  setCookie(COOKIE_NAMES[cookieName], url, maxAge);
}

// Utility function for clearing redirect cookies
export function clearRedirectCookies(): void {
  deleteCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGIN);
  deleteCookie(COOKIE_NAMES.REDIRECT_AFTER_LOGOUT);
}
