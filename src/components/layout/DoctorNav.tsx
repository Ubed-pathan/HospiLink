'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PresenceToggle from '@/components/doctor/PresenceToggle';

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
  { href: '/doctor', label: 'Overview' },
  { href: '/doctor/appointments', label: 'Appointments' },
  { href: '/doctor/schedule', label: 'Schedule' },
  { href: '/doctor/patients', label: 'Patients' },
  { href: '/doctor/reviews', label: 'Reviews' },
  { href: '/doctor/settings', label: 'Settings' },
];

export default function DoctorNav() {
  const pathname = usePathname();

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-3">
        <nav aria-label="Doctor navigation" className="flex-1 overflow-x-auto">
          <ul className="flex items-center gap-1 text-sm min-w-max">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/doctor' && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-block px-3 py-2 rounded-md border transition-colors ${
                      isActive
                        ? 'text-blue-700 bg-blue-50 border-blue-200'
                        : 'text-gray-700 border-transparent hover:text-blue-700 hover:border-blue-200'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <PresenceToggle />
      </div>
    </div>
  );
}
