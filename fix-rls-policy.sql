-- Fix RLS Policy for User Creation
-- This allows the trigger function to insert new user profiles

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create a new policy that works with the trigger
-- The trigger runs with SECURITY DEFINER so it needs special handling
CREATE POLICY "Enable insert for authenticated users and service role" 
ON public.users
FOR INSERT 
WITH CHECK (true);

-- Alternative: If you want stricter security, use this instead:
-- CREATE POLICY "Enable insert for authenticated users" 
-- ON public.users
-- FOR INSERT 
-- WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

