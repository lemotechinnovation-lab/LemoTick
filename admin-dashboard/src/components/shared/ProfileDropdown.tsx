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
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-card/30 hover:bg-card/50 shadow-[0_0_12px_rgba(47,107,255,0.3)] hover:shadow-[0_0_16px_rgba(47,107,255,0.5)] transition-all group"
            >
                <div className="relative">
                    <div className="w-9 h-9 rounded-lg overflow-hidden ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {user.verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center ring-2 ring-card">
                            <Shield className="w-2.5 h-2.5 text-white" />
                        </div>
                    )}
                </div>
                <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                    {user.role && (
                        <p className="text-xs text-gray-400 font-medium leading-tight">{user.role}</p>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                    <div className="p-4 shadow-[0_2px_12px_rgba(47,107,255,0.3)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-primary/40">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {user.verified && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center ring-2 ring-card">
                                        <Shield className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                                {user.email && (
                                    <p className="text-xs text-gray-400 font-medium truncate">{user.email}</p>
                                )}
                                {user.role && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-lg bg-dark/30">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <DollarSign className="w-3.5 h-3.5 text-green-400" />
                                    <p className="text-xs text-gray-400 font-medium">Profit</p>
                                </div>
                                <p className="text-sm font-bold text-white">{stats.profit}</p>
                                {stats.profitPercent !== undefined && (
                                    <p className={`text-xs font-semibold ${stats.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {stats.profitPercent >= 0 ? '+' : ''}{stats.profitPercent}%
                                    </p>
                                )}
                            </div>
                            <div className="p-2.5 rounded-lg bg-dark/30">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                    <p className="text-xs text-gray-400 font-medium">Win Rate</p>
                                </div>
                                <p className="text-sm font-bold text-white">{stats.winRate}%</p>
                                <p className="text-xs text-gray-400 font-medium">{stats.trades} trades</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-primary/10 transition-all text-sm font-medium group"
                            >
                                <div className="text-gray-400 group-hover:text-primary transition-colors">
                                    {item.icon}
                                </div>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Settings Section */}
                    <div className="p-2 shadow-[0_2px_12px_rgba(47,107,255,0.3)]">
                        <button
                            onClick={() => {
                                onSettingsClick?.();
                                navigate('/settings/account');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-primary/10 transition-all text-sm font-medium group"
                        >
                            <div className="text-gray-400 group-hover:text-primary transition-colors">
                                <Settings className="w-4 h-4" />
                            </div>
                            <span>Settings</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-primary/10 transition-all text-sm font-medium group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-gray-400 group-hover:text-primary transition-colors">
                                    {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                </div>
                                <span>Theme</span>
                            </div>
                            <span className="text-xs text-gray-400 font-semibold">
                                {isDarkMode ? 'Dark' : 'Light'}
                            </span>
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 shadow-[0_2px_12px_rgba(47,107,255,0.3)]">
                        <button
                            onClick={() => {
                                onLogout?.();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-semibold group"
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
