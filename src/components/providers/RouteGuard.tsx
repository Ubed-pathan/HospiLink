'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const handledRef = useRef(false);

  useEffect(() => {
    // Landing page (/) must be visible to everyone after login.
    // Enforce guard for the /doctor area (main guard is RequireRole; this is extra safety and handles post-logout UX).
    const maybeRedirect = (isAuthenticated: boolean | undefined, user?: { role?: 'patient' | 'doctor' | 'admin'; roles?: Array<'patient' | 'doctor' | 'admin'> }) => {
      if (handledRef.current) return;
      if (typeof isAuthenticated === 'undefined') return;
      // Landing page behavior:
      // - If unauthenticated, send to sign-in (post-logout experience)
      // - If authenticated, allow staying on landing page
      if (pathname === '/') {
        if (!isAuthenticated) {
          handledRef.current = true;
          router.replace('/auth/signin');
          return;
        }
        return;
      }

      // Block /doctor for non-doctors and unauthenticated users with nuanced behavior:
      // - If unauthenticated, send to sign-in
      // - If authenticated but not a doctor, send to landing
      if (pathname.startsWith('/doctor')) {
        const roles = user?.roles || [];
        const isDoctor = !!(user?.role === 'doctor' || roles.includes('doctor'));
        if (!isAuthenticated) {
          handledRef.current = true;
          router.replace('/auth/signin');
          return;
        }
        if (!isDoctor) {
          handledRef.current = true;
          router.replace('/');
          return;
        }
      }
    };

  // First, check if the provider already set the flag
  type WUser = { role?: 'patient' | 'doctor' | 'admin'; roles?: Array<'patient' | 'doctor' | 'admin'> };
  maybeRedirect(window.__HOSPILINK_AUTH__?.isAuthenticated, window.__HOSPILINK_AUTH__?.user as WUser | undefined);

    // Then, listen for the ready event once
    const onReady = (e: Event) => {
  const detail = (e as CustomEvent).detail as { isAuthenticated: boolean; user?: { role?: 'patient' | 'doctor' | 'admin'; roles?: Array<'patient' | 'doctor' | 'admin'> } } | undefined;
  maybeRedirect(detail?.isAuthenticated, detail?.user);
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, [pathname, router]);

  return null;
}
