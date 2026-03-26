import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';

import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/types';
import UserAvatar from '../images/user-avatar-32.png';

interface DropdownProfileProps {
  align?: string;
}

function DropdownProfile({ align }: DropdownProfileProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const trigger = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    logout();
    setDropdownOpen(false);
    // Navigation will be handled by the auth store
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.Administrator:
        return 'Administrator';
      case UserRole.ComplianceOfficer:
        return 'Compliance Officer';
      case UserRole.Support:
        return 'Support';
      case UserRole.Auditor:
        return 'Auditor';
      case UserRole.Investor:
      default:
        return 'Investor';
    }
  };

  const getDisplayName = () => {
    if (!user) return 'Guest User';
    return `${user.firstName} ${user.lastName}`;
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target as Node) || trigger.current?.contains(target as Node)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className={`inline-flex justify-center items-center group hover:bg-[#16124A]/50 rounded-lg px-2 py-1 transition-colors ${dropdownOpen && 'bg-[#16124A]/70'}`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <img className="w-9 h-9 rounded-full border-2 border-[#2F6BFF]/30" src={UserAvatar} width="32" height="32" alt="User" />
        <svg className={`w-4 h-4 shrink-0 ml-2 text-gray-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Transition
        className={`origin-top-right z-[9999] absolute top-full min-w-64 bg-gradient-to-br from-[#1A1547] to-[#16124A] border border-[#2F6BFF]/30 rounded-2xl shadow-2xl shadow-[#2F6BFF]/10 overflow-hidden mt-2 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
            <div className="flex items-center gap-3">
              <img className="w-12 h-12 rounded-full border-2 border-[#2F6BFF]/30 flex-shrink-0" src={UserAvatar} width="48" height="48" alt="User" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#efdede] truncate">{getDisplayName()}</div>
                <div className="text-xs text-gray-400">{user ? getRoleDisplayName(user.role) : 'Guest'}</div>
                {user?.email && (
                  <div className="text-xs text-gray-500 mt-0.5 truncate" title={user.email}>{user.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#efdede] hover:bg-[#2F6BFF]/10 hover:text-[#2F6BFF] transition-all duration-200"
              to="/settings"
              onClick={() => setDropdownOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <Link
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#efdede] hover:bg-[#2F6BFF]/10 hover:text-[#2F6BFF] transition-all duration-200"
              to="/settings"
              onClick={() => setDropdownOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <Link
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#efdede] hover:bg-[#2F6BFF]/10 hover:text-[#2F6BFF] transition-all duration-200"
              to="/help"
              onClick={() => setDropdownOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help & Support
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-[#2F6BFF]/20 py-2">
            <button
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 w-full"
              onClick={handleSignOut}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default DropdownProfile;
