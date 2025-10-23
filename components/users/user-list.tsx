"use client";

import { useUsers } from "@/hooks/users/use-users";
import { UserCard } from "./user-card";

/**
 * User list component
 * Fetches and displays a list of users
 */
export function UserList() {
  const { users, isLoading, error } = useUsers();

  if (isLoading) {
    return <div className="text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading users: {error.message}</div>;
  }

  if (users.length === 0) {
    return <div className="text-center text-muted-foreground">No users found</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

