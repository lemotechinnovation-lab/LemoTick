import { cn } from '@utils/cn'
import {
    Activity,
    ArrowRightLeft,
    Bell,
    Bot,
    Briefcase,
    CreditCard,
    FileText,
    LayoutDashboard,
    Settings,
    TrendingUp,
    Users,
    X
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
    open: boolean
    onClose: () => void
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
    { name: 'Bank Accounts', href: '/bank-accounts', icon: CreditCard },
    { name: 'Statements', href: '/statements', icon: FileText },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Preferences', href: '/preferences', icon: Settings },
    { name: 'Bot Management', href: '/bot-management', icon: Activity },
    { name: 'Bot Configuration', href: '/bot-configuration', icon: Bot },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between border-b px-6">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-6 w-6 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">LemoTick</span>
                        </div>

                        <button
                            onClick={onClose}
                            className="md:hidden rounded-lg p-2 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={() => onClose()}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="border-t p-4">
                        <div className="rounded-lg bg-primary-50 p-4">
                            <p className="text-sm font-medium text-primary-900">Need Help?</p>
                            <p className="mt-1 text-xs text-primary-700">
                                Contact support for assistance
                            </p>
                            <a
                                href="/help"
                                className="mt-2 inline-block text-xs font-medium text-primary-600 hover:text-primary-700"
                            >
                                Get Help →
                            </a>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

