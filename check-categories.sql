-- Check how many categories exist per user
SELECT 
  u.email,
  COUNT(c.id) as category_count,
  COUNT(DISTINCT c.group_name) as group_count
FROM auth.users u
LEFT JOIN public.categories c ON c.user_id = u.id
GROUP BY u.id, u.email
ORDER BY u.email;

-- Show all categories for verification
SELECT 
  group_name,
  icon,
  name,
  COUNT(*) as user_count
FROM public.categories
GROUP BY group_name, icon, name
ORDER BY group_name, name;

