-- Migration: Add trigger to create user profile on signup
-- This ensures every auth.users entry has a corresponding public.users entry

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
      new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name',
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

-- Add comment
comment on function public.handle_new_user is 'Automatically creates a user profile in public.users when a new auth user is created';

