"use client";

import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { signInWithPasswordAction } from "@/actions/auth";
import { SWR_KEYS } from "@/lib/constants";

interface SignInCredentials {
  email: string;
  password: string;
}

interface UseSignInReturn {
  signIn: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const signInMutation = async (key: string, { arg }: { arg: SignInCredentials }) => {
  const response = await signInWithPasswordAction(arg);

  if (response.success) {
    // Invalidate auth-related SWR caches
    await mutate(SWR_KEYS.CURRENT_USER);
    await mutate(SWR_KEYS.CURRENT_SESSION);
    return response.data;
  } else {
    throw new Error(response.error || "Sign in failed");
  }
};

/**
 * Custom hook for signing in with email and password
 */
export function useSignIn(): UseSignInReturn {
  const { trigger, isMutating, error, reset } = useSWRMutation(SWR_KEYS.SIGN_IN, signInMutation, {
    revalidate: false,
  });

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      await trigger({ email, password });
      return true;
    } catch (err) {
      return false;
    }
  };

  const clearError = () => {
    reset();
  };

  return {
    signIn,
    loading: isMutating,
    error: error?.message || null,
    clearError,
  };
}

