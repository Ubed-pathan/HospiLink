'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-services';
import { CalendarDays, Stethoscope, Users, Building2, Star, Settings, LayoutDashboard, LogOut } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      try {
        (window as unknown as { __HOSPILINK_AUTH__?: { isAuthenticated: boolean; user?: unknown } }).__HOSPILINK_AUTH__ = { isAuthenticated: false, user: null as unknown as undefined } as unknown as { isAuthenticated: boolean; user?: unknown };
        window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: { isAuthenticated: false, user: null } }));
      } catch {}
      router.replace('/');
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname === '/admin/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="mt-3 -mb-2 overflow-x-auto" aria-label="Admin sections">
      <ul className="flex items-center gap-2 text-sm">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  active
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : 'text-gray-700 border-transparent hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
        {/* visual separator before logout */}
        <li aria-hidden="true" className="mx-1 h-6 w-px bg-gray-200" />
        <li>
          <button
            onClick={logout}
            aria-label="Logout"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-300 text-red-700 bg-white hover:bg-red-50 hover:border-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
