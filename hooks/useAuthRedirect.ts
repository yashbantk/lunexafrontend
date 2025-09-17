// Enhanced authentication hooks with redirect handling
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsAuthenticated, useCurrentUser, useAuthActions } from './useAuth';
import { useRedirectHandler } from '@/lib/auth/redirect-handler';
import { routeConfigManager } from '@/lib/auth/route-config';

// Hook for handling authentication redirects
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const { handlePostLoginRedirect, setPostLoginRedirect } = useRedirectHandler();

  // Handle redirects based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      // If authenticated and on auth routes, redirect to appropriate page
      if (routeConfigManager.isAuthRoute(pathname)) {
        const redirectUrl = routeConfigManager.getRedirectUrl(pathname, true);
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      }
    } else {
      // If not authenticated and on protected routes, redirect to login
      if (routeConfigManager.requiresAuth(pathname)) {
        const redirectUrl = routeConfigManager.getRedirectUrl(pathname, false);
        if (redirectUrl) {
          setPostLoginRedirect(pathname);
          router.push(redirectUrl);
        }
      }
    }
  }, [isAuthenticated, pathname, router, setPostLoginRedirect]);

  return {
    isAuthenticated,
    currentUser,
    handlePostLoginRedirect,
  };
}

// Hook for checking if current route requires authentication
export function useRouteAuth() {
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();

  const requiresAuth = routeConfigManager.requiresAuth(pathname);
  const userRoles = currentUser?.groups || [];
  const userPermissions: string[] = []; // TODO: Add permissions to User type if needed

  const hasRequiredRoles = routeConfigManager.hasRequiredRoles(pathname, userRoles);
  const hasRequiredPermissions = routeConfigManager.hasRequiredPermissions(pathname, userPermissions);
  const canAccess = !requiresAuth || (isAuthenticated && hasRequiredRoles && hasRequiredPermissions);

  const redirectUrl = routeConfigManager.getRedirectUrl(pathname, isAuthenticated);
  const metadata = routeConfigManager.getRouteMetadata(pathname);

  return {
    requiresAuth,
    canAccess,
    hasRequiredRoles,
    hasRequiredPermissions,
    redirectUrl,
    metadata,
    userRoles,
    userPermissions,
  };
}

// Hook for handling login with redirect
export function useLoginWithRedirect() {
  const { login } = useAuthActions();
  const { handlePostLoginRedirect } = useRedirectHandler();
  const router = useRouter();

  const loginWithRedirect = async (credentials: any) => {
    try {
      const success = await login(credentials);
      
      if (success) {
        // Handle post-login redirect
        handlePostLoginRedirect();
      }
      
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  return { loginWithRedirect };
}

// Hook for handling logout with redirect
export function useLogoutWithRedirect() {
  const { logout } = useAuthActions();
  const { handlePostLogoutRedirect } = useRedirectHandler();

  const logoutWithRedirect = async () => {
    try {
      await logout();
      // Handle post-logout redirect
      handlePostLogoutRedirect();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return { logoutWithRedirect };
}

// Hook for protecting routes in components
export function useRouteProtection() {
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const router = useRouter();

  const protectRoute = () => {
    const requiresAuth = routeConfigManager.requiresAuth(pathname);
    
    if (requiresAuth && !isAuthenticated) {
      const redirectUrl = routeConfigManager.getRedirectUrl(pathname, false);
      if (redirectUrl) {
        router.push(redirectUrl);
        return false;
      }
    }
    
    return true;
  };

  const checkAccess = () => {
    const requiresAuth = routeConfigManager.requiresAuth(pathname);
  const userRoles = currentUser?.groups || [];
  const userPermissions: string[] = []; // TODO: Add permissions to User type if needed

    return {
      requiresAuth,
      isAuthenticated,
      hasRequiredRoles: routeConfigManager.hasRequiredRoles(pathname, userRoles),
      hasRequiredPermissions: routeConfigManager.hasRequiredPermissions(pathname, userPermissions),
      canAccess: !requiresAuth || (isAuthenticated && 
        routeConfigManager.hasRequiredRoles(pathname, userRoles) &&
        routeConfigManager.hasRequiredPermissions(pathname, userPermissions)
      ),
    };
  };

  return {
    protectRoute,
    checkAccess,
    isAuthenticated,
    currentUser,
  };
}
