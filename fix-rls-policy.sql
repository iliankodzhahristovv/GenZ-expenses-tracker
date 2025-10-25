-- Fix RLS Policy for User Creation
-- This allows the trigger function to insert new user profiles

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create a secure policy that works with the trigger
-- The trigger runs with SECURITY DEFINER (service_role) so it can insert any row
-- Regular users can only insert rows where id matches their auth.uid()
CREATE POLICY "Enable insert for authenticated users and service role" 
ON public.users
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR id = auth.uid());

