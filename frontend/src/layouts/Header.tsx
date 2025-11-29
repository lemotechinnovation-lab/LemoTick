import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { notificationService } from '@features/notifications/services/notificationService'
import { useQuery } from '@tanstack/react-query'
import { Bell, LogOut, Menu, User } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
    onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const closeTimeoutRef = useRef<number | null>(null)

    // Fetch unread notifications count
    const { data: notifications } = useQuery({
        queryKey: [...QUERY_KEYS.NOTIFICATIONS, user?.id],
        queryFn: () => notificationService.getInvestorNotifications(user!.id),
        enabled: !!user?.id,
        refetchInterval: 30000, // Refetch every 30 seconds
    })

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleMouseEnter = () => {
        // Clear any pending close timeout
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        setShowUserMenu(true)
    }

    const handleMouseLeave = () => {
        // Add a delay before closing
        closeTimeoutRef.current = setTimeout(() => {
            setShowUserMenu(false)
        }, 300) // 300ms delay - user-friendly!
    }

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
            {/* Left side */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Welcome back, {user?.firstName}!
                    </h2>
                    <p className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
                {/* Notifications */}
                <button
                    className="relative rounded-lg p-2 hover:bg-gray-100"
                    onClick={() => navigate('/notifications')}
                    title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* User menu */}
                <div
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <button className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                            <User className="h-4 w-4 text-primary-700" />
                        </div>
                        <span className="hidden text-sm font-medium md:block">
                            {user?.firstName} {user?.lastName}
                        </span>
                    </button>

                    {/* Dropdown with smooth transition */}
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-2 shadow-lg border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <a
                                href="/preferences"
                                className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                            >
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </a>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

