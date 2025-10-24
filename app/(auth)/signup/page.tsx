"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useSignUp } from "@/hooks/auth";

/**
 * Sign Up Page
 * 
 * Expense tracking app - Registration screen
 */
export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signUp, loading, error, clearError } = useSignUp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔵 Form submitted!", { email, password, name });
    clearError();
    setValidationError(null);
    setSuccessMessage(null);

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
      firstName: name || undefined,
      lastName: undefined,
    });

    console.log("✅ SignUp result:", success);

    if (success) {
      console.log("🟢 Account created! Check email for confirmation.");
      setSuccessMessage("Account created successfully! Please check your email to confirm your account. After confirmation, you can sign in to access your dashboard.");
      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm">
        {/* Signup Card */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                Sign up and start tracking expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {successMessage && (
                <div className="text-sm text-green-700 text-center bg-green-50 p-3 rounded-md border border-green-200">
                  {successMessage}
                </div>
              )}

              {(error || validationError) && (
                <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
                  {validationError || error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?
              </div>
              <Button asChild variant="outline" className="w-full hover:bg-orange-50">
                <Link href={ROUTES.LOGIN}>
                  Sign In
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}

