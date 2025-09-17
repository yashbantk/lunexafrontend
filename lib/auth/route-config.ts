// Authentication route configuration system
// Provides flexible and maintainable route protection

export interface RouteConfig {
  path: string;
  requiresAuth: boolean;
  redirectTo?: string;
  roles?: string[];
  permissions?: string[];
  metadata?: {
    title?: string;
    description?: string;
    requiresEmailVerification?: boolean;
  };
}

export interface AuthConfig {
  // Public routes that don't require authentication
  publicRoutes: string[];
  
  // Authentication routes (login, signup, etc.)
  authRoutes: string[];
  
  // Protected routes that require authentication
  protectedRoutes: string[];
  
  // Admin routes that require specific roles
  adminRoutes: string[];
  
  // Default redirect paths
  defaultRedirects: {
    login: string;
    signup: string;
    afterLogin: string;
    afterLogout: string;
    unauthorized: string;
  };
  
  // Route-specific configurations
  routeConfigs: Map<string, RouteConfig>;
}

// Default authentication configuration
export const defaultAuthConfig: AuthConfig = {
  publicRoutes: [
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/pricing',
    '/features',
  ],
  
  authRoutes: [
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth/welcome',
  ],
  
  protectedRoutes: [
    '/proposal',
    '/proposals',
    '/profile',
    '/settings',
    '/dashboard',
    '/billing',
    '/notifications',
  ],
  
  adminRoutes: [
    '/admin',
    '/admin/users',
    '/admin/settings',
    '/admin/analytics',
  ],
  
  defaultRedirects: {
    login: '/signin',
    signup: '/signup',
    afterLogin: '/proposal',
    afterLogout: '/',
    unauthorized: '/unauthorized',
  },
  
  routeConfigs: new Map([
    // Home route - public
    ['/', {
      path: '/',
      requiresAuth: false,
      metadata: {
        title: 'Home',
        description: 'Welcome to Deyor - Your Travel Proposal Platform',
      },
    }],
    
    // Authentication routes - public
    ['/signin', {
      path: '/signin',
      requiresAuth: false,
      redirectTo: '/proposal', // Redirect if already authenticated
      metadata: {
        title: 'Sign In',
        description: 'Sign in to your Deyor account',
      },
    }],
    
    ['/signup', {
      path: '/signup',
      requiresAuth: false,
      redirectTo: '/proposal', // Redirect if already authenticated
      metadata: {
        title: 'Sign Up',
        description: 'Create your Deyor account',
      },
    }],
    
    // Protected routes
    ['/proposal', {
      path: '/proposal',
      requiresAuth: true,
      redirectTo: '/signin',
      metadata: {
        title: 'Create Proposal',
        description: 'Create your travel proposal',
      },
    }],
    
    ['/proposals', {
      path: '/proposals',
      requiresAuth: true,
      redirectTo: '/signin',
      metadata: {
        title: 'My Proposals',
        description: 'View and manage your proposals',
      },
    }],
    
    ['/profile', {
      path: '/profile',
      requiresAuth: true,
      redirectTo: '/signin',
      metadata: {
        title: 'Profile',
        description: 'Manage your profile settings',
      },
    }],
    
    ['/settings', {
      path: '/settings',
      requiresAuth: true,
      redirectTo: '/signin',
      metadata: {
        title: 'Settings',
        description: 'Account and application settings',
      },
    }],
    
    // Admin routes
    ['/admin', {
      path: '/admin',
      requiresAuth: true,
      roles: ['admin', 'superuser'],
      redirectTo: '/unauthorized',
      metadata: {
        title: 'Admin Dashboard',
        description: 'Administrative dashboard',
      },
    }],
  ]),
};

// Route configuration manager
export class RouteConfigManager {
  private config: AuthConfig;
  
  constructor(config: AuthConfig = defaultAuthConfig) {
    this.config = config;
  }
  
  /**
   * Check if a route requires authentication
   */
  requiresAuth(pathname: string): boolean {
    // Check exact match first
    const exactConfig = this.config.routeConfigs.get(pathname);
    if (exactConfig) {
      return exactConfig.requiresAuth;
    }
    
    // Check if it's a public route
    if (this.isPublicRoute(pathname)) {
      return false;
    }
    
    // Check if it's an auth route
    if (this.isAuthRoute(pathname)) {
      return false;
    }
    
    // Check if it's a protected route
    if (this.isProtectedRoute(pathname)) {
      return true;
    }
    
    // Check if it's an admin route
    if (this.isAdminRoute(pathname)) {
      return true;
    }
    
    // Default to requiring authentication for unknown routes
    return true;
  }
  
  /**
   * Get redirect URL for a route
   */
  getRedirectUrl(pathname: string, isAuthenticated: boolean): string | null {
    const config = this.config.routeConfigs.get(pathname);
    
    if (config?.redirectTo) {
      return config.redirectTo;
    }
    
    // If authenticated and trying to access auth routes, redirect to afterLogin
    if (isAuthenticated && this.isAuthRoute(pathname)) {
      return this.config.defaultRedirects.afterLogin;
    }
    
    // If not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && this.requiresAuth(pathname)) {
      return this.config.defaultRedirects.login;
    }
    
    return null;
  }
  
  /**
   * Check if user has required roles for a route
   */
  hasRequiredRoles(pathname: string, userRoles: string[]): boolean {
    const config = this.config.routeConfigs.get(pathname);
    
    if (!config?.roles || config.roles.length === 0) {
      return true;
    }
    
    return config.roles.some(role => userRoles.includes(role));
  }
  
  /**
   * Check if user has required permissions for a route
   */
  hasRequiredPermissions(pathname: string, userPermissions: string[]): boolean {
    const config = this.config.routeConfigs.get(pathname);
    
    if (!config?.permissions || config.permissions.length === 0) {
      return true;
    }
    
    return config.permissions.every(permission => userPermissions.includes(permission));
  }
  
  /**
   * Get route metadata
   */
  getRouteMetadata(pathname: string) {
    return this.config.routeConfigs.get(pathname)?.metadata || {};
  }
  
  /**
   * Check if route is public
   */
  isPublicRoute(pathname: string): boolean {
    return this.config.publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  }
  
  /**
   * Check if route is an auth route
   */
  isAuthRoute(pathname: string): boolean {
    return this.config.authRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  }
  
  /**
   * Check if route is protected
   */
  isProtectedRoute(pathname: string): boolean {
    return this.config.protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  }
  
  /**
   * Check if route is an admin route
   */
  isAdminRoute(pathname: string): boolean {
    return this.config.adminRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  }
  
  /**
   * Add a new route configuration
   */
  addRouteConfig(config: RouteConfig): void {
    this.config.routeConfigs.set(config.path, config);
  }
  
  /**
   * Remove a route configuration
   */
  removeRouteConfig(path: string): void {
    this.config.routeConfigs.delete(path);
  }
  
  /**
   * Update the entire configuration
   */
  updateConfig(newConfig: Partial<AuthConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Get all route configurations
   */
  getAllRouteConfigs(): Map<string, RouteConfig> {
    return new Map(this.config.routeConfigs);
  }
}

// Export singleton instance
export const routeConfigManager = new RouteConfigManager();
