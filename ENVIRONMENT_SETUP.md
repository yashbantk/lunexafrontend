# Environment Setup Guide

## Quick Setup

1. **Create your local environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update the GraphQL URL in `.env.local` (note the trailing slash):**
   ```bash
   # For your ngrok setup:
   NEXT_PUBLIC_GRAPHQL_URL=https://1af83ff1d893.ngrok-free.app/graphql/
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Environment File Structure

### `.env.local` (Create this file - it's gitignored)
```bash
# GraphQL Configuration
NEXT_PUBLIC_GRAPHQL_URL=https://1af83ff1d893.ngrok-free.app/graphql
```

### `.env.example` (Template file - safe to commit)
```bash
# GraphQL Configuration
NEXT_PUBLIC_GRAPHQL_URL=https://your-graphql-endpoint.com/graphql
```

## Important Notes

- ✅ `.env.local` is automatically ignored by git (won't be pushed)
- ✅ Each developer can have their own `.env.local` with different URLs
- ✅ The `.env.example` file serves as a template for new developers
- ✅ Never commit sensitive URLs or API keys to the repository

## Common URLs

### Development
- **Local GraphQL server:** `http://localhost:4000/graphql/`
- **ngrok tunnel:** `https://your-ngrok-url.ngrok-free.app/graphql/`
- **Docker container:** `http://localhost:8080/graphql/`

### Production
- **Production API:** `https://api.deyor.com/graphql/`
- **Staging API:** `https://staging-api.deyor.com/graphql/`

**Important:** Always include the trailing slash (`/`) in your GraphQL URLs to avoid Django's `APPEND_SLASH` redirect issues.

## Troubleshooting

If you're still seeing hardcoded URLs:

1. **Check your `.env.local` file exists and has the correct URL**
2. **Restart your development server:** `npm run dev`
3. **Clear Next.js cache:** `rm -rf .next && npm run dev`
4. **Check browser cache:** Hard refresh (Ctrl+Shift+R)

## Security Best Practices

- Never commit `.env.local` files
- Use different URLs for different environments
- Rotate ngrok URLs regularly for security
- Use environment-specific API keys when available

## Post-Signup Flow

After successful signup, users are automatically redirected to the proposal creation page (`/proposal`) where they can start building their first travel proposal.
