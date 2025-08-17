/**
 * Main Providers Component
 * Wraps the app with necessary providers (Auth, Theme) - No Recoil
 */

'use client';

import React from 'react';
import AuthProvider from './AuthProvider-simple';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
