-- Complete fix for user signup trigger and RLS
-- Run this entire script in Supabase SQL Editor

-- 1. Drop and recreate the trigger and function with proper permissions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Temporarily disable RLS to update policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users and service role" ON public.users;

-- 4. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Create new policies that work with triggers
CREATE POLICY "Enable read access for users" 
ON public.users
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable update for users" 
ON public.users
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Enable insert for all" 
ON public.users
FOR INSERT 
WITH CHECK (true);

-- 6. Recreate the trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'firstName' || ' ' || NEW.raw_user_meta_data->>'lastName',
      NEW.raw_user_meta_data->>'firstName',
      NEW.raw_user_meta_data->>'lastName',
      NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 7. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT ON public.users TO authenticated;

