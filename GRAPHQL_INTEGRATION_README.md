# GraphQL Signup Integration

This document describes the GraphQL signup integration that has been added to the Deyor frontend application.

## Configuration

### Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update `.env.local` with your GraphQL endpoint (note the trailing slash):**
   ```bash
   NEXT_PUBLIC_GRAPHQL_URL=https://1af83ff1d893.ngrok-free.app/graphql/
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

**Important:** The `.env.local` file is automatically ignored by git and won't be pushed to the repository. Each developer can have their own local configuration.

### GraphQL Endpoint

The GraphQL client is configured to use the endpoint specified in `NEXT_PUBLIC_GRAPHQL_URL`. Make sure your GraphQL server is running and accessible at this URL.

## Files Created/Modified

### New Files

1. **`lib/graphql/client.ts`** - GraphQL client configuration using `graphql-request`
2. **`graphql/mutations/user.ts`** - Signup and login mutation definitions
3. **`hooks/useSignup.ts`** - Custom hook for signup functionality
4. **`hooks/useSignin.ts`** - Custom hook for signin functionality
5. **`hooks/useToast.tsx`** - Toast notification system
6. **`types/graphql.ts`** - TypeScript types for GraphQL operations

### Modified Files

1. **`app/signup/page.tsx`** - Updated to integrate GraphQL signup mutation
2. **`app/signin/page.tsx`** - Updated to integrate GraphQL login mutation

## Usage

### Basic Signup Flow

The signup page now includes:

- **Form Validation**: Client-side validation for required fields and email format
- **GraphQL Integration**: Calls the signup mutation with user data
- **Error Handling**: Displays field-specific and general errors
- **Loading States**: Shows loading spinner during signup process
- **Success Handling**: Shows success toast and redirects to proposal creation page
- **Toast Notifications**: User-friendly success/error messages

### Basic Signin Flow

The signin page now includes:

- **Form Validation**: Client-side validation for email format and required fields
- **GraphQL Integration**: Calls the login mutation with user credentials
- **Token Management**: Automatically stores access and refresh tokens in localStorage
- **Error Handling**: Displays field-specific and general errors
- **Loading States**: Shows loading spinner during signin process
- **Success Handling**: Shows personalized welcome message and redirects to proposal page
- **Toast Notifications**: User-friendly success/error messages

### Signup Hook Usage

```typescript
import { useSignup } from '@/hooks/useSignup';

const { signup, loading, errors, clearErrors } = useSignup({
  onSuccess: (result) => {
    // Handle successful signup
    console.log('User created:', result);
  },
  onError: (errors) => {
    // Handle signup errors
    console.error('Signup failed:', errors);
  }
});

// Call signup
await signup({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'securepassword123'
});
```

### Signin Hook Usage

```typescript
import { useSignin } from '@/hooks/useSignin';

const { signin, loading, errors, clearErrors } = useSignin({
  onSuccess: (result) => {
    // Handle successful signin
    console.log('User signed in:', result.user);
    console.log('Tokens:', result.tokens);
  },
  onError: (errors) => {
    // Handle signin errors
    console.error('Signin failed:', errors);
  }
});

// Call signin
await signin({
  email: 'user@example.com',
  password: 'securepassword123'
});
```

## GraphQL Mutations

### Signup Mutation

The signup mutation expects the following structure:

```graphql
mutation MyMutation($firstName: String = "", $email: String = "", $lastName: String = "", $password: String = "") {
  register(
    input: {email: $email, password: $password, lastName: $lastName, firstName: $firstName}
  ) {
    email
    firstName
    groups
    id
    isActive
    isStaff
    isSuperuser
    lastName
    profileImageUrl
  }
}
```

### Login Mutation

The login mutation expects the following structure:

```graphql
mutation MyMutation($email: String = "", $password: String = "") {
  login(input: {email: $email, password: $password}) {
    tokens {
      access
      refresh
    }
    user {
      email
      firstName
      groups
      id
      isActive
      isStaff
      isSuperuser
      lastName
      profileImageUrl
    }
  }
}
```

## Error Handling

The system handles various error scenarios:

1. **Validation Errors**: Field-level validation with inline error display
2. **Server Errors**: GraphQL errors from mutations mapped to user-friendly errors
3. **Network Errors**: Connection issues and timeout handling
4. **Password Mismatch**: Client-side password confirmation validation (signup only)
5. **Invalid Credentials**: Specific error handling for login failures

The register mutation returns user data directly on success, while the login mutation returns both user data and authentication tokens, which are handled appropriately by their respective hooks.

## Alternative: Apollo Client

If you prefer to use Apollo Client instead of `graphql-request`, you can:

1. Install Apollo Client:
```bash
npm install @apollo/client graphql
```

2. Uncomment the Apollo Client configuration in `lib/graphql/client.ts`

3. Update the `useSignup` hook to use Apollo Client's `useMutation` hook

## Dependencies Added

- `graphql-request`: Lightweight GraphQL client
- `graphql`: GraphQL core library

## Testing

To test the integration:

1. Set up your GraphQL endpoint
2. Configure the environment variable
3. Navigate to `/signup`
4. Fill out the form and submit
5. Check for proper error handling and success flow

## Next Steps

Consider implementing:

1. **Email Verification**: Add email verification flow after signup
2. **Password Requirements**: Add password strength validation
3. **Social Login**: Integrate Google/Microsoft OAuth
4. **Rate Limiting**: Add client-side rate limiting for signup attempts
5. **Analytics**: Track signup success/failure rates
