# Environment Variables Setup Guide

Complete guide for configuring environment variables in the Next.js Clean Architecture Template.

## 📋 Overview

This project uses environment variables to configure:
- Supabase database connection
- Application URLs
- Third-party service integrations
- Feature flags and debugging

## 🚀 Quick Start

### Local Development Setup

1. **Start Supabase**:
   ```bash
   pnpm supabase:start
   ```

2. **Get Supabase credentials**:
   ```bash
   pnpm supabase:status
   ```

3. **Copy environment template**:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Update `.env.local`** with values from `pnpm supabase:status`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

## 📁 Environment Files

### `.env.example`
Template showing all available environment variables with descriptions.
- ✅ **Committed to git**
- 📝 Use as reference for all environments

### `.env.local.example`
Template specifically for local development with Supabase Local.
- ✅ **Committed to git**
- 📝 Copy to `.env.local` for local dev

### `.env.production.example`
Template for production environment configuration.
- ✅ **Committed to git**
- 📝 Use when deploying to production

### `.env.local`
Your actual local development environment variables.
- ❌ **NOT committed to git** (in `.gitignore`)
- 🔒 Contains your actual local credentials

### `.env.production.local`
Your actual production environment variables (if managing locally).
- ❌ **NOT committed to git** (in `.gitignore`)
- 🔒 Contains your actual production credentials

## 🔑 Required Variables

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Required**: Yes
- **Type**: String (URL)
- **Description**: Your Supabase project URL
- **Local Development**: `http://127.0.0.1:54321`
- **Production**: `https://your-project.supabase.co`
- **Get from**: 
  - Local: `pnpm supabase:status`
  - Production: Supabase Dashboard → Settings → API

#### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Required**: Yes
- **Type**: String (JWT)
- **Description**: Supabase anonymous/public key (safe for client-side)
- **Format**: Starts with `eyJhbGciOiJIUzI1NiIs...`
- **Get from**: 
  - Local: `pnpm supabase:status`
  - Production: Supabase Dashboard → Settings → API

### Application Configuration

#### `NEXT_PUBLIC_APP_URL`
- **Required**: Recommended
- **Type**: String (URL)
- **Description**: Your application's public URL
- **Local Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`
- **Used for**: Redirects, email links, OAuth callbacks

#### `NODE_ENV`
- **Required**: No (auto-set by Next.js)
- **Type**: String
- **Options**: `development`, `production`, `test`
- **Description**: Current environment mode
- **Note**: Usually set automatically by your deployment platform

## 🎯 Environment-Specific Setup

### Local Development

**File**: `.env.local`

```bash
# 1. Start Supabase
pnpm supabase:start

# 2. Copy template
cp .env.local.example .env.local

# 3. Get credentials
pnpm supabase:status

# 4. Edit .env.local with the values shown
```

**Example `.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Deployment

#### Option 1: Vercel (Recommended)

1. **Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = eyJhbGci...
   NEXT_PUBLIC_APP_URL = https://yourdomain.com
   ```

3. **Set environment**: Production

4. **Redeploy**: Changes take effect after redeployment

#### Option 2: Other Platforms

**Netlify**:
- Site Settings → Build & Deploy → Environment → Environment Variables

**Railway**:
- Project → Variables → Add variables

**AWS/Docker**:
- Use environment variables in your container/instance configuration

## 🔐 Security Best Practices

### ✅ DO

- ✅ Use `.env.local` for local development
- ✅ Add all `.env*.local` files to `.gitignore`
- ✅ Use `NEXT_PUBLIC_` prefix only for client-safe variables
- ✅ Store sensitive keys in your deployment platform's environment settings
- ✅ Rotate keys regularly
- ✅ Use different keys for different environments
- ✅ Document all required variables in `.env.example`

### ❌ DON'T

- ❌ Commit `.env.local` or `.env.production.local` to git
- ❌ Share environment files in chat, email, or public forums
- ❌ Use production credentials in development
- ❌ Hard-code sensitive values in your codebase
- ❌ Use `NEXT_PUBLIC_` for server-only secrets
- ❌ Expose service account keys or private keys

## 🔄 Variable Types

### Client-Side Variables (`NEXT_PUBLIC_*`)

**Exposed to the browser** - safe for client-side code:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
```

**Use when**:
- Value is needed in React components
- Value is safe to expose publicly
- Value is used for client-side integrations

### Server-Side Variables (no prefix)

**Only available on the server** - never exposed to the browser:
```env
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
DATABASE_PASSWORD=...
API_SECRET_KEY=...
```

**Use when**:
- Value is sensitive (passwords, secret keys)
- Value is only needed in server actions/API routes
- Value should never be exposed to clients

## 📝 Adding New Variables

When adding a new environment variable:

1. **Add to `.env.example`** with description:
   ```env
   # Description of what this does
   # Example: value-format
   NEW_VARIABLE_NAME=
   ```

2. **Add to relevant example files**:
   - `.env.local.example` (if used locally)
   - `.env.production.example` (if used in production)

3. **Document in this file** under "Optional Variables"

4. **Update deployment platform** with actual values

5. **Inform team members** to update their local `.env.local`

## 🔧 Optional Variables

### Analytics & Monitoring

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
```

### Payment Processing

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email Services

```env
# SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### File Storage

```env
# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Development Tools

```env
# Debug Mode
NEXT_PUBLIC_DEBUG_MODE=true

# Verbose Logging
NEXT_PUBLIC_VERBOSE_LOGGING=true
```

## 🐛 Troubleshooting

### Variables Not Loading

**Problem**: Environment variables are undefined

**Solutions**:
1. Restart dev server after changing `.env.local`:
   ```bash
   # Stop server (Ctrl+C) then:
   pnpm dev
   ```

2. Check file name is exactly `.env.local` (not `.env.local.txt`)

3. Verify variables are in correct format:
   ```env
   VARIABLE_NAME=value
   # No spaces around =
   # No quotes needed (usually)
   ```

### Supabase Connection Fails

**Problem**: "Invalid API key" or connection errors

**Solutions**:
1. Verify Supabase is running:
   ```bash
   pnpm supabase:status
   ```

2. Check URL and key match exactly from `supabase:status`

3. Ensure URL doesn't have trailing slash:
   ```env
   # ✅ Correct
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   
   # ❌ Wrong
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321/
   ```

### Production Variables Not Working

**Problem**: App works locally but fails in production

**Solutions**:
1. Verify all variables are set in deployment platform

2. Check variable names match exactly (case-sensitive)

3. Redeploy after adding/changing variables

4. Review deployment logs for specific errors

## 📚 Additional Resources

- [Next.js Environment Variables Docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Security Best Practices](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)

## ✅ Checklist

Before deploying to production:

- [ ] All required variables set in deployment platform
- [ ] Production Supabase project created
- [ ] Production keys different from development
- [ ] No sensitive values committed to git
- [ ] `.env.example` is up to date
- [ ] Team members have updated their local `.env.local`
- [ ] Production URLs are correct
- [ ] Test deployment with production variables

## 💡 Tips

1. **Use environment-specific values**: Never use production credentials in development
2. **Document everything**: Always add new variables to `.env.example` with comments
3. **Automate when possible**: Use deployment platform's variable management
4. **Test before deploying**: Verify all variables work in staging environment
5. **Keep it secure**: Treat environment variables like passwords

