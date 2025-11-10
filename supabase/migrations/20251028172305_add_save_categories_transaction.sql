-- Create a transactional function to save user categories
-- This ensures atomicity: either all categories are saved or none are
CREATE OR REPLACE FUNCTION save_user_categories_transaction(
  p_user_id UUID,
  p_categories JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Delete all existing categories for this user
  DELETE FROM public.categories
  WHERE user_id = p_user_id;

  -- Insert all new categories from the JSON array
  -- p_categories is expected to be an array of objects with:
  -- category_slug, group_name, icon, name
  INSERT INTO public.categories (user_id, category_slug, group_name, icon, name)
  SELECT
    p_user_id,
    (category->>'category_slug')::TEXT,
    (category->>'group_name')::TEXT,
    (category->>'icon')::TEXT,
    (category->>'name')::TEXT
  FROM jsonb_array_elements(p_categories) AS category;

  -- If we reach here, both operations succeeded
  -- The transaction will commit automatically
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_user_categories_transaction(UUID, JSONB) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION save_user_categories_transaction(UUID, JSONB) IS 
  'Atomically replaces all categories for a user. Either all categories are saved or none are (transaction rollback on error).';







