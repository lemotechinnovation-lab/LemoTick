import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { notificationService } from '@features/notifications/services/notificationService'
import { AppBar, Avatar, Badge, Box, Fade, IconButton, MenuItem, Menu as MuiMenu, Toolbar, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Bell, LogOut, Menu, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
    onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    // Fetch unread notifications count
    const { data: notifications } = useQuery({
        queryKey: [...QUERY_KEYS.NOTIFICATIONS, user?.id],
        queryFn: () => notificationService.getInvestorNotifications(user!.id),
        enabled: !!user?.id,
        refetchInterval: 30000,
    })

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0

    const handleLogout = () => {
        logout()
        navigate('/login')
        setAnchorEl(null)
    }

    const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <AppBar position="static" elevation={0}>
            <Toolbar sx={{ minHeight: '64px !important' }}>
                {/* Left side */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <IconButton
                        onClick={onMenuClick}
                        sx={{ display: { xs: 'block', md: 'none' } }}
                        color="inherit"
                    >
                        <Menu size={20} />
                    </IconButton>

                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Welcome back, {user?.firstName}!
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>
                    </Box>
                </Box>

                {/* Right side */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Notifications */}
                    <IconButton
                        onClick={() => navigate('/notifications')}
                        color="inherit"
                        title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <Bell size={20} />
                        </Badge>
                    </IconButton>

                    {/* User menu */}
                    <IconButton
                        onClick={handleUserMenuClick}
                        sx={{ display: 'flex', gap: 1, borderRadius: 2, px: 1 }}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                fontSize: '0.875rem'
                            }}
                        >
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>
                        <Typography
                            variant="body2"
                            sx={{
                                display: { xs: 'none', md: 'block' },
                                color: 'text.primary',
                                fontWeight: 500
                            }}
                        >
                            {user?.firstName} {user?.lastName}
                        </Typography>
                    </IconButton>

                    <MuiMenu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        TransitionComponent={Fade}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={() => { navigate('/preferences'); handleClose(); }}>
                            <User size={16} style={{ marginRight: 8 }} />
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <LogOut size={16} style={{ marginRight: 8 }} />
                            Logout
                        </MenuItem>
                    </MuiMenu>
                </Box>
            </Toolbar>
        </AppBar>
    )
}
