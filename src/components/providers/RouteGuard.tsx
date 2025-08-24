'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

declare global {
  interface Window {
    __HOSPILINK_AUTH__?: { isAuthenticated: boolean };
  }
}

export default function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const handledRef = useRef(false);

  useEffect(() => {
    const maybeRedirect = (isAuthenticated: boolean | undefined) => {
      if (handledRef.current) return;
      if (typeof isAuthenticated === 'undefined') return;
      if (pathname?.startsWith('/portal') && !isAuthenticated) {
        handledRef.current = true;
        router.replace('/auth/signin');
      }
    };

    // First, check if the provider already set the flag
    maybeRedirect(window.__HOSPILINK_AUTH__?.isAuthenticated);

    // Then, listen for the ready event once
    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isAuthenticated: boolean } | undefined;
      maybeRedirect(detail?.isAuthenticated);
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, [pathname, router]);

  return null;
}
