-- Add currency column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS currency VARCHAR(20) DEFAULT 'Dollar';

-- Update existing users to have default currency
UPDATE public.users 
SET currency = 'Dollar' 
WHERE currency IS NULL;


