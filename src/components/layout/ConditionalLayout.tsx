'use client';

/**
 * Conditional Layout Component
 * Shows nav/footer only when user is authenticated and not on auth pages
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Don't show nav/footer on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');
  const isPortalPage = pathname?.startsWith('/portal');
  
  // Show nav/footer on non-auth, non-portal pages (portal will render its own chrome when authenticated)
  const showNavFooter = !isAuthPage && !isPortalPage;

  return (
    <>
      {showNavFooter && <NavHeader />}
      <main>
        {children}
      </main>
      {showNavFooter && <Footer />}
    </>
  );
}
