-- Delete all existing categories for all users
DELETE FROM public.categories;

-- Insert new default categories for all users
INSERT INTO public.categories (user_id, group_name, icon, name)
SELECT 
  u.id as user_id,
  category.group_name,
  category.icon,
  category.name
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('Advertising', '📢', 'Digital advertising'),
    ('Advertising', '🏟', 'Outdoor advertising'),
    ('Auto & Transport', '🔧', 'Auto maintenance'),
    ('Auto & Transport', '🚗', 'Auto payment'),
    ('Auto & Transport', '⛽', 'Gas'),
    ('Auto & Transport', '🅿️', 'Parking & tolls'),
    ('Auto & Transport', '🚎', 'Public transit'),
    ('Auto & Transport', '🚕', 'Taxi & ride shares'),
    ('Bills & Utilities', '⚡', 'Gas & electric'),
    ('Bills & Utilities', '🌐', 'Internet & cable'),
    ('Bills & Utilities', '📱', 'Phone'),
    ('Bills & Utilities', '💧', 'Water'),
    ('Food & Dining', '🍽️', 'Business travel & meals'),
    ('Food & Dining', '🍎', 'Groceries'),
    ('Office', '🔧', 'Office improvement'),
    ('Office', '🖇', 'Office supplies & expenses'),
    ('Office', '🏢', 'Rent'),
    ('Other', '📋', 'Business insurance'),
    ('Other', '📦', 'Postage and shipping'),
    ('Other', '❓', 'Uncategorized'),
    ('Wages', '💰', 'Employee wages & contract labor')
) AS category(group_name, icon, name);

