import { UserList } from "@/components/users/user-list";

/**
 * Users page
 * Example page showing how to use components with data fetching
 */
export default function UsersPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Example of users list with SWR data fetching</p>
      </div>
      
      <UserList />
      
      <div className="mt-8">
        <a href="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to home
        </a>
      </div>
    </div>
  );
}

