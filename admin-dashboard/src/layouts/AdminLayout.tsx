import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';

export const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content area */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* Site header */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow bg-gradient-to-br from-[#0D0735] via-[#0B0633] to-[#16124A]/60 relative">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(30, 109, 227, 0.15) 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }}></div>
                    <div className="relative z-10">
                        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
