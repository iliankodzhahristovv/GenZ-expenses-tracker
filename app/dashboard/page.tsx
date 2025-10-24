"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useSignOut } from "@/hooks/auth";
import { ROUTES } from "@/lib/constants";

/**
 * Dashboard Page
 * 
 * Protected page - requires authentication
 */
export default function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const { signOut, loading: signingOut } = useSignOut();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (mounted && !loading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, mounted, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.HOME);
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user.displayName}!
              </p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              disabled={signingOut}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            >
              {signingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              This is your dashboard. Build something amazing here! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

