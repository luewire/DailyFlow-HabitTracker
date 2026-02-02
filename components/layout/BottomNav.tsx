'use client';

import { usePathname, useRouter } from 'next/navigation';
import { CheckSquare, Clock, Dumbbell } from 'lucide-react';

const navItems = [
  { name: 'Tasks', path: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Focus', path: '/dashboard/focus', icon: Clock },
  { name: 'Workout', path: '/dashboard/workout', icon: Dumbbell },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 pb-4 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
