'use client';

import { useUser, useAuth } from '@clerk/nextjs';

export function useSafeUser() {
  try {
    const userRes = useUser();
    return userRes;
  } catch (e) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }
}

export function useSafeAuth() {
  try {
    const authRes = useAuth();
    return authRes;
  } catch (e) {
    return { isLoaded: true, isSignedIn: false, userId: null, getToken: async () => null };
  }
}
