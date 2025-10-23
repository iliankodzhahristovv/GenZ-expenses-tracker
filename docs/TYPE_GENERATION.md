# Type Generation Guide

Complete guide to generating TypeScript types from your Supabase database schema.

## 📋 Overview

This template includes automated type generation that creates clean, type-safe interfaces for your database entities. The process has two steps:

1. **Generate Database Types** - Extract types directly from Supabase schema
2. **Generate Entity Types** - Create clean, importable entity interfaces

## 🔄 Two-Step Process

### Step 1: Generate Database Types

```bash
pnpm supabase:types
```

This generates `types/database.types.ts` directly from your Supabase schema.

**Output:**
```typescript
// types/database.types.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          updated_at?: string;
        };
      };
      // ... more tables
    };
  };
}
```

### Step 2: Generate Entity Types

```bash
pnpm generate:entities
```

This reads `database.types.ts` and generates clean entity types in `types/entity-types.ts`.

**Output:**
```typescript
// types/entity-types.ts

// Row Types (Main Entity Types)
export type UserEntity = Tables["users"]["Row"];
export type PostEntity = Tables["posts"]["Row"];
export type CommentEntity = Tables["comments"]["Row"];

// Insert Types
export type UserInsert = Tables["users"]["Insert"];
export type PostInsert = Tables["posts"]["Insert"];
export type CommentInsert = Tables["comments"]["Insert"];

// Update Types
export type UserUpdate = Tables["users"]["Update"];
export type PostUpdate = Tables["posts"]["Update"];
export type CommentUpdate = Tables["comments"]["Update"];
```

### Combined Command

Generate both at once:

```bash
pnpm generate:types
```

This runs both steps: `supabase:types` → `generate:entities`

## 🎯 Why Two Steps?

### Before (Without Entity Types)

❌ **Verbose and error-prone:**

```typescript
import { Database } from "@/types/database.types";

type UserEntity = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type PostEntity = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

// Easy to make mistakes with the nested structure
// Have to repeat this in every file
```

### After (With Entity Types)

✅ **Clean and type-safe:**

```typescript
import { UserEntity, UserInsert, PostEntity, PostInsert } from "@/types/entity-types";

// Much cleaner imports
// Auto-generated, consistent across the codebase
// No chance of typos in the nested paths
```

## 📝 Using Generated Types

### In Data Layer Entities

```typescript
// modules/users/data/entities/user.entity.ts
import { UserEntity } from "@/types/entity-types";

// Now you don't need to manually define the entity
// It's automatically synced with your database schema
export type { UserEntity };
```

### In Mappers

```typescript
// modules/users/data/mappers/user.mapper.ts
import { UserEntity } from "@/types/entity-types";
import { User } from "../../domain/models/user.model";

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      createdAt: new Date(entity.created_at),
      updatedAt: new Date(entity.updated_at),
    };
  }
}
```

### In Repositories

```typescript
// modules/users/data/repositories/supabase-user.repository.ts
import { UserEntity, UserInsert, UserUpdate } from "@/types/entity-types";

@injectable()
export class SupabaseUserRepository extends UserRepository {
  async create(data: UserInsert): Promise<UserEntity> {
    const supabase = await createClient();
    const { data: user, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single();

    if (error || !user) {
      throw new Error(error?.message);
    }

    // No type assertion needed - it's already UserEntity!
    return user;
  }
}
```

## 🔧 Configuration

Edit `scripts/generate-entity-types.ts` to customize:

```typescript
const DEFAULT_CONFIG: Config = {
  databaseTypesPath: path.join(process.cwd(), "types/database.types.ts"),
  outputPath: path.join(process.cwd(), "types/entity-types.ts"),
  includeInsertTypes: true,      // Generate UserInsert types
  includeUpdateTypes: true,      // Generate UserUpdate types
  entitySuffix: "Entity",        // UserEntity vs User
};
```

### Naming Conventions

The script automatically converts snake_case table names to PascalCase:

| Table Name | Entity Type |
|------------|-------------|
| `users` | `UserEntity` |
| `user_profiles` | `UserProfileEntity` |
| `project_members` | `ProjectMemberEntity` |
| `blog_posts` | `BlogPostEntity` |

## 🔄 Workflow

### Initial Setup

```bash
# 1. Start Supabase
pnpm supabase:start

# 2. Run migrations
pnpm supabase:reset

# 3. Generate types
pnpm generate:types
```

### After Schema Changes

```bash
# 1. Create migration
pnpm supabase:migration:new add_posts_table

# 2. Write migration SQL
# Edit: supabase/migrations/TIMESTAMP_add_posts_table.sql

# 3. Apply migration
pnpm supabase:reset

# 4. Regenerate types
pnpm generate:types

# 5. Update your code to use the new PostEntity type
```

### Daily Development

```bash
# Just regenerate when needed
pnpm generate:types

# Or manually:
pnpm supabase:types        # Step 1: Database types
pnpm generate:entities     # Step 2: Entity types
```

## 🎨 Example Workflow

Let's say you want to add a `posts` table:

### 1. Create Migration

```bash
pnpm supabase:migration:new create_posts_table
```

### 2. Write Migration

```sql
-- supabase/migrations/TIMESTAMP_create_posts_table.sql

create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  content text,
  published boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.posts enable row level security;

create policy "Users can view published posts" on public.posts
  for select using (published = true);

create policy "Users can view own posts" on public.posts
  for select using (auth.uid() = user_id);
```

### 3. Apply Migration

```bash
pnpm supabase:reset
```

### 4. Generate Types

```bash
pnpm generate:types
```

This creates:
- `PostEntity`
- `PostInsert`
- `PostUpdate`

### 5. Use in Code

```typescript
// modules/posts/data/repositories/supabase-post.repository.ts
import { PostEntity, PostInsert, PostUpdate } from "@/types/entity-types";

@injectable()
export class SupabasePostRepository extends PostRepository {
  async create(data: PostInsert): Promise<PostEntity> {
    // Fully typed - TypeScript knows the exact shape!
    const supabase = await createClient();
    const { data: post, error } = await supabase
      .from('posts')
      .insert(data)
      .select()
      .single();

    if (error || !post) throw new Error(error?.message);
    return post; // Type is PostEntity, no assertion needed
  }
}
```

## 🛠️ Utility Types

The generated file includes helpful utility types:

### EntityType<T>

Get any table's row type by name:

```typescript
type UserRow = EntityType<'users'>;     // same as UserEntity
type PostRow = EntityType<'posts'>;     // same as PostEntity
```

### InsertType<T>

Get any table's insert type by name:

```typescript
type UserInsertType = InsertType<'users'>;   // same as UserInsert
type PostInsertType = InsertType<'posts'>;   // same as PostInsert
```

### UpdateType<T>

Get any table's update type by name:

```typescript
type UserUpdateType = UpdateType<'users'>;   // same as UserUpdate
type PostUpdateType = UpdateType<'posts'>;   // same as PostUpdate
```

### TableName

Union of all table names:

```typescript
type AllTables = TableName;  // 'users' | 'posts' | 'comments' | ...

function queryTable(tableName: TableName) {
  // TypeScript ensures tableName is a valid table
}
```

## ✅ Best Practices

### 1. Regenerate After Every Schema Change

```bash
# After creating/modifying migrations
pnpm supabase:reset
pnpm generate:types
```

### 2. Commit Generated Files

Both `database.types.ts` and `entity-types.ts` should be committed to git so team members have the latest types.

### 3. Use Entity Types Everywhere

```typescript
// ✅ Good
import { UserEntity } from "@/types/entity-types";

// ❌ Avoid
import { Database } from "@/types/database.types";
type UserEntity = Database["public"]["Tables"]["users"]["Row"];
```

### 4. Keep Suffix for Clarity

Using `Entity` suffix (e.g., `UserEntity`) makes it clear these are database entities, distinct from domain models (e.g., `User`).

### 5. Automate in CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Generate Types
  run: |
    pnpm supabase:start
    pnpm generate:types
    
- name: Check for Type Errors
  run: pnpm check
```

## 🚨 Troubleshooting

### Error: Database types file not found

**Solution:** Generate database types first:
```bash
pnpm supabase:types
```

### Error: No tables found

**Solution:** Run migrations:
```bash
pnpm supabase:reset
```

### Types are out of sync

**Solution:** Regenerate both:
```bash
pnpm generate:types
```

### Script doesn't run

**Solution:** Ensure tsx is installed:
```bash
pnpm add -D tsx
```

## 📚 Additional Resources

- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Clean Architecture Mappers](docs/ARCHITECTURE.md)

## 🎯 Summary

Type generation workflow:

1. **Create/modify migrations** → SQL schema changes
2. **Run `pnpm supabase:reset`** → Apply changes to local DB
3. **Run `pnpm generate:types`** → Generate TypeScript types
4. **Use entity types in code** → Type-safe database operations
5. **Commit types to git** → Share with team

This keeps your TypeScript types perfectly synchronized with your database schema! 🎉

