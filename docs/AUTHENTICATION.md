# Authentication Guide

Complete guide to authentication in the Next.js Clean Architecture Template.

## 📋 Overview

This template includes a complete authentication system using Supabase Auth with email and password. The authentication follows clean architecture principles with proper separation of concerns.

## 🏗️ Architecture

### Clean Architecture Layers

#### Domain Layer (`modules/auth/domain/`)

- **Models**: `AuthSession`, `AuthUser`
- **Repository Interface**: `AuthRepository`
- **Service**: `AuthService` (business logic)

#### Data Layer (`modules/auth/data/`)

- **Repository Implementation**: `SupabaseAuthRepository`
- **Mapper**: `AuthMapper` (Supabase ↔ Domain)
- **Entities**: Maps to `UserEntity` from database

#### Presentation Layer

- **Server Actions** (`actions/auth.ts`): Next.js server actions
- **Custom Hooks** (`hooks/auth/`): SWR-based data fetching
- **Components** (`components/auth/`): Login, SignUp, UserMenu
- **Pages** (`app/(auth)/`): Login and SignUp pages
- **UI Mappers** (`mappers/auth-ui.mapper.ts`): Domain ↔ UI models

## 🚀 Quick Start

### 1. Set Up Supabase

```bash
# Start local Supabase
pnpm supabase:start

# Run migrations (includes auth trigger)
pnpm supabase:reset

# Generate types
pnpm generate:types
```

### 2. Configure Environment Variables

Create `.env.local`:

```env
# Get these from: pnpm supabase:status
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### 3. Test Authentication

1. Visit `http://localhost:3000/signup`
2. Create an account
3. You'll be automatically signed in
4. See your user info in the header

## 🔐 Features

### Email and Password Authentication

- ✅ Sign up with email and password
- ✅ Sign in with email and password
- ✅ Sign out
- ✅ Session management
- ✅ Automatic user profile creation
- ✅ Protected routes

### User Profile

When a user signs up:
1. Supabase creates entry in `auth.users`
2. Trigger automatically creates entry in `public.users`
3. User profile includes: email, name, timestamps

## 📝 Usage Examples

### Using Authentication Hooks

#### Sign In

```typescript
// components/my-login-form.tsx
"use client";

import { useSignIn } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export function MyLoginForm() {
  const { signIn, loading, error } = useSignIn();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signIn(email, password);
    if (success) {
      router.push(ROUTES.HOME);
    }
  };

  // ... form JSX
}
```

#### Sign Up

```typescript
"use client";

import { useSignUp } from "@/hooks/auth";

export function MySignUpForm() {
  const { signUp, loading, error } = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signUp({
      email,
      password,
      firstName: "John",
      lastName: "Doe",
    });
    
    if (success) {
      // Redirect or show success message
    }
  };

  // ... form JSX
}
```

#### Get Current User

```typescript
"use client";

import { useCurrentUser } from "@/hooks/auth";

export function UserProfile() {
  const { user, loading, error } = useCurrentUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h1>Welcome {user.firstName || user.email}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

#### Sign Out

```typescript
"use client";

import { useSignOut } from "@/hooks/auth";

export function LogoutButton() {
  const { signOut, loading } = useSignOut();

  return (
    <button onClick={() => signOut()} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
```

### Using Server Actions

#### Protect a Server Component

```typescript
// app/dashboard/page.tsx
import { requireAuthenticationAction } from "@/actions/auth";

export default async function DashboardPage() {
  const response = await requireAuthenticationAction();
  
  if (!response.success) {
    // Redirects to login automatically
    return null;
  }

  const user = response.data;

  return (
    <div>
      <h1>Welcome {user.firstName}!</h1>
    </div>
  );
}
```

#### Check Authentication Status

```typescript
// app/api/route.ts
import { getCurrentUserAction } from "@/actions/auth";

export async function GET() {
  const response = await getCurrentUserAction();

  if (!response.success || !response.data) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ user: response.data });
}
```

## 🎨 UI Components

### Pre-built Components

#### LoginForm

```typescript
import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  return <LoginForm />;
}
```

#### SignUpForm

```typescript
import { SignUpForm } from "@/components/auth";

export default function SignUpPage() {
  return <SignUpForm />;
}
```

#### UserMenu

Shows user info and sign out option in a dropdown:

```typescript
import { UserMenu } from "@/components/auth";

export function Header() {
  return (
    <header>
      <nav>
        {/* ... other nav items */}
        <UserMenu />
      </nav>
    </header>
  );
}
```

## 🗄️ Database Schema

### Users Table

```sql
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique,
  name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

### Auth Trigger

Automatically creates a user profile when someone signs up:

```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name',
      new.email
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 🔒 Security

### Row Level Security (RLS)

Add RLS policies to protect user data:

```sql
-- Enable RLS
alter table public.users enable row level security;

-- Users can view their own data
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

-- Users can update their own data
create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);
```

### Session Management

- Sessions are managed by Supabase
- Access tokens expire (configured in `supabase/config.toml`)
- Refresh tokens enable silent re-authentication
- Sessions are stored securely in HTTP-only cookies

## 🛠️ Advanced Usage

### Custom User Fields

1. **Update Migration**:

```sql
-- supabase/migrations/TIMESTAMP_add_custom_fields.sql
alter table public.users
  add column phone text,
  add column avatar_url text;
```

2. **Update Entity**:

```typescript
// modules/users/data/entities/user.entity.ts
export interface UserEntity {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;     // Add
  avatar_url: string | null; // Add
  created_at: string;
  updated_at: string;
}
```

3. **Update Domain Model**:

```typescript
// modules/users/domain/models/user.model.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone?: string;       // Add
  avatarUrl?: string;   // Add
  createdAt: Date;
  updatedAt: Date;
}
```

4. **Update Mappers**: Update `UserMapper` and `UserUIMapper`

5. **Regenerate Types**:

```bash
pnpm generate:types
```

### Extend Auth Service

```typescript
// modules/auth/domain/services/auth.service.ts
@injectable()
export class AuthService {
  // ... existing methods

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserModel> {
    // Implementation
  }

  /**
   * Change password
   */
  async changePassword(newPassword: string): Promise<void> {
    // Implementation
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    // Implementation
  }
}
```

## 📚 API Reference

### Server Actions

| Action | Description | Returns |
|--------|-------------|---------|
| `signInWithPasswordAction` | Sign in with email/password | `ApiResponse<AuthSessionUI>` |
| `signUpWithPasswordAction` | Sign up new user | `ApiResponse<AuthSessionUI>` |
| `signOutAction` | Sign out current user | `void` |
| `getCurrentUserAction` | Get current user profile | `ApiResponse<UserUI \| null>` |
| `getCurrentSessionAction` | Get current session | `ApiResponse<AuthSessionUI \| null>` |
| `requireAuthenticationAction` | Require auth (redirects if not) | `ApiResponse<UserUI>` |
| `isAuthenticatedAction` | Check if authenticated | `ApiResponse<boolean>` |

### Hooks

| Hook | Description | Returns |
|------|-------------|---------|
| `useSignIn()` | Sign in hook | `{ signIn, loading, error, clearError }` |
| `useSignUp()` | Sign up hook | `{ signUp, loading, error, clearError }` |
| `useSignOut()` | Sign out hook | `{ signOut, loading, error }` |
| `useCurrentUser()` | Get current user | `{ user, loading, error, refetch }` |
| `useCurrentSession()` | Get current session | `{ session, loading, error, refetch }` |

## 🐛 Troubleshooting

### User Not Created After Signup

**Problem**: Auth user created but no profile in `users` table

**Solution**: Check that the trigger is properly installed:

```bash
pnpm supabase:reset
```

### Session Not Persisting

**Problem**: User gets logged out on page refresh

**Solution**: Ensure cookies are configured correctly. Check `lib/supabase/server.ts` and `lib/supabase/client.ts`.

### Type Errors

**Problem**: TypeScript errors about missing properties

**Solution**: Regenerate types after schema changes:

```bash
pnpm generate:types
```

## 🔄 Migration Guide

### From No Auth to Auth

1. Install dependencies:
```bash
pnpm install
```

2. Run migrations:
```bash
pnpm supabase:reset
```

3. Update your components to use auth hooks

4. Add `<UserMenu />` to your header

5. Protect routes with `requireAuthenticationAction()`

## 📖 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [SWR Documentation](https://swr.vercel.app/)
- [Clean Architecture](docs/ARCHITECTURE.md)

## 🎯 Best Practices

1. **Always use server actions** for auth operations from client components
2. **Use hooks for data fetching** with SWR for automatic caching
3. **Protect sensitive routes** with `requireAuthenticationAction()`
4. **Handle loading and error states** in your UI
5. **Clear SWR cache** on sign in/out using `mutate()`
6. **Don't store sensitive data** in client-side state
7. **Use RLS** to protect your database tables
8. **Validate user input** in server actions before processing

## 🚀 What's Next?

- Add email verification
- Implement password reset
- Add OAuth providers (Google, GitHub, etc.)
- Add multi-factor authentication (MFA)
- Implement role-based access control (RBAC)
- Add user profile editing
- Implement account deletion

