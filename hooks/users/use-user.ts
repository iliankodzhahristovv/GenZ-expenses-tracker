import useSWR from "swr";
import { SWR_KEYS } from "@/lib/constants";
import { getUserById } from "@/actions/users";
import { UserUI } from "@/mappers/user-ui.mapper";

/**
 * Hook return type
 */
interface UseUserReturn {
  user: UserUI | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Custom hook to fetch a user by ID
 * Uses SWR for data fetching and caching
 */
export function useUser(userId: string | null): UseUserReturn {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? [SWR_KEYS.CURRENT_USER, userId] : null,
    () => (userId ? getUserById(userId) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    user: data || null,
    isLoading,
    error: error || null,
    mutate,
  };
}

