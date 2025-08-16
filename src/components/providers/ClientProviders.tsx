'use client';

/**
 * Client-Side Providers
 * Wraps all client-side providers to avoid SSR issues
 */

import React from 'react';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from './ThemeProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <RecoilRoot>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </RecoilRoot>
  );
}
