# Fix Supabase Email Confirmation

## Step 1: Configure Redirect URLs in Supabase

1. Go to: https://supabase.com/dashboard/project/pbdmyrjftgoxarzowohd
2. Click **"Authentication"** → **"URL Configuration"**
3. Add these URLs:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Add `http://localhost:3000/**` (with the wildcard)
4. Click **Save**

## Step 2: Delete the Old Unconfirmed Account

Since your first signup has an expired link, delete it:

1. Go to **"Authentication"** → **"Users"** in Supabase
2. Find the user with email `ilian.pavlinov@gmail.com`
3. Click the **"..."** menu → **"Delete user"**

## Step 3: Delete from Users Table Too

1. Go to **"Table Editor"** → **"users"**
2. Find and delete the same user record there

## Step 4: Sign Up Again

1. Go to: http://localhost:3000/signup
2. Sign up with the same email (now it's deleted)
3. Check your email quickly and click the confirmation link **within a few minutes**
4. The link should work now with the redirect URL configured

## Step 5: Login

After confirming your email:
1. Go to: http://localhost:3000/login
2. Enter your email and password
3. Click "Sign In"
4. You should be logged in successfully!

