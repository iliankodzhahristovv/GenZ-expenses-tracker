"use client";

import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { mutate } from "swr";
import { SWR_KEYS, ROUTES } from "@/lib/constants";

interface UseSignOutReturn {
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const signOutMutation = async () => {
  // Clear auth caches before signing out
  await mutate(SWR_KEYS.CURRENT_USER, null, false);
  await mutate(SWR_KEYS.CURRENT_SESSION, null, false);

  await signOutAction();
};

/**
 * Custom hook for signing out
 */
export function useSignOut(): UseSignOutReturn {
  const router = useRouter();

  const { trigger, isMutating, error } = useSWRMutation(SWR_KEYS.SIGN_OUT, signOutMutation, {
    revalidate: false,
    onSuccess: async () => {
      // Successful sign out - redirect to home
      router.push(ROUTES.HOME);
    },
    onError: async () => {
      // Even if sign out fails, clear local cache and redirect to home
      await mutate(SWR_KEYS.CURRENT_USER, null, false);
      await mutate(SWR_KEYS.CURRENT_SESSION, null, false);
      router.push(ROUTES.HOME);
    },
  });

  const signOut = async (): Promise<void> => {
    await trigger();
  };

  return {
    signOut,
    loading: isMutating,
    error: error?.message || null,
  };
}

