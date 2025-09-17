// Tests for authentication guards and utilities
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthGuard, withAuthGuard, useRouteAccess, canAccessRoute } from '@/lib/auth/guards';
import { useIsAuthenticated, useCurrentUser } from '@/hooks/useAuth';

// Mock the auth hooks
jest.mock('@/hooks/useAuth');
const mockUseIsAuthenticated = useIsAuthenticated as jest.MockedFunction<typeof useIsAuthenticated>;
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>;

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/test',
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when authentication is not required', () => {
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseCurrentUser.mockReturnValue(null);

    render(
      <AuthGuard requireAuth={false}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should render children when user is authenticated', async () => {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseCurrentUser.mockReturnValue({ id: '1', firstName: 'John' });

    render(
      <AuthGuard requireAuth={true}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when authentication is required but user is not authenticated', async () => {
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseCurrentUser.mockReturnValue(null);

    render(
      <AuthGuard requireAuth={true}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signin');
    });
  });

  it('should redirect to unauthorized when user lacks required roles', async () => {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseCurrentUser.mockReturnValue({ 
      id: '1', 
      firstName: 'John',
      roles: ['user'] 
    });

    render(
      <AuthGuard requireAuth={true} requiredRoles={['admin']}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    });
  });

  it('should render children when user has required roles', async () => {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseCurrentUser.mockReturnValue({ 
      id: '1', 
      firstName: 'John',
      roles: ['admin'] 
    });

    render(
      <AuthGuard requireAuth={true} requiredRoles={['admin']}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('should render custom fallback when provided', () => {
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseCurrentUser.mockReturnValue(null);

    render(
      <AuthGuard 
        requireAuth={true} 
        fallback={<div data-testid="custom-fallback">Custom Fallback</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

describe('withAuthGuard HOC', () => {
  it('should wrap component with AuthGuard', () => {
    const TestComponent = () => <div data-testid="test-component">Test</div>;
    const GuardedComponent = withAuthGuard(TestComponent, { requireAuth: true });

    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseCurrentUser.mockReturnValue({ id: '1', firstName: 'John' });

    render(<GuardedComponent />);

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });
});

describe('useRouteAccess hook', () => {
  it('should return correct access information for public routes', () => {
    mockUseIsAuthenticated.mockReturnValue(false);
    mockUseCurrentUser.mockReturnValue(null);

    const { result } = renderHook(() => useRouteAccess('/'));

    expect(result.current.requiresAuth).toBe(false);
    expect(result.current.hasAccess).toBe(true);
    expect(result.current.canAccess).toBe(true);
  });

  it('should return correct access information for protected routes', () => {
    mockUseIsAuthenticated.mockReturnValue(true);
    mockUseCurrentUser.mockReturnValue({ 
      id: '1', 
      firstName: 'John',
      roles: ['user'],
      permissions: ['read']
    });

    const { result } = renderHook(() => useRouteAccess('/proposal'));

    expect(result.current.requiresAuth).toBe(true);
    expect(result.current.hasAccess).toBe(true);
    expect(result.current.canAccess).toBe(true);
  });
});

describe('canAccessRoute utility', () => {
  it('should return true for public routes', () => {
    expect(canAccessRoute('/', false, [], [])).toBe(true);
    expect(canAccessRoute('/about', false, [], [])).toBe(true);
  });

  it('should return false for protected routes when not authenticated', () => {
    expect(canAccessRoute('/proposal', false, [], [])).toBe(false);
    expect(canAccessRoute('/profile', false, [], [])).toBe(false);
  });

  it('should return true for protected routes when authenticated', () => {
    expect(canAccessRoute('/proposal', true, ['user'], ['read'])).toBe(true);
    expect(canAccessRoute('/profile', true, ['user'], ['read'])).toBe(true);
  });

  it('should return false for admin routes without admin role', () => {
    expect(canAccessRoute('/admin', true, ['user'], ['read'])).toBe(false);
  });

  it('should return true for admin routes with admin role', () => {
    expect(canAccessRoute('/admin', true, ['admin'], ['read'])).toBe(true);
  });
});
