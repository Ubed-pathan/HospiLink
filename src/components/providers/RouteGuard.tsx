'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const handledRef = useRef(false);

  useEffect(() => {
    const destinationFor = (user?: { role?: 'patient' | 'doctor' | 'admin'; roles?: Array<'patient' | 'doctor' | 'admin'> }) => {
      const roles = user?.roles || [];
      const primary = user?.role;
      if (roles.includes('admin') || primary === 'admin') return '/admin';
      if (roles.includes('doctor') || primary === 'doctor') return '/doctor';
      return '/portal';
    };
    const maybeRedirect = (isAuthenticated: boolean | undefined, user?: { role?: 'patient' | 'doctor' | 'admin'; roles?: Array<'patient' | 'doctor' | 'admin'> }) => {
      if (handledRef.current) return;
      if (typeof isAuthenticated === 'undefined') return;
      if (pathname === '/') {
        // Unauthenticated: send to signin
        if (!isAuthenticated) {
          handledRef.current = true;
          router.replace('/auth/signin');
          return;
        }
        // Authenticated admins can view the normal homepage; others redirect to their dashboard
        const isAdmin = !!(user?.role === 'admin' || user?.roles?.includes('admin'));
        if (!isAdmin) {
          handledRef.current = true;
          router.replace(destinationFor(user));
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
