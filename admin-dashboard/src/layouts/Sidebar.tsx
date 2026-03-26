import {
    ArrowRightLeft,
    Bell,
    Bot,
    LayoutDashboard,
    LineChart,
    Mail,
    MessageCircle,
    Settings,
    TrendingUp,
    X
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
    open: boolean
    onClose: () => void
}

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
    badge?: number
    shortcut?: string
}

const mainNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, shortcut: '⌘D' },
    { name: 'My robots', href: '/my-robots', icon: Bot, shortcut: '⌘R' },
    { name: 'Trade', href: '/trade', icon: LineChart, shortcut: '⌘T' },
    { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft, shortcut: '⌘X' },
    { name: 'Mail', href: '/mail', icon: Mail, badge: 3 },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: 3 },
    { name: 'Settings', href: '/settings', icon: Settings, shortcut: '⌘S' },
]

const bottomNavigation: NavItem[] = [
    { name: 'Support', href: '/support', icon: MessageCircle },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
    const sidebarContent = (
        <div style={{
            display: 'flex',
            height: '100%',
            width: '80px',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255, 107, 53, 0.2)',
            backgroundColor: '#1a1b3d'
        }}>
            {/* Logo */}
            <div style={{
                position: 'relative',
                display: 'flex',
                height: '80px',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
                    <div className="gradient-primary" style={{
                        display: 'flex',
                        height: '40px',
                        width: '40px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        transition: 'transform 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <TrendingUp size={20} color="white" strokeWidth={2.5} />
                    </div>
                </NavLink>

                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '8px',
                        display: window.innerWidth < 768 ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)'
                    }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Main Navigation */}
            <div style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                gap: '4px',
                overflowY: 'auto',
                padding: '12px 4px'
            }}>
                {mainNavigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        style={({ isActive }) => ({
                            position: 'relative',
                            display: 'flex',
                            height: '64px',
                            width: '100%',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            borderRadius: 'var(--radius-md)',
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            backgroundColor: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'
                        })}
                        onMouseEnter={(e) => {
                            if (!e.currentTarget.classList.contains('active')) {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!e.currentTarget.classList.contains('active')) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <item.icon size={24} strokeWidth={2} />
                            {item.badge && (
                                <div style={{
                                    position: 'absolute',
                                    right: '-4px',
                                    top: '-4px',
                                    height: '8px',
                                    width: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--color-secondary)',
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }} />
                            )}
                        </div>
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '500',
                            lineHeight: '1.2',
                            textAlign: 'center'
                        }}>
                            {item.name}
                        </span>
                    </NavLink>
                ))}
            </div>

            {/* Bottom Navigation */}
            <div style={{
                borderTop: '1px solid rgba(255, 107, 53, 0.2)',
                padding: '8px 4px'
            }}>
                {bottomNavigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        style={({ isActive }) => ({
                            display: 'flex',
                            height: '64px',
                            width: '100%',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            borderRadius: 'var(--radius-md)',
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            backgroundColor: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'
                        })}
                        onMouseEnter={(e) => {
                            if (!e.currentTarget.classList.contains('active')) {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!e.currentTarget.classList.contains('active')) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }
                        }}
                    >
                        <item.icon size={24} strokeWidth={2} />
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '500',
                            lineHeight: '1.2'
                        }}>
                            {item.name}
                        </span>
                    </NavLink>
                ))}
            </div>

            {/* Version */}
            <div style={{
                borderTop: '1px solid rgba(255, 107, 53, 0.2)',
                padding: '4px',
                textAlign: 'center'
            }}>
                <span style={{
                    fontFamily: 'monospace',
                    fontSize: '9px',
                    color: 'rgba(255, 255, 255, 0.3)'
                }}>
                    v5.0.0
                </span>
            </div>
        </div>
    )

    // Desktop: Always visible
    // Mobile: Overlay drawer
    return (
        <>
            {/* Desktop Sidebar */}
            <aside style={{
                display: window.innerWidth >= 768 ? 'block' : 'none'
            }}>
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {open && (
                <>
                    <div
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 40,
                            display: window.innerWidth < 768 ? 'block' : 'none'
                        }}
                    />
                    <div style={{
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 50,
                        display: window.innerWidth < 768 ? 'block' : 'none'
                    }}>
                        {sidebarContent}
                    </div>
                </>
            )}
        </>
    )
}
