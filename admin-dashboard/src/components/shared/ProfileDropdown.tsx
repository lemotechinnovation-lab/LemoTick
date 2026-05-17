// Modern Profile Dropdown Component - Trading Platform
// Stylish user menu with quick actions and stats

import {
    Activity,
    ChevronDown,
    CreditCard,
    DollarSign,
    LogOut,
    Moon,
    Settings,
    Shield,
    Sun,
    TrendingUp,
    User,
    Wallet
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
    user: {
        name: string;
        email?: string;
        avatar: string;
        verified?: boolean;
        role?: string;
    };
    stats?: {
        profit?: string;
        profitPercent?: number;
        trades?: number;
        winRate?: number;
    };
    onLogout?: () => void;
    onProfileClick?: () => void;
    onSettingsClick?: () => void;
}

export default function ProfileDropdown({
    user,
    stats = {
        profit: '$12,450',
        profitPercent: 15.2,
        trades: 156,
        winRate: 68
    },
    onLogout,
    onProfileClick,
    onSettingsClick,
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const menuItems = [
        {
            icon: <User className="w-4 h-4" />,
            label: 'My Profile',
            onClick: () => {
                onProfileClick?.();
                navigate('/social/profile');
                setIsOpen(false);
            }
        },
        {
            icon: <Wallet className="w-4 h-4" />,
            label: 'Wallet',
            onClick: () => {
                navigate('/banking/accounts');
                setIsOpen(false);
            }
        },
        {
            icon: <Activity className="w-4 h-4" />,
            label: 'Trading History',
            onClick: () => {
                navigate('/trade/history');
                setIsOpen(false);
            }
        },
        {
            icon: <CreditCard className="w-4 h-4" />,
            label: 'Billing',
            onClick: () => {
                navigate('/settings/billing');
                setIsOpen(false);
            }
        },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-gradient-to-r from-[#16124A]/80 to-[#0B0633]/80 hover:from-[#16124A] hover:to-[#0B0633] border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 shadow-[0_0_20px_rgba(47,107,255,0.3)] hover:shadow-[0_0_30px_rgba(47,107,255,0.5)] transition-all duration-300 group"
            >
                <div className="relative">
                    <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-[#2F6BFF]/40 group-hover:ring-[#2F6BFF]/80 transition-all duration-300 shadow-lg">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    {user.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#2F6BFF] to-[#3B82F6] rounded-full flex items-center justify-center ring-2 ring-[#0B0633] shadow-lg">
                            <Shield className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                    {user.role && (
                        <p className="text-xs text-[#2F6BFF] font-semibold leading-tight">{user.role}</p>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-[#2F6BFF] transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        right: '1rem',
                        top: '3.5rem',
                        zIndex: 9999
                    }}
                    className="w-80 rounded-2xl bg-[#1a1347]/98 backdrop-blur-xl shadow-[0_8px_48px_rgba(0,0,0,0.8),0_0_32px_rgba(47,107,255,0.6),inset_0_0_1px_rgba(47,107,255,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {/* User Info Section */}
                    <div className="p-5 bg-gradient-to-br from-[#16124A]/60 to-[#0B0633]/60 border-b border-[#2F6BFF]/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-[#2F6BFF]/50 shadow-[0_0_30px_rgba(47,107,255,0.4)]">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {user.verified && (
                                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-gradient-to-br from-[#2F6BFF] to-[#3B82F6] rounded-full flex items-center justify-center ring-4 ring-[#0B0633] shadow-lg">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-white truncate mb-1">{user.name}</h3>
                                {user.email && (
                                    <p className="text-xs text-gray-400 font-medium truncate mb-1.5">{user.email}</p>
                                )}
                                {user.role && (
                                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#2F6BFF]/30 to-[#3B82F6]/30 border border-[#2F6BFF]/40 text-[#2F6BFF] text-xs font-bold rounded-lg">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#0B0633]/80 to-[#16124A]/60 border border-[#2F6BFF]/20 shadow-lg">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <p className="text-xs text-gray-400 font-semibold">Profit</p>
                                </div>
                                <p className="text-base font-bold text-white mb-0.5">{stats.profit}</p>
                                {stats.profitPercent !== undefined && (
                                    <p className={`text-xs font-bold ${stats.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {stats.profitPercent >= 0 ? '+' : ''}{stats.profitPercent}%
                                    </p>
                                )}
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#0B0633]/80 to-[#16124A]/60 border border-[#2F6BFF]/20 shadow-lg">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <TrendingUp className="w-4 h-4 text-[#2F6BFF]" />
                                    <p className="text-xs text-gray-400 font-semibold">Win Rate</p>
                                </div>
                                <p className="text-base font-bold text-white mb-0.5">{stats.winRate}%</p>
                                <p className="text-xs text-gray-400 font-semibold">{stats.trades} trades</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 bg-[#0B0633]/40">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-[#2F6BFF]/20 hover:to-[#3B82F6]/10 border border-transparent hover:border-[#2F6BFF]/30 transition-all duration-200 text-sm font-semibold group"
                            >
                                <div className="text-gray-400 group-hover:text-[#2F6BFF] transition-colors">
                                    {item.icon}
                                </div>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Settings Section */}
                    <div className="p-2 bg-[#0B0633]/40 border-t border-[#2F6BFF]/10">
                        <button
                            onClick={() => {
                                onSettingsClick?.();
                                navigate('/settings/account');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-[#2F6BFF]/20 hover:to-[#3B82F6]/10 border border-transparent hover:border-[#2F6BFF]/30 transition-all duration-200 text-sm font-semibold group"
                        >
                            <div className="text-gray-400 group-hover:text-[#2F6BFF] transition-colors">
                                <Settings className="w-4 h-4" />
                            </div>
                            <span>Settings</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-[#2F6BFF]/20 hover:to-[#3B82F6]/10 border border-transparent hover:border-[#2F6BFF]/30 transition-all duration-200 text-sm font-semibold group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-gray-400 group-hover:text-[#2F6BFF] transition-colors">
                                    {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                </div>
                                <span>Theme</span>
                            </div>
                            <span className="text-xs text-[#2F6BFF] font-bold px-2 py-1 bg-[#2F6BFF]/20 rounded-lg">
                                {isDarkMode ? 'Dark' : 'Light'}
                            </span>
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 bg-[#0B0633]/40 border-t border-[#2F6BFF]/10">
                        <button
                            onClick={() => {
                                onLogout?.();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-transparent hover:border-red-500/40 transition-all duration-200 text-sm font-bold group"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


