# Supabase Integration Guide

Complete guide for using Supabase with this clean architecture template.

## 📋 Overview

This template is pre-configured to work with Supabase for:
- **Authentication** - User sign-up, sign-in, and session management
- **Database** - PostgreSQL with Row Level Security (RLS)
- **Storage** - File uploads and management
- **Realtime** - Realtime database subscriptions (optional)

## 🏗️ Architecture Integration

### Clean Architecture Layers

```
┌──────────────────────────────────────────────┐
│         Presentation Layer                    │
│  • Server Actions (lib/supabase/server.ts)  │
│  • Client Components (lib/supabase/client.ts)│
├──────────────────────────────────────────────┤
│         Domain Layer                          │
│  • Repository Interfaces                     │
│  • Services (business logic)                 │
├──────────────────────────────────────────────┤
│         Data Layer                            │
│  • SupabaseUserRepository                    │
│  • Supabase client calls                     │
│  • Entity↔Domain mappers                     │
├──────────────────────────────────────────────┤
│         Infrastructure                        │
│  • Supabase Database                         │
│  • Supabase Auth                             │
│  • Supabase Storage                          │
└──────────────────────────────────────────────┘
```

### Repository Pattern with Supabase

All Supabase interactions go through repositories:

```typescript
// Domain Layer - Interface
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract create(user: CreateUserDTO): Promise<User>;
}

// Data Layer - Supabase Implementation
@injectable()
export class SupabaseUserRepository extends UserRepository {
  async findById(id: string): Promise<User | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return UserMapper.toDomain(data);
  }
}
```

## 🚀 Setup

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# npm/pnpm
pnpm add -g supabase
```

### 2. Initialize Supabase

```bash
# Already initialized in this template
# If starting fresh:
npx supabase init
```

### 3. Start Local Development

```bash
npx supabase start
```

### 4. Get Credentials

```bash
npx supabase status
```

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

## 📝 Creating Tables

### Using Migrations

1. **Create a migration:**
   ```bash
   npx supabase migration new create_posts_table
   ```

2. **Write the schema:**
   ```sql
   -- supabase/migrations/TIMESTAMP_create_posts_table.sql
   
   create table public.posts (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references public.users(id) on delete cascade not null,
     title text not null,
     content text,
     created_at timestamptz default now() not null,
     updated_at timestamptz default now() not null
   );

   -- Enable RLS
   alter table public.posts enable row level security;

   -- RLS Policies
   create policy "Users can view all posts" on public.posts
     for select using (true);

   create policy "Users can create own posts" on public.posts
     for insert with check (auth.uid() = user_id);

   create policy "Users can update own posts" on public.posts
     for update using (auth.uid() = user_id);

   create policy "Users can delete own posts" on public.posts
     for delete using (auth.uid() = user_id);

   -- Indexes
   create index posts_user_id_idx on public.posts(user_id);
   create index posts_created_at_idx on public.posts(created_at desc);
   ```

3. **Apply the migration:**
   ```bash
   npx supabase db reset  # Local
   npx supabase db push   # Remote
   ```

## 🔐 Authentication

### Server-Side Auth

Use in server components and server actions:

```typescript
// actions/auth.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;
  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
```

### Client-Side Auth

Use in client components:

```typescript
// components/auth/login-form.tsx
"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const supabase = createClient();

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Error signing in:", error);
    }
  };

  // ...
}
```

### Protected Routes

```typescript
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <Dashboard user={user} />;
}
```

## 🗄️ Database Operations

### Creating a Repository

1. **Define domain interface:**
   ```typescript
   // modules/posts/domain/repositories/post.repository.interface.ts
   export abstract class PostRepository {
     abstract findAll(): Promise<Post[]>;
     abstract findById(id: string): Promise<Post | null>;
     abstract findByUser(userId: string): Promise<Post[]>;
     abstract create(post: CreatePostDTO): Promise<Post>;
     abstract update(id: string, post: UpdatePostDTO): Promise<Post>;
     abstract delete(id: string): Promise<void>;
   }
   ```

2. **Implement with Supabase:**
   ```typescript
   // modules/posts/data/repositories/supabase-post.repository.ts
   @injectable()
   export class SupabasePostRepository extends PostRepository {
     async findAll(): Promise<Post[]> {
       const supabase = await createClient();
       const { data, error } = await supabase
         .from('posts')
         .select('*')
         .order('created_at', { ascending: false });

       if (error) throw new Error(error.message);
       return data.map(PostMapper.toDomain);
     }

     async create(post: CreatePostDTO): Promise<Post> {
       const supabase = await createClient();
       const { data, error } = await supabase
         .from('posts')
         .insert(post)
         .select()
         .single();

       if (error || !data) throw new Error(error?.message);
       return PostMapper.toDomain(data);
     }
   }
   ```

3. **Register in module:**
   ```typescript
   // modules/posts/post.module.ts
   export class PostModule {
     static register(container: Container): void {
       container.bind(PostRepository).to(SupabasePostRepository);
       container.bind(PostService).toSelf().inSingletonScope();
     }
   }
   ```

## 📦 Storage

### Upload Files

```typescript
// Server action
export async function uploadFile(file: File, bucket: string) {
  const supabase = await createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) throw new Error(error.message);
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}
```

### Configure Buckets

Add to `supabase/config.toml`:

```toml
[storage.buckets.avatars]
public = true
file_size_limit = "5MiB"
allowed_mime_types = ["image/*"]
```

## 🔒 Row Level Security (RLS)

### Common RLS Patterns

**1. User owns record:**
```sql
create policy "Users can view own records" on public.records
  for select using (auth.uid() = user_id);
```

**2. Public read, authenticated write:**
```sql
create policy "Public read" on public.posts
  for select using (true);

create policy "Authenticated write" on public.posts
  for insert with check (auth.role() = 'authenticated');
```

**3. Role-based access:**
```sql
create policy "Admin only" on public.sensitive_data
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
```

## 🎯 Best Practices

### 1. Always Use Repositories

❌ **Don't** call Supabase directly in components:
```typescript
// ❌ Bad
function MyComponent() {
  const supabase = createClient();
  const { data } = await supabase.from('users').select('*');
}
```

✅ **Do** use repositories:
```typescript
// ✅ Good
function MyComponent() {
  const { users } = useUsers(); // Uses repository via service
}
```

### 2. Server vs Client

- **Server Actions**: Use for mutations and sensitive operations
- **Client Components**: Use for interactive UI and real-time updates
- **Server Components**: Use for initial data fetching

### 3. Type Generation

Generate TypeScript types from your database schema:

```bash
npx supabase gen types typescript --local > types/database.types.ts
```

Use in your entities:

```typescript
import { Database } from "@/types/database.types";

type UserEntity = Database['public']['Tables']['users']['Row'];
```

### 4. Error Handling

Always handle Supabase errors:

```typescript
const { data, error } = await supabase.from('users').select('*');

if (error) {
  console.error('Database error:', error);
  throw new Error('Failed to fetch users');
}
```

### 5. Testing

Mock Supabase in tests:

```typescript
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    }),
  }),
}));
```

## 📊 Performance Tips

### 1. Use Indexes

```sql
create index posts_user_id_idx on posts(user_id);
create index posts_created_at_idx on posts(created_at desc);
```

### 2. Select Only Needed Columns

```typescript
// ❌ Bad
const { data } = await supabase.from('posts').select('*');

// ✅ Good
const { data } = await supabase.from('posts').select('id, title, created_at');
```

### 3. Use Pagination

```typescript
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(start, end)
  .order('created_at', { ascending: false });
```

### 4. Enable Realtime Selectively

Only enable realtime for tables that need it.

## 🔧 Common Issues

### Issue: RLS blocks all queries

**Solution:** Check your RLS policies and ensure they match your auth setup.

```sql
-- Test RLS by setting role
set role authenticated;
set request.jwt.claims.sub = 'user-uuid-here';
select * from public.posts;
```

### Issue: Types out of sync

**Solution:** Regenerate types after schema changes:

```bash
npx supabase gen types typescript --local > types/database.types.ts
```

### Issue: Migration fails

**Solution:** Check migration syntax and test on clean database:

```bash
npx supabase db reset
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🆘 Getting Help

- [Supabase Discord](https://discord.supabase.com/)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

