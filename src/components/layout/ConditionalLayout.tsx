/**
 * Conditional Layout Component
 * Shows nav/footer only when user is authenticated and not on auth pages
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider-simple';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  // Don't show nav/footer on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');
  
  // Show nav/footer only if authenticated and not on auth pages
  const showNavFooter = isAuthenticated && !isAuthPage;

  return (
    <>
      {showNavFooter && <NavHeader />}
      <main className={showNavFooter ? 'pt-16' : ''}>
        {children}
      </main>
      {showNavFooter && <Footer />}
    </>
  );
}
