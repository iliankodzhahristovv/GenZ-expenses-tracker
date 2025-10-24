-- Secure RLS Policies for Users Table
-- This addresses CodeRabbit's security recommendations

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users and service role" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for all" ON public.users;

-- 1. SELECT Policy: Users can view their own profile
CREATE POLICY "Enable read access for users" 
ON public.users
FOR SELECT 
USING (auth.uid() = id);

-- 2. UPDATE Policy: Users can update their own profile with ownership check
CREATE POLICY "Enable update for users" 
ON public.users
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);  -- Prevents changing ownership

-- 3. INSERT Policy: For service role (trigger) OR users inserting their own record
-- The trigger runs with service_role permissions via SECURITY DEFINER
-- Regular authenticated users can only insert rows where id matches their auth.uid()
CREATE POLICY "Allow insert via service role" 
ON public.users
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR id = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
GRANT INSERT ON public.users TO service_role;  -- Only service role for trigger

-- Note: The trigger runs with SECURITY DEFINER and uses service_role permissions

