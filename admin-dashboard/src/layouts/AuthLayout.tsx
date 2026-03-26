import { TrendingUp } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#0F0A28'
        }}>
            {/* Left Side - Branding */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1a1530 0%, #0F0A28 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'radial-gradient(circle, rgba(247, 147, 30, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)'
                }} />

                {/* Logo & Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                        boxShadow: '0 12px 40px rgba(255, 107, 53, 0.5)',
                        marginBottom: '24px'
                    }}>
                        <TrendingUp size={40} color="white" strokeWidth={2.5} />
                    </div>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '700',
                        color: '#FFF',
                        letterSpacing: '-1px',
                        marginBottom: '12px'
                    }}>
                        LemoTick
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        color: '#888',
                        marginBottom: '32px'
                    }}>
                        Investor Management Portal
                    </p>
                    <div style={{
                        width: '60px',
                        height: '3px',
                        background: 'linear-gradient(90deg, #FF6B35 0%, #F7931E 100%)',
                        margin: '0 auto',
                        borderRadius: '2px'
                    }} />
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(180deg, #1a1530 0%, #15111f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                borderLeft: '1px solid rgba(72, 92, 123, 0.2)'
            }}>
                <div style={{ width: '100%', maxWidth: '440px' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
