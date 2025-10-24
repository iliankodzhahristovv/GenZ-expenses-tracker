-- ========================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ========================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ========================================
-- CREATE USERS TABLE
-- ========================================

-- Create users table (extends auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- RLS Policies for users table
-- Users can read their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Users can update their own data
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Users can insert their own data (for new sign-ups)
create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- ========================================
-- CREATE AUTO USER PROFILE TRIGGER
-- ========================================

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(concat_ws(' ', new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name'), ''),
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.email
    )
  );
  return new;
end;
$$;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================
-- CREATE UPDATED_AT TRIGGER
-- ========================================

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to users table
drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- ========================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ========================================

comment on table public.users is 'User profiles extending auth.users';
comment on column public.users.id is 'References auth.users.id';
comment on column public.users.email is 'User email address';
comment on column public.users.name is 'User display name';
comment on column public.users.avatar_url is 'URL to user avatar image';
comment on function public.handle_new_user is 'Automatically creates a user profile in public.users when a new auth user is created';

-- ========================================
-- DONE! 🎉
-- ========================================

