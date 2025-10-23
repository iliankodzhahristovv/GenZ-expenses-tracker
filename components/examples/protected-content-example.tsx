"use client";

import { useIsAuthenticated } from "@/providers";

/**
 * Example 4: Protected Component
 * Shows how to use authentication hooks
 */
export function ProtectedContentExample() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-800">Access Denied</p>
        <p className="text-sm text-yellow-700">You must be logged in to view this content.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-500 bg-green-50 p-4">
      <p className="text-sm font-semibold text-green-800">Protected Content</p>
      <p className="text-sm text-green-700">You have access to this content!</p>
    </div>
  );
}

