'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

const rawKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

// Determine if user has provided a real Clerk publishable key from dashboard.clerk.com
export const isRealClerkKey =
  (rawKey.startsWith('pk_test_') || rawKey.startsWith('pk_live_')) &&
  !rawKey.includes('aW5zcGVjdGVk') &&
  !rawKey.includes('placeholder') &&
  !rawKey.includes('sample') &&
  rawKey.length > 40;

export const ClerkWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isRealClerkKey) {
    return <ClerkProvider publishableKey={rawKey}>{children}</ClerkProvider>;
  }

  // If no real key provided, render children directly so browser never handshakes dummy domains
  return <>{children}</>;
};
