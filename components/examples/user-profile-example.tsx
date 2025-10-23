"use client";

import { useUser } from "@/providers";

/**
 * Example 1: Using User Context
 * Shows how to access and update user state
 */
export function UserProfileExample() {
  const { currentUser, updateCurrentUser, clearUser, isLoading, error } = useUser();

  if (isLoading) {
    return <div className="text-muted-foreground">Loading user...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!currentUser) {
    return <div className="text-muted-foreground">No user logged in</div>;
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="font-semibold">User Profile</h3>
        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
        <p className="text-sm">Display Name: {currentUser.displayName}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() =>
            updateCurrentUser({
              displayName: "Updated Name",
            })
          }
          className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:opacity-90"
        >
          Update Name
        </button>

        <button
          onClick={clearUser}
          className="rounded border px-3 py-1 text-sm hover:bg-muted"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

