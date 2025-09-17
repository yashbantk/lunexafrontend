// Authentication guards and utilities for components
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsAuthenticated, useCurrentUser } from '@/hooks/useAuth';
import { routeConfigManager } from './route-config';
import { Loader2 } from 'lucide-react';

// Authentication guard component
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // If no authentication required, allow access
      if (!requireAuth) {
        setIsChecking(false);
        return;
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        const loginUrl = redirectTo || routeConfigManager.getRedirectUrl(pathname, false) || '/signin';
        router.push(loginUrl);
        return;
      }

      // Check roles if required
      if (requiredRoles.length > 0) {
        const userRoles = currentUser?.groups || [];
        const hasRequiredRoles = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRoles) {
          router.push('/unauthorized');
          return;
        }
      }

      // Check permissions if required
      if (requiredPermissions.length > 0) {
        const userPermissions: string[] = []; // TODO: Add permissions to User type if needed
        const hasRequiredPermissions = requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        );
        
        if (!hasRequiredPermissions) {
          router.push('/unauthorized');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAccess();
  }, [
    isAuthenticated,
    currentUser,
    pathname,
    requireAuth,
    requiredRoles,
    requiredPermissions,
    redirectTo,
    router,
  ]);

  if (isChecking) {
    return fallback || <DefaultLoadingFallback />;
  }

  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  return fallback || <DefaultUnauthorizedFallback />;
}

// Default loading fallback component
function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}

// Default unauthorized fallback component
function DefaultUnauthorizedFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

// Higher-order component for route protection
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for checking route access
export function useRouteAccess(pathname?: string) {
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const router = useRouter();
  const pathnameFromHook = usePathname();
  const currentPath = pathname || pathnameFromHook;

  const checkAccess = () => {
    const requiresAuth = routeConfigManager.requiresAuth(currentPath);
    const userRoles = currentUser?.groups || [];
    const userPermissions: string[] = []; // TODO: Add permissions to User type if needed

    return {
      requiresAuth,
      hasAccess: !requiresAuth || isAuthenticated,
      hasRequiredRoles: routeConfigManager.hasRequiredRoles(currentPath, userRoles),
      hasRequiredPermissions: routeConfigManager.hasRequiredPermissions(currentPath, userPermissions),
      canAccess: !requiresAuth || (isAuthenticated && 
        routeConfigManager.hasRequiredRoles(currentPath, userRoles) &&
        routeConfigManager.hasRequiredPermissions(currentPath, userPermissions)
      ),
    };
  };

  const redirectIfNeeded = () => {
    const { canAccess } = checkAccess();
    
    if (!canAccess) {
      const redirectUrl = routeConfigManager.getRedirectUrl(currentPath, isAuthenticated);
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    }
  };

  return {
    ...checkAccess(),
    redirectIfNeeded,
    currentUser,
    isAuthenticated,
  };
}

// Utility function for checking if user can access a route
export function canAccessRoute(
  pathname: string,
  isAuthenticated: boolean,
  userRoles: string[] = [],
  userPermissions: string[] = []
): boolean {
  const requiresAuth = routeConfigManager.requiresAuth(pathname);
  
  if (!requiresAuth) {
    return true;
  }
  
  if (!isAuthenticated) {
    return false;
  }
  
  const hasRequiredRoles = routeConfigManager.hasRequiredRoles(pathname, userRoles);
  const hasRequiredPermissions = routeConfigManager.hasRequiredPermissions(pathname, userPermissions);
  
  return hasRequiredRoles && hasRequiredPermissions;
}

// Utility function for getting redirect URL
export function getRedirectUrl(
  pathname: string,
  isAuthenticated: boolean
): string | null {
  return routeConfigManager.getRedirectUrl(pathname, isAuthenticated);
}

// Utility function for getting route metadata
export function getRouteMetadata(pathname: string) {
  return routeConfigManager.getRouteMetadata(pathname);
}
