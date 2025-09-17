// Enhanced authentication types with comprehensive security features

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  isActive: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  groups: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  expiresAt: number; // Unix timestamp
  refreshExpiresAt: number; // Unix timestamp
}

export interface AuthState {
  // User data
  user: User | null;
  tokens: AuthTokens | null;
  
  // Authentication status
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: AuthError | null;
  errors: AuthError[];
  
  // Session management
  sessionId: string | null;
  lastActivity: number;
  
  // Security features
  loginAttempts: number;
  lastLoginAttempt: number;
  isLocked: boolean;
  lockoutUntil: number | null;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthActions {
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (credentials: SignupCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // State management
  clearErrors: () => void;
  clearError: (errorId: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Security actions
  resetLoginAttempts: () => void;
  incrementLoginAttempts: () => void;
  lockAccount: (duration: number) => void;
  
  // Session management
  updateLastActivity: () => void;
  validateSession: () => Promise<boolean>;
  
  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;
}

export interface AuthMiddleware {
  name: string;
  execute: (state: AuthState, action: any) => AuthState;
}

export interface AuthConfig {
  // Token configuration
  tokenRefreshThreshold: number; // Minutes before expiry to refresh
  maxRefreshAttempts: number;
  
  // Security configuration
  maxLoginAttempts: number;
  lockoutDuration: number; // Minutes
  sessionTimeout: number; // Minutes
  
  // Storage configuration
  storageKey: string;
  useSecureStorage: boolean;
  
  // API configuration
  refreshEndpoint: string;
  logoutEndpoint: string;
  
  // Feature flags
  enableAuditLogging: boolean;
  enableSessionManagement: boolean;
  enableRateLimiting: boolean;
}

export interface AuthAuditEvent {
  id: string;
  type: 'login' | 'logout' | 'signup' | 'token_refresh' | 'session_expired' | 'security_violation' | 'login_success' | 'login_failed' | 'signup_success' | 'signup_failed' | 'token_refresh_failed' | 'account_locked' | 'password_change' | 'profile_update';
  userId?: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// Permission and role types
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface UserPermissions {
  roles: Role[];
  permissions: Permission[];
  isAdmin: boolean;
  isStaff: boolean;
  canAccess: (resource: string, action: string) => boolean;
}

// API Response types
export interface LoginResponse {
  login: {
    tokens: AuthTokens;
    user: User;
  };
}

export interface SignupResponse {
  register: User;
}
