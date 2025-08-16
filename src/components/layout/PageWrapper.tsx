'use client';

/**
 * Page Wrapper with Client Providers
 * Use this wrapper for pages that need Recoil or other client-side features
 */

import React from 'react';
import ClientProviders from '@/components/providers/ClientProviders';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  );
}
