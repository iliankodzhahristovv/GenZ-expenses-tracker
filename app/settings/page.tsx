"use client";

import { ProtectedLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignOut, useCurrentUser } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Settings Page
 * 
 * Protected page - requires authentication
 */
export default function SettingsPage() {
  const { signOut, loading: signingOut } = useSignOut();
  const { user } = useCurrentUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.HOME);
  };

  return (
    <ProtectedLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-sm text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-600 mt-1">{user?.displayName || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card>
            <CardHeader>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>End your current session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSignOut}
                disabled={signingOut}
                variant="destructive"
              >
                {signingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}

