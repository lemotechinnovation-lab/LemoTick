import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DropdownFriendRequests from '@/components/DropdownFriendRequests';
import DropdownLanguage from '@/components/DropdownLanguage';
import DropdownMessages from '@/components/DropdownMessages';
import DropdownNotifications from '@/components/DropdownNotifications';
import ProfileDropdown from '@/components/shared/ProfileDropdown';
import { useAuthStore } from '@/features/auth/stores/authStore';

// Feature flag to enable/disable social features
const ENABLE_SOCIAL_FEATURES = import.meta.env.VITE_ENABLE_SOCIAL_FEATURES === 'true';

function Header({
  sidebarOpen,
  setSidebarOpen,
  onMessageClick,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onMessageClick?: (conversationId: string) => void;
}) {

  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/social/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 bg-chrome z-60 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.5)] overflow-visible">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 overflow-visible">

          {/* Left: Hamburger + Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0 max-w-md">
            {/* Hamburger button for mobile */}
            <button
              className="text-white hover:text-brand-primary lg:hidden shrink-0 transition-colors"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white" />
              </div>
              <input
                type="text"
                placeholder="Search traders, signals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-dark/30 border-0 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all text-sm"
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 overflow-visible">
            {/* Discover Button */}
            <button
              onClick={() => navigate('/social/timeline')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-white hover:text-brand-primary hover:bg-[rgba(47,107,255,0.10)] rounded-lg transition-all text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Discover</span>
            </button>

            {/* Language Dropdown */}
            <div className="hidden md:block overflow-visible">
              <DropdownLanguage align="right" />
            </div>

            {/* Social Features */}
            {ENABLE_SOCIAL_FEATURES && (
              <>
                <div className="overflow-visible">
                  <DropdownFriendRequests align="right" />
                </div>
                <div className="overflow-visible">
                  <DropdownMessages align="right" onMessageClick={onMessageClick} />
                </div>
              </>
            )}

            {/* Notifications */}
            <div className="overflow-visible">
              <DropdownNotifications align="right" />
            </div>

            {/* Profile */}
            {user && (
              <div className="overflow-visible">
                <ProfileDropdown
                  user={{
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}&background=2F6BFF&color=fff&bold=true`,
                    verified: true,
                    role: 'Pro Trader'
                  }}
                  stats={{
                    profit: '$12,450',
                    profitPercent: 15.2,
                    trades: 156,
                    winRate: 68
                  }}
                  onLogout={() => {
                    logout();
                    navigate('/');
                  }}
                  onProfileClick={() => navigate('/social/profile')}
                  onSettingsClick={() => navigate('/settings/account')}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
