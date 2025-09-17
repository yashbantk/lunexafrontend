// Next.js middleware for authentication and route protection
import { NextRequest, NextResponse } from 'next/server';
import { routeConfigManager } from '@/lib/auth/route-config';
import { ServerCookieStorage } from '@/lib/auth/cookie-storage';

// Authentication status checker
async function checkAuthStatus(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user: any;
  roles: string[];
  permissions: string[];
}> {
  try {
    // Parse cookies from request
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = ServerCookieStorage.parseCookies(cookieHeader);
    
    // Get authentication status from cookies
    const authStatus = ServerCookieStorage.getAuthStatus(cookies);
    
    if (!authStatus.isAuthenticated) {
      return {
        isAuthenticated: false,
        user: null,
        roles: [],
        permissions: [],
      };
    }

    // Get roles and permissions from user data
    const roles = authStatus.user?.groups || [];
    const permissions: string[] = []; // TODO: Add permissions to User type if needed

    return {
      isAuthenticated: true,
      user: authStatus.user,
      roles,
      permissions,
    };
  } catch (error) {
    console.error('Auth status check failed:', error);
    return {
      isAuthenticated: false,
      user: null,
      roles: [],
      permissions: [],
    };
  }
}

// Token validation (simplified - in production, validate JWT properly)
async function validateToken(token: string): Promise<boolean> {
  try {
    // In production, you would:
    // 1. Verify JWT signature
    // 2. Check token expiration
    // 3. Validate token claims
    // 4. Check if token is blacklisted
    
    // For now, just check if token exists and has valid format
    return Boolean(token && token.length > 10);
  } catch {
    return false;
  }
}

// Create redirect response with destination preservation
function createRedirectResponse(
  redirectUrl: string,
  originalUrl: string,
  reason: 'auth_required' | 'already_authenticated' | 'unauthorized'
): NextResponse {
  const response = NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  
  // Preserve the original destination for post-login redirect
  if (reason === 'auth_required') {
    response.cookies.set('redirect_after_login', originalUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
  }
  
  // Add reason header for debugging
  response.headers.set('X-Redirect-Reason', reason);
  
  return response;
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }
  
  // Get authentication status
  const { isAuthenticated, user, roles, permissions } = await checkAuthStatus(request);
  
  // Check if route requires authentication
  const requiresAuth = routeConfigManager.requiresAuth(pathname);
  
  // Handle authentication requirements
  if (requiresAuth && !isAuthenticated) {
    // User needs to authenticate
    const redirectUrl = routeConfigManager.getRedirectUrl(pathname, isAuthenticated);
    if (redirectUrl) {
      return createRedirectResponse(redirectUrl, pathname, 'auth_required');
    }
  }
  
  // Handle already authenticated users trying to access auth routes
  if (isAuthenticated && routeConfigManager.isAuthRoute(pathname)) {
    const redirectUrl = routeConfigManager.getRedirectUrl(pathname, isAuthenticated);
    if (redirectUrl) {
      return createRedirectResponse(redirectUrl, pathname, 'already_authenticated');
    }
  }
  
  // Check role-based access
  if (isAuthenticated && !routeConfigManager.hasRequiredRoles(pathname, roles)) {
    const redirectUrl = routeConfigManager.getRedirectUrl(pathname, isAuthenticated) || '/unauthorized';
    return createRedirectResponse(redirectUrl, pathname, 'unauthorized');
  }
  
  // Check permission-based access
  if (isAuthenticated && !routeConfigManager.hasRequiredPermissions(pathname, permissions)) {
    const redirectUrl = routeConfigManager.getRedirectUrl(pathname, isAuthenticated) || '/unauthorized';
    return createRedirectResponse(redirectUrl, pathname, 'unauthorized');
  }
  
  // Add authentication headers for the request
  const response = NextResponse.next();
  response.headers.set('X-Auth-Status', isAuthenticated ? 'authenticated' : 'unauthenticated');
  
  if (isAuthenticated && user) {
    response.headers.set('X-User-ID', user.id || '');
    response.headers.set('X-User-Roles', roles.join(','));
  }
  
  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
