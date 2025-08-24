/**
 * Main Providers Component
 * Wraps the app with all necessary providers (Recoil, Theme, Auth)
 */

'use client';

import React from 'react';
import { RecoilRoot } from 'recoil';
import AuthProvider from './AuthProvider-simple';
import { ThemeProvider } from './ThemeProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <RecoilRoot>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </RecoilRoot>
  );
}
