'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Calendar, ListChecks, BarChart3, Clock, Settings } from 'lucide-react';

const navItems = [
  { name: 'Daily', path: '/dashboard/tasks', icon: Calendar },
  { name: 'Habits', path: '/dashboard/workout', icon: ListChecks },
  { name: 'Stats', path: '/dashboard/stats', icon: BarChart3 },
  { name: 'Timer', path: '/dashboard/focus', icon: Clock },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl"
      style={{
        background: 'rgba(13, 27, 14, 0.95)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 pb-8 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200"
              style={{
                color: isActive ? 'var(--accent-green)' : 'var(--text-muted)',
              }}
            >
              <div
                className="p-1.5 rounded-lg mb-0.5 transition-all duration-200"
                style={{
                  background: isActive ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{
                  color: isActive ? 'var(--accent-green)' : 'var(--text-muted)',
                }}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
