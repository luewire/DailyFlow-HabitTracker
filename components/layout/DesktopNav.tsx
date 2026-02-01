'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Clock, Dumbbell } from 'lucide-react';

const navItems = [
  { name: 'Tasks', path: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Focus Timer', path: '/dashboard/focus', icon: Clock },
  { name: 'Workout', path: '/dashboard/workout', icon: Dumbbell },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center gap-3 mb-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-sm transition-all border ${
              isActive
                ? 'bg-blue-50 border-blue-300 shadow-md'
                : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-200'
            }`}
          >
            <Icon 
              size={20} 
              className={isActive ? 'text-blue-600' : 'text-gray-600'} 
            />
            <span className={`font-medium ${
              isActive ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
