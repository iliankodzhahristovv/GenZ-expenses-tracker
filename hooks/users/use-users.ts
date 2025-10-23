import useSWR from "swr";
import { SWR_KEYS } from "@/lib/constants";
import { getAllUsers } from "@/actions/users";
import { UserUI } from "@/mappers/user-ui.mapper";

/**
 * Hook return type
 */
interface UseUsersReturn {
  users: UserUI[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Custom hook to fetch all users
 * Uses SWR for data fetching and caching
 */
export function useUsers(): UseUsersReturn {
  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.CURRENT_USER,
    getAllUsers,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    users: data || [],
    isLoading,
    error: error || null,
    mutate,
  };
}

