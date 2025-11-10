import useSWR from "swr";
import { SWR_KEYS } from "@/lib/constants";
import { getExpensesAction } from "@/actions/expenses";

/**
 * Expense interface
 */
export interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

/**
 * Hook return type
 */
interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Fetcher function for SWR
 */
const fetchExpenses = async (): Promise<Expense[]> => {
  const response = await getExpensesAction();
  
  if (response.success && response.data) {
    return response.data;
  }
  
  return [];
};

/**
 * Custom hook to fetch all expenses for the current user
 * Uses SWR for data fetching and caching
 */
export function useExpenses(): UseExpensesReturn {
  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.EXPENSES,
    fetchExpenses,
    {
      revalidateOnFocus: true, // Revalidate when switching back to the tab
      revalidateOnReconnect: false,
      dedupingInterval: 2000, // 2 seconds - faster updates
      refreshInterval: 0, // Don't auto-refresh, only on focus or manual mutate
    }
  );

  return {
    expenses: data || [],
    isLoading,
    error: error || null,
    mutate,
  };
}

