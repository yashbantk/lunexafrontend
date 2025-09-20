import { useAuthStore } from '@/lib/auth/store';

/**
 * Hook for debugging authentication issues
 * Provides utilities to inspect auth state and troubleshoot token problems
 */
export function useAuthDebug() {
  const authStore = useAuthStore();

  const debugAuthState = () => {
    return authStore.debugAuthState();
  };

  const checkTokenConsistency = () => {
    const storeTokens = authStore.tokens;
    const storageTokens = authStore.debugAuthState().storage;
    
    const isConsistent = {
      storeHasTokens: !!storeTokens,
      storageHasTokens: storageTokens.hasTokens,
      tokensMatch: storeTokens?.access === storageTokens.tokenExpiry, // This is a simplified check
      isAuthenticated: authStore.isAuthenticated,
      storageAuthenticated: storageTokens.isAuthenticated,
    };
    
    console.log('🔍 Token Consistency Check:', isConsistent);
    return isConsistent;
  };

  const simulateApiRequest = async () => {
    try {
      console.log('🧪 Simulating API request to test token usage...');
      
      // Import the gqlRequest function dynamically to avoid circular dependencies
      const { gqlRequest } = await import('@/lib/graphql/client');
      
      // Make a simple request to test token usage
      const result = await gqlRequest(`
        query TestAuth {
          __typename
        }
      `);
      
      console.log('✅ API request successful:', result);
      return { success: true, result };
    } catch (error) {
      console.error('❌ API request failed:', error);
      return { success: false, error };
    }
  };

  const clearAllAuth = () => {
    console.log('🧹 Clearing all authentication data...');
    authStore.reset();
    // Also clear cookies manually
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    }
  };

  return {
    debugAuthState,
    checkTokenConsistency,
    simulateApiRequest,
    clearAllAuth,
    // Expose current state for inspection
    currentState: {
      isAuthenticated: authStore.isAuthenticated,
      hasTokens: !!authStore.tokens,
      hasUser: !!authStore.user,
      isLoading: authStore.isLoading,
      error: authStore.error,
    }
  };
}
