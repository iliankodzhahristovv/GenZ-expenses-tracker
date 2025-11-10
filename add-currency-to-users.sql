-- Add currency column to users table using ISO 4217 currency codes
-- Uses CHAR(3) for fixed-length 3-letter ISO codes (e.g., USD, EUR, GBP)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'USD';

-- Add CHECK constraint to enforce ISO 4217 format (3 uppercase letters)
-- Uses IF NOT EXISTS pattern by checking pg_constraint catalog
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_currency_iso_format_check'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_currency_iso_format_check 
    CHECK (currency ~ '^[A-Z]{3}$');
  END IF;
END $$;

-- Update existing users to use ISO 4217 codes
-- Convert free-text currency names to ISO codes
UPDATE public.users 
SET currency = CASE 
  WHEN currency = 'Dollar' OR currency IS NULL THEN 'USD'
  WHEN currency = 'Euro' THEN 'EUR'
  ELSE 'USD' -- Default fallback for any other values
END
WHERE currency IS NULL 
   OR currency NOT IN ('USD', 'EUR')
   OR currency IN ('Dollar', 'Euro');


