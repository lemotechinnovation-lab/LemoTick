import { useSocialSignalR } from '@/hooks/useSocialSignalR';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MessengerPanel from '../components/messenger/MessengerPanel';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';

interface DashboardLayoutProps {
    children: ReactNode;
}

// Feature flag to enable/disable social features
const ENABLE_SOCIAL_FEATURES = import.meta.env.VITE_ENABLE_SOCIAL_FEATURES === 'true';

function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const stored = localStorage.getItem("sidebar-expanded");
        return stored === null ? false : stored === "true";
    });
    const [messengerOpen, setMessengerOpen] = useState(false);

    // Check if current page is a social page
    const isSocialPage = location.pathname.startsWith('/social');

    // Initialize Social SignalR connection (hook handles feature flag internally)
    useSocialSignalR();

    const handleMessageClick = (_conversationId: string) => {
        setMessengerOpen(true);
    };

    const handleMessengerClose = () => {
        setMessengerOpen(false);
    };

    useEffect(() => {
        if (sidebarExpanded) {
            document.querySelector("body")?.classList.add("sidebar-expanded");
        } else {
            document.querySelector("body")?.classList.remove("sidebar-expanded");
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden w-full max-w-full bg-gradient-to-r from-[#c5c5d0] via-[#9090a8] to-[#6b6b88]">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-hidden w-full max-w-full min-w-0 bg-transparent">

                {/* Header - Fixed at top - Hidden on social pages */}
                {!isSocialPage && (
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        onMessageClick={handleMessageClick}
                    />
                )}

                {/* Main - Scrollable content area */}
                <main className="flex-1 relative overflow-y-auto overflow-x-hidden w-full max-w-full">
                    {/* Subtle background pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",
                            backgroundSize: "32px 32px",
                        }}
                    />

                    <div className={`relative w-full max-w-full h-full ${window.location.pathname === '/trade' || window.location.pathname === '/my-robots' ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
                        {children}
                    </div>

                </main>

            </div>

            {/* Messenger Floating Button - Only show if social features are enabled */}
            {ENABLE_SOCIAL_FEATURES && (
                <>
                    {/* Messenger Panel */}
                    <MessengerPanel
                        isOpen={messengerOpen}
                        onClose={handleMessengerClose}
                    />
                </>
            )}
        </div>
    );
}

export default DashboardLayout;