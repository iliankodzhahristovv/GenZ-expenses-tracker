import { UserUI } from "@/mappers/user-ui.mapper";
import { cn } from "@/lib/utils";

/**
 * Props for UserCard component
 */
interface UserCardProps {
  user: UserUI;
  className?: string;
}

/**
 * User card component
 * Displays user information in a card format
 */
export function UserCard({ user, className }: UserCardProps) {
  return (
    <div className={cn("rounded-lg border p-4 shadow-sm", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{user.displayName}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="text-xs text-muted-foreground">
          <p>Created: {user.createdAt}</p>
          <p>Updated: {user.updatedAt}</p>
        </div>
      </div>
    </div>
  );
}

