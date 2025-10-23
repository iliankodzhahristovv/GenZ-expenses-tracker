"use client";

import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { signUpWithPasswordAction } from "@/actions/auth";
import { SWR_KEYS } from "@/lib/constants";

interface SignUpCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface UseSignUpReturn {
  signUp: (credentials: SignUpCredentials) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const signUpMutation = async (key: string, { arg }: { arg: SignUpCredentials }) => {
  const response = await signUpWithPasswordAction(arg);

  if (response.success) {
    // Invalidate auth-related SWR caches
    await mutate(SWR_KEYS.CURRENT_USER);
    await mutate(SWR_KEYS.CURRENT_SESSION);
    return response.data;
  } else {
    throw new Error(response.error || "Sign up failed");
  }
};

/**
 * Custom hook for signing up with email and password
 */
export function useSignUp(): UseSignUpReturn {
  const { trigger, isMutating, error, reset } = useSWRMutation(SWR_KEYS.SIGN_UP, signUpMutation, {
    revalidate: false,
  });

  const signUp = async (credentials: SignUpCredentials): Promise<boolean> => {
    try {
      await trigger(credentials);
      return true;
    } catch (err) {
      return false;
    }
  };

  const clearError = () => {
    reset();
  };

  return {
    signUp,
    loading: isMutating,
    error: error?.message || null,
    clearError,
  };
}

