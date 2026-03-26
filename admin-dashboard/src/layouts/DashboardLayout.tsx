import { ReactNode, useEffect, useState } from 'react';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';

interface DashboardLayoutProps {
    children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const stored = localStorage.getItem("sidebar-expanded");
        return stored === null ? false : stored === "true";
    });

    const toggleSidebar = () => {
        const newState = !sidebarExpanded;
        setSidebarExpanded(newState);
        localStorage.setItem("sidebar-expanded", String(newState));

        if (newState) {
            document.querySelector("body")?.classList.add("sidebar-expanded");
        } else {
            document.querySelector("body")?.classList.remove("sidebar-expanded");
        }
    };

    useEffect(() => {
        if (sidebarExpanded) {
            document.querySelector("body")?.classList.add("sidebar-expanded");
        } else {
            document.querySelector("body")?.classList.remove("sidebar-expanded");
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto">

                {/* Header */}
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Main */}
                <main className="grow bg-gradient-to-br from-[#0D0735] via-[#0B0633] to-[#16124A]/60 relative">

                    {/* Background Pattern */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 2px 2px, rgba(30,109,227,0.15) 1px, transparent 0)",
                            backgroundSize: "32px 32px",
                        }}
                    />

                    <div className="relative">
                        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                            {children}
                        </div>
                    </div>

                </main>

            </div>
        </div>
    );
}

export default DashboardLayout;