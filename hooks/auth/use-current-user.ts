"use client";

import useSWR from "swr";
import { getCurrentUserAction } from "@/actions/auth";
import { SWR_KEYS } from "@/lib/constants";
import type { UserUI } from "@/models";

const fetchCurrentUser = async (): Promise<UserUI | null> => {
  const response = await getCurrentUserAction();

  if (response.success) {
    return response.data;
  }

  return null;
};

/**
 * Custom hook to get the current authenticated user
 */
export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR(SWR_KEYS.CURRENT_USER, fetchCurrentUser, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
  });

  return {
    user: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

