import { getInitials } from '@/lib/utils'
import { useAuthStore } from '@features/auth/stores/authStore'
import { Bell, LogOut, Mail, Menu, Search, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TopHeaderProps {
    onMenuClick?: () => void
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            display: 'flex',
            height: '80px',
            alignItems: 'center',
            gap: '1rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-card)',
            backdropFilter: 'var(--backdrop-blur-light)',
            padding: '0 1.5rem'
        }}>
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                style={{
                    display: window.innerWidth < 768 ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <Menu size={20} />
            </button>

            {/* Search */}
            <div style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '28rem'
                }}>
                    <Search style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: 'var(--color-text-muted)',
                        pointerEvents: 'none'
                    }} />
                    <input
                        type="search"
                        placeholder="Search anything..."
                        className="input"
                        style={{
                            paddingLeft: '40px',
                            height: '40px'
                        }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                {/* Notifications */}
                <button
                    onClick={() => navigate('/notifications')}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute',
                        right: '4px',
                        top: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '18px',
                        minWidth: '18px',
                        padding: '0 4px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: '600',
                        backgroundColor: 'var(--color-destructive)',
                        color: 'white'
                    }}>
                        5
                    </span>
                </button>

                {/* Mail */}
                <button
                    onClick={() => navigate('/mail')}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <Mail size={20} />
                    <span style={{
                        position: 'absolute',
                        right: '4px',
                        top: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '18px',
                        minWidth: '18px',
                        padding: '0 4px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: '600',
                        backgroundColor: 'var(--color-destructive)',
                        color: 'white'
                    }}>
                        3
                    </span>
                </button>

                {/* Separator */}
                <div style={{
                    width: '1px',
                    height: '24px',
                    backgroundColor: 'var(--color-border)',
                    margin: '0 8px'
                }} />

                {/* User Menu */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        flexShrink: 0
                    }}>
                        {user ? getInitials(user.firstName + ' ' + user.lastName) : 'U'}
                    </div>
                    <div style={{
                        display: window.innerWidth >= 768 ? 'block' : 'none'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'var(--color-text-primary)',
                            lineHeight: '1.2'
                        }}>
                            {user?.firstName || 'User'}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                            lineHeight: '1.2'
                        }}>
                            {user?.email || 'user@example.com'}
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <button
                    onClick={() => navigate('/settings')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Settings"
                >
                    <Settings size={20} />
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-destructive)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    )
}
