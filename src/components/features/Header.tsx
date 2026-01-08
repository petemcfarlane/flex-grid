'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isMap = pathname === '/map';

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-50">
      <nav className="max-w-4xl mx-auto px-4 py-0">
        {/* Tab Navigation */}
        <div className="flex items-center gap-0">
          <Link
            href="/"
            className={`flex-1 px-4 py-4 font-semibold text-center border-b-2 transition-colors ${
              isHome
                ? 'text-emerald-400 border-emerald-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            📊 Live Grid
          </Link>
          <Link
            href="/map"
            className={`flex-1 px-4 py-4 font-semibold text-center border-b-2 transition-colors ${
              isMap
                ? 'text-emerald-400 border-emerald-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            🗺️ Asset Map
          </Link>
        </div>
      </nav>
    </header>
  );
};
