"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

/**
 * Sign Up Form Component
 * 
 * Allows users to create a new account with email and password
 */
export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { signUp, loading, error, clearError } = useSignUp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 Form submitted!", { email, password, firstName, lastName });
    clearError();
    setValidationError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      console.log("❌ Passwords do not match");
      setValidationError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Password too short");
      setValidationError("Password must be at least 6 characters");
      return;
    }

    console.log("🟡 Calling signUp function...");
    const success = await signUp({
      email,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    console.log("✅ SignUp result:", success);

    if (success) {
      console.log("🟢 Redirecting to home...");
      router.push(ROUTES.HOME);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Create your account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>
        </div>

        {(error || validationError) && (
          <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
            {validationError || error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}

