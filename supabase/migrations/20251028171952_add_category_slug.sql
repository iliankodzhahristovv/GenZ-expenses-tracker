-- Add category_slug column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS category_slug TEXT;

-- Create index on category_slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(user_id, category_slug);

-- Update existing rows to generate slugs from names
-- This is a one-time update for existing data
UPDATE public.categories 
SET category_slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE category_slug IS NULL;

-- Make category_slug NOT NULL after populating existing rows
ALTER TABLE public.categories 
ALTER COLUMN category_slug SET NOT NULL;

-- Add unique constraint on (user_id, category_slug)
ALTER TABLE public.categories 
ADD CONSTRAINT unique_user_category_slug UNIQUE (user_id, category_slug);







