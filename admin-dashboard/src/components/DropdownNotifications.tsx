import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Transition from '../utils/Transition';

interface DropdownNotificationsProps {
  align?: string;
}

function DropdownNotifications({ align }: DropdownNotificationsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);

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
        className={`w-9 h-9 flex items-center justify-center hover:bg-[#16124A]/50 rounded-lg transition-colors relative ${dropdownOpen && 'bg-[#16124A]/70'}`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Notifications</span>
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#1A1547] rounded-full"></div>
      </button>

      <Transition
        className={`origin-top-right z-[9999] absolute top-full min-w-96 bg-gradient-to-br from-[#1A1547] to-[#16124A] border border-[#2F6BFF]/30 rounded-2xl shadow-2xl shadow-[#2F6BFF]/10 overflow-hidden mt-2 ${align === 'right' ? 'right-0' : 'left-0'}`}
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
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#efdede]">Notifications</h3>
              <span className="text-xs bg-[#2F6BFF]/20 text-[#2F6BFF] px-2 py-0.5 rounded-full font-medium">5 New</span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            <Link
              className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10 bg-[#2F6BFF]/5"
              to="#0"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#efdede] mb-1">Trading Alert</p>
                <p className="text-sm text-gray-300 mb-2">Your Forex bot achieved 15% profit today! 🎉</p>
                <span className="text-xs text-gray-400">2 minutes ago</span>
              </div>
              <div className="w-2 h-2 bg-[#2F6BFF] rounded-full flex-shrink-0 mt-2"></div>
            </Link>

            <Link
              className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10 bg-[#2F6BFF]/5"
              to="#0"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#22C55E] to-[#2F6BFF] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#efdede] mb-1">KYC Approved</p>
                <p className="text-sm text-gray-300 mb-2">Your identity verification has been approved</p>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
              <div className="w-2 h-2 bg-[#2F6BFF] rounded-full flex-shrink-0 mt-2"></div>
            </Link>

            <Link
              className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10"
              to="#0"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA62B] to-[#2F6BFF] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-400 mb-1">Deposit Confirmed</p>
                <p className="text-sm text-gray-400 mb-2">R5,000 has been added to your account</p>
                <span className="text-xs text-gray-400">3 hours ago</span>
              </div>
            </Link>

            <Link
              className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10"
              to="#0"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#16124A] to-[#2F6BFF] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-400 mb-1">System Update</p>
                <p className="text-sm text-gray-400 mb-2">New features available in your dashboard</p>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/5 to-transparent">
            <Link
              to="/notifications"
              className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors flex items-center justify-center gap-1"
              onClick={() => setDropdownOpen(false)}
            >
              View all notifications
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownNotifications;
