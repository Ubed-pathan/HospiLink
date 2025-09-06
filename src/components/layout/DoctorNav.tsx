'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-services';
import { LayoutDashboard, CalendarDays, CalendarClock, UserCircle2, Star, Settings, LogOut } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/doctor', label: 'Overview', icon: LayoutDashboard },
  { href: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/doctor/schedule', label: 'Schedule', icon: CalendarClock },
  { href: '/doctor/patients', label: 'Patients', icon: UserCircle2 },
  { href: '/doctor/reviews', label: 'Reviews', icon: Star },
  { href: '/doctor/settings', label: 'Settings', icon: Settings },
];

export default function DoctorNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
  router.replace('/auth/signin');
    }
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-start gap-3">
        <nav aria-label="Doctor navigation" className="w-full overflow-x-auto">
          <ul className="flex items-center gap-2 text-sm min-w-max">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = href === '/doctor'
                ? pathname === '/doctor' || pathname === '/doctor/'
                : pathname === href || pathname?.startsWith(href + '/');
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
                aria-label="Logout"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-300 text-red-700 bg-white hover:bg-red-50 hover:border-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
