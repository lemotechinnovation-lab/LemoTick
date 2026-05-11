/**
 * Enhanced UI Showcase Component
 * Demonstrates all 2026 UI enhancements in one place
 * Use this as a reference for implementing enhancements across the app
 */

import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    CheckCircle,
    DollarSign,
    Info,
    TrendingUp,
    Users
} from 'lucide-react';

export default function EnhancedUIShowcase() {
    return (
        <div className="p-8 space-y-12 max-w-7xl mx-auto">

            {/* Header */}
            <div className="fade-in-up">
                <h1 className="text-4xl font-bold text-white mb-2">
                    UI Enhancement Showcase 2026
                </h1>
                <p className="text-white/70">
                    Modern dashboard components with glassmorphism, micro-interactions, and accessibility
                </p>
            </div>

            {/* Stat Cards Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Enhanced Stat Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Stat Card 1 */}
                    <div className="stat-card-enhanced stagger-item">
                        <div className="flex items-center justify-between mb-3">
                            <div className="stat-label">Total Revenue</div>
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div className="stat-value">$124,563</div>
                        <div className="stat-change positive mt-2">
                            <ArrowUp className="w-3 h-3" />
                            <span>+12.5% from last month</span>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="stat-card-enhanced stagger-item">
                        <div className="flex items-center justify-between mb-3">
                            <div className="stat-label">Active Users</div>
                            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-accent" />
                            </div>
                        </div>
                        <div className="stat-value">8,549</div>
                        <div className="stat-change positive mt-2">
                            <ArrowUp className="w-3 h-3" />
                            <span>+8.2% from last week</span>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="stat-card-enhanced stagger-item">
                        <div className="flex items-center justify-between mb-3">
                            <div className="stat-label">Conversion Rate</div>
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                        <div className="stat-value">3.24%</div>
                        <div className="stat-change negative mt-2">
                            <ArrowDown className="w-3 h-3" />
                            <span>-2.1% from last month</span>
                        </div>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="stat-card-enhanced stagger-item">
                        <div className="flex items-center justify-between mb-3">
                            <div className="stat-label">Server Uptime</div>
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                        <div className="stat-value">99.9%</div>
                        <div className="stat-change positive mt-2">
                            <CheckCircle className="w-3 h-3" />
                            <span>All systems operational</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* Glass Cards Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Glass Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Standard Glass Card */}
                    <div className="glass-card rounded-xl p-6 smooth-hover">
                        <h3 className="text-lg font-semibold text-white mb-3">Standard Glass Card</h3>
                        <p className="text-white/70 mb-4">
                            This card uses the standard glassmorphism effect with backdrop blur and subtle borders.
                            Hover to see the smooth transition effect.
                        </p>
                        <div className="flex gap-3">
                            <button className="btn-primary-enhanced ripple focus-enhanced">
                                Primary Action
                            </button>
                            <button className="btn-secondary-enhanced focus-enhanced">
                                Secondary
                            </button>
                        </div>
                    </div>

                    {/* Elevated Glass Card */}
                    <div className="glass-card-elevated rounded-xl p-6 smooth-hover">
                        <h3 className="text-lg font-semibold text-white mb-3">Elevated Glass Card</h3>
                        <p className="text-white/70 mb-4">
                            This card uses enhanced glassmorphism for important or featured content.
                            Notice the stronger blur and more prominent shadow.
                        </p>
                        <div className="flex gap-3">
                            <button className="btn-primary-enhanced ripple focus-enhanced">
                                Get Started
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* Buttons Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Enhanced Buttons</h2>
                <div className="glass-card rounded-xl p-6">
                    <div className="flex flex-wrap gap-4">
                        <button className="btn-primary-enhanced ripple focus-enhanced">
                            Primary Button
                        </button>
                        <button className="btn-secondary-enhanced focus-enhanced">
                            Secondary Button
                        </button>
                        <button className="btn-primary-enhanced ripple focus-enhanced" disabled>
                            Disabled Button
                        </button>
                        <button className="btn-primary-enhanced ripple focus-enhanced">
                            <TrendingUp className="w-4 h-4" />
                            <span>With Icon</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Badges Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Enhanced Badges</h2>
                <div className="glass-card rounded-xl p-6">
                    <div className="flex flex-wrap gap-4">
                        <span className="badge-enhanced badge-success">
                            <CheckCircle className="w-3 h-3" />
                            <span>Success</span>
                        </span>
                        <span className="badge-enhanced badge-warning">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Warning</span>
                        </span>
                        <span className="badge-enhanced badge-error">
                            <AlertCircle className="w-3 h-3" />
                            <span>Error</span>
                        </span>
                        <span className="badge-enhanced badge-info">
                            <Info className="w-3 h-3" />
                            <span>Info</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* Form Inputs Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Enhanced Form Inputs</h2>
                <div className="glass-card rounded-xl p-6">
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="input-enhanced focus-enhanced w-full"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                className="input-enhanced focus-enhanced w-full"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Message
                            </label>
                            <textarea
                                className="input-enhanced focus-enhanced w-full"
                                rows={4}
                                placeholder="Enter your message"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Navigation Items Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Enhanced Navigation</h2>
                <div className="glass-card rounded-xl p-6">
                    <nav className="space-y-2 max-w-xs">
                        <a href="#" className="nav-item-enhanced active">
                            <Activity className="w-5 h-5" />
                            <span>Dashboard</span>
                        </a>
                        <a href="#" className="nav-item-enhanced">
                            <Users className="w-5 h-5" />
                            <span>Users</span>
                        </a>
                        <a href="#" className="nav-item-enhanced">
                            <TrendingUp className="w-5 h-5" />
                            <span>Analytics</span>
                        </a>
                        <a href="#" className="nav-item-enhanced">
                            <DollarSign className="w-5 h-5" />
                            <span>Revenue</span>
                        </a>
                    </nav>
                </div>
            </section>

            {/* Loading States Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Loading States</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Spinner */}
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Spinner</h3>
                        <div className="flex items-center justify-center py-8">
                            <div className="spinner-enhanced"></div>
                        </div>
                    </div>

                    {/* Skeleton Loader */}
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Skeleton Loader</h3>
                        <div className="space-y-4">
                            <div className="skeleton-enhanced h-8 w-48"></div>
                            <div className="skeleton-enhanced h-20 w-full"></div>
                            <div className="skeleton-enhanced h-20 w-full"></div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Dividers Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Enhanced Dividers</h2>
                <div className="glass-card rounded-xl p-6">
                    <p className="text-white/70">Content above divider</p>
                    <div className="divider-enhanced"></div>
                    <p className="text-white/70">Content below divider</p>
                </div>
            </section>

            {/* Scrollbar Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Enhanced Scrollbar</h2>
                <div className="glass-card rounded-xl p-6">
                    <div className="scrollbar-enhanced h-64 overflow-y-auto">
                        <div className="space-y-4">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="p-4 bg-white/5 rounded-lg">
                                    <p className="text-white/70">Scrollable content item {i + 1}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stagger Animation Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Stagger Animations</h2>
                <div className="glass-card rounded-xl p-6">
                    <ul className="space-y-3">
                        {['First item', 'Second item', 'Third item', 'Fourth item', 'Fifth item', 'Sixth item'].map((item, i) => (
                            <li key={i} className="stagger-item p-4 bg-white/5 rounded-lg">
                                <p className="text-white">{item} - Animates in sequence</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Accessibility Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Accessibility Features</h2>
                <div className="glass-card rounded-xl p-6">
                    <p className="text-white/70 mb-4">
                        All components include enhanced focus states for keyboard navigation.
                        Try tabbing through the buttons below:
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="btn-primary-enhanced ripple focus-enhanced">
                            Tab to me
                        </button>
                        <button className="btn-secondary-enhanced focus-enhanced">
                            Then to me
                        </button>
                        <button className="btn-primary-enhanced ripple focus-enhanced">
                            And finally me
                        </button>
                    </div>
                    <p className="text-white/70 mt-4 text-sm">
                        ✓ WCAG AA compliant color contrast<br />
                        ✓ Keyboard accessible<br />
                        ✓ Screen reader friendly<br />
                        ✓ Focus indicators visible
                    </p>
                </div>
            </section>

        </div>
    );
}
