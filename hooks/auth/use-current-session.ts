"use client";

import useSWR from "swr";
import { getCurrentSessionAction } from "@/actions/auth";
import { SWR_KEYS } from "@/lib/constants";
import type { AuthSessionUI } from "@/models/auth-ui.model";

const fetchCurrentSession = async (): Promise<AuthSessionUI | null> => {
  const response = await getCurrentSessionAction();

  if (response.success) {
    return response.data;
  }

  return null;
};

/**
 * Custom hook to get the current session
 */
export function useCurrentSession() {
  const { data, error, isLoading, mutate } = useSWR(SWR_KEYS.CURRENT_SESSION, fetchCurrentSession, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
  });

  return {
    session: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
}

