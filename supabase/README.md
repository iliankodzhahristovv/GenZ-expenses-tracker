# Supabase Local Development

This directory contains the Supabase configuration and database schema for local development.

## 📁 Structure

```
supabase/
├── config.toml          # Supabase CLI configuration
├── migrations/          # Database migrations (chronological)
│   └── YYYYMMDDHHMMSS_description.sql
├── seeds/               # Seed data for local development
│   └── 01_sample_data.sql
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

Install the Supabase CLI:

```bash
# macOS
brew install supabase/tap/supabase

# npm
npm install -g supabase

# pnpm
pnpm add -g supabase
```

### Local Development Setup

1. **Start Supabase locally**

   ```bash
   npx supabase start
   ```

   This will:
   - Start a local Postgres database
   - Start Supabase Studio (dashboard)
   - Start authentication services
   - Start storage services
   - Apply all migrations
   - Run seed data

2. **Get your local credentials**

   ```bash
   npx supabase status
   ```

   Copy the values to your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

3. **Access Supabase Studio**

   Open http://127.0.0.1:54323 in your browser to access the local dashboard.

4. **Stop Supabase**

   ```bash
   npx supabase stop
   ```

## 🗄️ Database Migrations

### Creating a New Migration

```bash
# Create a new migration file
npx supabase migration new description_of_changes
```

This creates a file in `migrations/` with the current timestamp.

### Migration Best Practices

1. **One logical change per migration**
   - Don't combine unrelated schema changes
   - Keep migrations focused and atomic

2. **Always test migrations**
   ```bash
   npx supabase db reset  # Resets DB and runs all migrations + seeds
   ```

3. **Use descriptive names**
   - Good: `add_user_profiles_table`
   - Good: `add_rls_policies_for_posts`
   - Bad: `update_schema`

4. **Include rollback considerations**
   - Write migrations that can be reverted if needed
   - Test the migration on a copy of production data

### Example Migration Structure

```sql
-- migrations/20250101000000_add_posts_table.sql

-- Add posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  content text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
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

-- Add indexes
create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);

-- Add comments
comment on table public.posts is 'User-created posts';
```

### Applying Migrations

**Local development:**
```bash
npx supabase db reset  # Resets and applies all migrations
```

**Production:**
```bash
npx supabase db push  # Pushes new migrations to production
```

## 🌱 Seed Data

Seed files run after migrations during `npx supabase db reset`.

### Creating Seed Files

Create files in `seeds/` directory with numeric prefixes:

```
seeds/
├── 01_categories.sql
├── 02_sample_users.sql
└── 03_demo_content.sql
```

### Seed File Best Practices

1. **Use for development only**
   - Never run seed data in production
   - Keep seed data separate from migrations

2. **Use consistent IDs**
   - Use predictable UUIDs for test data
   - Makes testing easier

3. **Keep seeds minimal**
   - Only include data needed for development
   - Don't seed with large datasets

### Example Seed File

```sql
-- seeds/01_categories.sql

-- Insert sample categories
insert into public.categories (id, name, description) values
  ('00000000-0000-0000-0000-000000000001', 'Technology', 'Tech-related posts'),
  ('00000000-0000-0000-0000-000000000002', 'Design', 'Design-related posts'),
  ('00000000-0000-0000-0000-000000000003', 'Business', 'Business-related posts')
on conflict (id) do nothing;

select 'Categories seeded successfully' as message;
```

## 🔐 Row Level Security (RLS)

Always enable RLS for tables containing user data:

```sql
-- Enable RLS
alter table public.my_table enable row level security;

-- Common RLS patterns:

-- 1. Users can only see their own data
create policy "Users view own data" on public.my_table
  for select using (auth.uid() = user_id);

-- 2. Authenticated users can see all data
create policy "Authenticated users view all" on public.my_table
  for select using (auth.role() = 'authenticated');

-- 3. Public read, authenticated write
create policy "Public read" on public.my_table
  for select using (true);

create policy "Authenticated write" on public.my_table
  for insert with check (auth.role() = 'authenticated');

-- 4. Admin only access
create policy "Admin only" on public.my_table
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );
```

## 📊 Useful Commands

### Database

```bash
# Reset database (drops all data, reruns migrations + seeds)
npx supabase db reset

# Create a new migration
npx supabase migration new my_migration_name

# Create migration from database diff
npx supabase db diff -f my_migration_name

# Push migrations to remote database
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > types/database.types.ts
```

### Status and Logs

```bash
# View service status
npx supabase status

# View logs
npx supabase logs
npx supabase logs db
npx supabase logs auth
```

### Testing

```bash
# Test a specific migration
npx supabase db reset
npx supabase db migrate up

# Test RLS policies in SQL editor
set role authenticated;
select * from public.my_table;
```

## 🔗 Connecting to Remote Supabase

### Link to Remote Project

```bash
npx supabase link --project-ref your-project-ref
```

### Pull Remote Schema

```bash
npx supabase db pull
```

### Push Local Changes to Remote

```bash
npx supabase db push
```

## 📖 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)

## 🆘 Troubleshooting

### Database won't start

```bash
# Stop all services
npx supabase stop

# Remove all containers and volumes
npx supabase stop --no-backup

# Start fresh
npx supabase start
```

### Migration fails

```bash
# Check migration syntax
cat supabase/migrations/your_migration.sql

# Test migration on clean database
npx supabase db reset
```

### Can't connect to local database

```bash
# Check if services are running
npx supabase status

# Check Docker
docker ps

# Restart services
npx supabase stop
npx supabase start
```

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Always enable RLS on tables with user data
- Test RLS policies thoroughly
- Use service role key only in server-side code
- Keep anon key for client-side use only

