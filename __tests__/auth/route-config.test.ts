// Tests for authentication route configuration system
import { routeConfigManager, defaultAuthConfig, RouteConfigManager } from '@/lib/auth/route-config';

describe('Route Configuration Manager', () => {
  let manager: RouteConfigManager;

  beforeEach(() => {
    manager = new RouteConfigManager(defaultAuthConfig);
  });

  describe('requiresAuth', () => {
    it('should return false for public routes', () => {
      expect(manager.requiresAuth('/')).toBe(false);
      expect(manager.requiresAuth('/about')).toBe(false);
      expect(manager.requiresAuth('/contact')).toBe(false);
    });

    it('should return false for auth routes', () => {
      expect(manager.requiresAuth('/signin')).toBe(false);
      expect(manager.requiresAuth('/signup')).toBe(false);
      expect(manager.requiresAuth('/forgot-password')).toBe(false);
    });

    it('should return true for protected routes', () => {
      expect(manager.requiresAuth('/proposal')).toBe(true);
      expect(manager.requiresAuth('/profile')).toBe(true);
      expect(manager.requiresAuth('/settings')).toBe(true);
    });

    it('should return true for admin routes', () => {
      expect(manager.requiresAuth('/admin')).toBe(true);
      expect(manager.requiresAuth('/admin/users')).toBe(true);
    });

    it('should return true for unknown routes by default', () => {
      expect(manager.requiresAuth('/unknown-route')).toBe(true);
    });
  });

  describe('getRedirectUrl', () => {
    it('should return login URL for unauthenticated users on protected routes', () => {
      expect(manager.getRedirectUrl('/proposal', false)).toBe('/signin');
      expect(manager.getRedirectUrl('/profile', false)).toBe('/signin');
    });

    it('should return afterLogin URL for authenticated users on auth routes', () => {
      expect(manager.getRedirectUrl('/signin', true)).toBe('/proposal');
      expect(manager.getRedirectUrl('/signup', true)).toBe('/proposal');
    });

    it('should return null for public routes', () => {
      expect(manager.getRedirectUrl('/', false)).toBe(null);
      expect(manager.getRedirectUrl('/', true)).toBe(null);
    });

    it('should return unauthorized URL for admin routes without proper roles', () => {
      expect(manager.getRedirectUrl('/admin', true)).toBe('/unauthorized');
    });
  });

  describe('hasRequiredRoles', () => {
    it('should return true for routes without role requirements', () => {
      expect(manager.hasRequiredRoles('/proposal', [])).toBe(true);
      expect(manager.hasRequiredRoles('/profile', ['user'])).toBe(true);
    });

    it('should return true when user has required roles', () => {
      expect(manager.hasRequiredRoles('/admin', ['admin'])).toBe(true);
      expect(manager.hasRequiredRoles('/admin', ['admin', 'user'])).toBe(true);
    });

    it('should return false when user lacks required roles', () => {
      expect(manager.hasRequiredRoles('/admin', ['user'])).toBe(false);
      expect(manager.hasRequiredRoles('/admin', [])).toBe(false);
    });
  });

  describe('hasRequiredPermissions', () => {
    it('should return true for routes without permission requirements', () => {
      expect(manager.hasRequiredPermissions('/proposal', [])).toBe(true);
      expect(manager.hasRequiredPermissions('/profile', ['read'])).toBe(true);
    });

    it('should return true when user has all required permissions', () => {
      // This would need to be configured in the route config
      expect(manager.hasRequiredPermissions('/proposal', ['read', 'write'])).toBe(true);
    });
  });

  describe('route type checks', () => {
    it('should correctly identify public routes', () => {
      expect(manager.isPublicRoute('/')).toBe(true);
      expect(manager.isPublicRoute('/about')).toBe(true);
      expect(manager.isPublicRoute('/proposal')).toBe(false);
    });

    it('should correctly identify auth routes', () => {
      expect(manager.isAuthRoute('/signin')).toBe(true);
      expect(manager.isAuthRoute('/signup')).toBe(true);
      expect(manager.isAuthRoute('/proposal')).toBe(false);
    });

    it('should correctly identify protected routes', () => {
      expect(manager.isProtectedRoute('/proposal')).toBe(true);
      expect(manager.isProtectedRoute('/profile')).toBe(true);
      expect(manager.isProtectedRoute('/')).toBe(false);
    });

    it('should correctly identify admin routes', () => {
      expect(manager.isAdminRoute('/admin')).toBe(true);
      expect(manager.isAdminRoute('/admin/users')).toBe(true);
      expect(manager.isAdminRoute('/proposal')).toBe(false);
    });
  });

  describe('route configuration management', () => {
    it('should add new route configuration', () => {
      const newRoute: RouteConfig = {
        path: '/test',
        requiresAuth: true,
        redirectTo: '/signin',
        roles: ['user'],
      };

      manager.addRouteConfig(newRoute);
      expect(manager.requiresAuth('/test')).toBe(true);
      expect(manager.getRedirectUrl('/test', false)).toBe('/signin');
    });

    it('should remove route configuration', () => {
      manager.removeRouteConfig('/proposal');
      // Should fall back to default behavior
      expect(manager.requiresAuth('/proposal')).toBe(true);
      
      // Re-add the route configuration for subsequent tests
      manager.addRouteConfig({
        path: '/proposal',
        requiresAuth: true,
        redirectTo: '/signin',
        metadata: {
          title: 'Create Proposal',
          description: 'Create your travel proposal',
        },
      });
    });

    it('should get route metadata', () => {
      // Use the manager instance that has the default configuration
      const metadata = manager.getRouteMetadata('/proposal');
      expect(metadata.title).toBe('Create Proposal');
      expect(metadata.description).toBe('Create your travel proposal');
    });
  });

  describe('default configuration', () => {
    it('should have correct default redirects', () => {
      expect(defaultAuthConfig.defaultRedirects.login).toBe('/signin');
      expect(defaultAuthConfig.defaultRedirects.signup).toBe('/signup');
      expect(defaultAuthConfig.defaultRedirects.afterLogin).toBe('/proposal');
      expect(defaultAuthConfig.defaultRedirects.afterLogout).toBe('/');
      expect(defaultAuthConfig.defaultRedirects.unauthorized).toBe('/unauthorized');
    });

    it('should have correct route categories', () => {
      expect(defaultAuthConfig.publicRoutes).toContain('/');
      expect(defaultAuthConfig.authRoutes).toContain('/signin');
      expect(defaultAuthConfig.protectedRoutes).toContain('/proposal');
      expect(defaultAuthConfig.adminRoutes).toContain('/admin');
    });
  });
});
