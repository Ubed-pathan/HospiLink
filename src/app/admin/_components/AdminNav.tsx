'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-services';
import { CalendarDays, Stethoscope, Users, UserCircle2, Building2, Star, Settings, LayoutDashboard } from 'lucide-react';

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
  { href: '/admin/patients', label: 'Patients', icon: UserCircle2 },
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
      router.replace('/auth/signin');
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
        <li>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-transparent text-gray-700 hover:text-red-700 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
