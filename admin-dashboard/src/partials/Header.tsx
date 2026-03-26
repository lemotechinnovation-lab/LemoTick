import { useState } from 'react';

import DropdownLanguage from '@/components/DropdownLanguage';
import DropdownMessages from '@/components/DropdownMessages';
import DropdownNotifications from '@/components/DropdownNotifications';
import { useAuthStore } from '@/features/auth/stores/authStore';
import UserMenu from '../components/DropdownProfile';

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {

  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuthStore();

  const getWelcomeMessage = () => {
    if (!user) return 'Welcome';
    const firstName = user.firstName;
    const hour = new Date().getHours();

    if (hour < 12) {
      return `Good morning, ${firstName}`;
    } else if (hour < 17) {
      return `Good afternoon, ${firstName}`;
    } else {
      return `Good evening, ${firstName}`;
    }
  };

  return (
    <header className="sticky top-0 bg-[#16124A] dark:bg-gradient-to-r dark:from-[#1A1547] dark:via-[#1E1B52] dark:to-[#1A1547] backdrop-blur-md border-b border-[#2F6BFF]/30 shadow-[0_4px_20px_rgba(30,109,227,0.15)] z-10 relative">
      {/* Subtle glow effect at bottom of header */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2F6BFF]/50 to-transparent"></div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Header: Left side - Search */}
          <div className="flex items-center flex-1 max-w-xs lg:max-w-md">
            {/* Hamburger button for mobile */}
            <button
              className="text-gray-300 hover:text-[#efdede] dark:hover:text-gray-200 lg:hidden mr-4"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>

            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#16124A]/50 border border-[#2F6BFF]/20 rounded-lg text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all text-sm backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Header: Center - Welcome Message */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-sm mx-8">
            <div className="text-center">
              <h1 className="text-sm font-medium text-[#efdede]">
                {getWelcomeMessage()}
              </h1>
              {user && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Header: Right side - Icons */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Language Dropdown */}
            <DropdownLanguage align="right" />

            {/* Divider */}
            <div className="w-px h-6 bg-[#2F6BFF]/20"></div>

            {/* Messages Dropdown */}
            <DropdownMessages align="right" />

            {/* Notifications Dropdown */}
            <DropdownNotifications align="right" />

            {/* Profile */}
            <UserMenu align="right" />
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
