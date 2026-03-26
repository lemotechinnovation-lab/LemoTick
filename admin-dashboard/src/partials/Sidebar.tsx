import {
    Bell,
    Bot,
    ChevronDown,
    ChevronLeft,
    DollarSign,
    HelpCircle,
    LayoutDashboard,
    Mail,
    TrendingUp,
    User,
    Wallet
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import SidebarLinkGroup from "./SidebarLinkGroup";

function Sidebar({
    sidebarOpen,
    setSidebarOpen,
    variant = 'default',
}) {
    const location = useLocation();
    const { pathname } = location;

    const trigger = useRef(null);
    const sidebar = useRef(null);

    const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
    const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }) => {
            if (!sidebar.current || !trigger.current) return;
            if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
            setSidebarOpen(false);
        };
        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }) => {
            if (!sidebarOpen || keyCode !== 27) return;
            setSidebarOpen(false);
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    });

    useEffect(() => {
        localStorage.setItem("sidebar-expanded", String(sidebarExpanded));
        if (sidebarExpanded) {
            document.querySelector("body")?.classList.add("sidebar-expanded");
        } else {
            document.querySelector("body")?.classList.remove("sidebar-expanded");
        }
    }, [sidebarExpanded]);

    return (
        <div className="min-w-fit">
            {/* Sidebar backdrop (mobile only) */}
            <div
                className={`fixed inset-0 bg-[#0B0633]/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                aria-hidden="true"
            ></div>

            {/* Sidebar */}
            <div
                id="sidebar"
                ref={sidebar}
                className={`flex lg:flex! flex-col absolute z-50 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 shrink-0 bg-gradient-to-b from-[#0B0633] via-[#0F0838] to-[#16124A] border-r border-[#2F6BFF]/30 px-4 pb-4 pt-0 transition-all duration-300 ease-in-out shadow-[4px_0_20px_rgba(30,109,227,0.15)] relative ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}`}
            >
                {/* Subtle glow effect on right edge */}
                <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#2F6BFF]/40 to-transparent pointer-events-none"></div>

                {/* Sidebar header */}
                <div className="relative flex justify-center items-center h-16 mb-0 border-b border-[#2F6BFF]/30 overflow-visible">
                    {/* Close button (mobile only) */}
                    <button
                        ref={trigger}
                        className="absolute left-0 lg:hidden text-gray-300 hover:text-gray-200"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-controls="sidebar"
                        aria-expanded={sidebarOpen}
                    >
                        <span className="sr-only">Close sidebar</span>
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
                        </svg>
                    </button>
                    {/* Logo */}
                    <NavLink end to="/" className="block p-1">
                        {/* Icon only - shown when collapsed */}
                        <img
                            src="/src/images/logo-icon@2x.png"
                            alt="LemoTick"
                            className="w-12 h-12 lg:block lg:sidebar-expanded:hidden object-contain brightness-125 contrast-150 saturate-110 drop-shadow-[0_0_12px_rgba(30,109,227,0.4)] hover:drop-shadow-[0_0_16px_rgba(30,109,227,0.6)] hover:scale-[2.1] transition-all duration-200 scale-[2.0]"
                            style={{ imageRendering: 'crisp-edges' }}
                        />
                        {/* Full logo - shown when expanded */}
                        <img
                            src="/src/images/logo-full@2x.png"
                            alt="LemoTick"
                            className="h-14 w-auto max-w-[180px] hidden lg:sidebar-expanded:block object-contain brightness-125 contrast-150 saturate-110 drop-shadow-[0_0_12px_rgba(30,109,227,0.4)] hover:drop-shadow-[0_0_16px_rgba(30,109,227,0.6)] hover:scale-[1.65] transition-all duration-200 scale-[1.6]"
                            style={{ imageRendering: 'crisp-edges' }}
                        />
                    </NavLink>

                    {/* Expand / collapse button */}
                    <button
                        className="absolute -right-6 top-4 z-50 hidden lg:flex items-center justify-center w-6 h-6 lg:sidebar-expanded:w-6 lg:sidebar-expanded:h-6 lg:w-5 lg:h-5 rounded-full bg-gradient-to-br from-[#2F6BFF] via-[#4A7FFF] to-[#2F6BFF] border-2 border-[#2F6BFF] text-white hover:from-[#FFA62B] hover:via-[#FFB84D] hover:to-[#FFA62B] hover:border-[#FFA62B] shadow-[0_0_20px_rgba(47,107,255,0.6)] hover:shadow-[0_0_25px_rgba(255,166,43,0.8)] transition-all duration-300 hover:scale-110"
                        onClick={() => {
                            setSidebarExpanded(!sidebarExpanded);
                        }}
                        type="button"
                    >
                        <span className="sr-only">Expand / collapse sidebar</span>
                        <ChevronLeft className={`shrink-0 transition-transform duration-200 lg:sidebar-expanded:w-[14px] lg:sidebar-expanded:h-[14px] lg:w-[12px] lg:h-[12px] ${!sidebarExpanded && "rotate-180"}`} />
                    </button>
                </div>

                {/* Links */}
                <div className="space-y-8 px-0 pt-8">
                    {/* Pages group */}
                    <div>
                        <ul className="space-y-0.5">
                            {/* Dashboard */}
                            <li className={`px-3 py-2 rounded-lg transition-all duration-200 ${pathname.includes("dashboard") ? "bg-gradient-to-r from-[#2F6BFF]/25 to-[#2F6BFF]/5 border-l-4 border-[#2F6BFF] shadow-[0_0_15px_rgba(30,109,227,0.2)]" : "hover:bg-[#16124A]/60"}`}>
                                <NavLink
                                    end
                                    to="/dashboard"
                                    className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${pathname.includes("dashboard") ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <LayoutDashboard className={`shrink-0 transition-colors duration-200 ${pathname.includes('dashboard') ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">Dashboard</span>
                                    </div>
                                </NavLink>
                            </li>
                            {/* Trading */}
                            <SidebarLinkGroup activecondition={pathname.includes("trade") || pathname.includes("portfolio") || pathname.includes("performance")}>
                                {(handleClick, open) => {
                                    return (
                                        <React.Fragment>
                                            <a
                                                href="#0"
                                                className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${(pathname.includes("trade") || pathname.includes("portfolio") || pathname.includes("performance")) ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                                    }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClick();
                                                    setSidebarExpanded(true);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <TrendingUp className={`shrink-0 transition-colors duration-200 ${(pathname.includes('trade') || pathname.includes('portfolio') || pathname.includes('performance')) ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                            Trading
                                                        </span>
                                                    </div>
                                                    {/* Icon */}
                                                    <div className="flex shrink-0 ml-2">
                                                        <ChevronDown className={`w-3 h-3 shrink-0 ml-1 text-gray-200 dark:text-gray-300 transition-transform duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 ${open && "rotate-180"}`} />
                                                    </div>
                                                </div>
                                            </a>
                                            <div className="lg:hidden lg:sidebar-expanded:block overflow-visible">
                                                <ul className={`pl-9 mt-1 space-y-0.5 ${!open && "hidden"}`}>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/trade"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Trade
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/portfolio"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Portfolio
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/performance"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Performance
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                </ul>
                                            </div>
                                        </React.Fragment>
                                    );
                                }}
                            </SidebarLinkGroup>
                            {/* Bots */}
                            <SidebarLinkGroup activecondition={pathname.includes("my-robots") || pathname.includes("management") || pathname.includes("configuration")}>
                                {(handleClick, open) => {
                                    return (
                                        <React.Fragment>
                                            <a
                                                href="#0"
                                                className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${(pathname.includes("my-robots") || pathname.includes("management") || pathname.includes("configuration")) ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                                    }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClick();
                                                    setSidebarExpanded(true);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <Bot className={`shrink-0 transition-colors duration-200 ${(pathname.includes('my-robots') || pathname.includes('management') || pathname.includes('configuration')) ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                            Bots
                                                        </span>
                                                    </div>
                                                    {/* Icon */}
                                                    <div className="flex shrink-0 ml-2">
                                                        <ChevronDown className={`w-3 h-3 shrink-0 ml-1 text-gray-200 dark:text-gray-300 transition-transform duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 ${open && "rotate-180"}`} />
                                                    </div>
                                                </div>
                                            </a>
                                            <div className="lg:hidden lg:sidebar-expanded:block overflow-visible">
                                                <ul className={`pl-9 mt-1 space-y-0.5 ${!open && "hidden"}`}>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/my-robots"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                My Robots
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/management"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Management
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/configuration"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Configuration
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                </ul>
                                            </div>
                                        </React.Fragment>
                                    );
                                }}
                            </SidebarLinkGroup>
                            {/* Finance */}
                            <SidebarLinkGroup activecondition={pathname.includes("accounts") || pathname.includes("bank-accounts") || pathname.includes("transactions") || pathname.includes("statements")}>
                                {(handleClick, open) => {
                                    return (
                                        <React.Fragment>
                                            <a
                                                href="#0"
                                                className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${(pathname.includes("accounts") || pathname.includes("bank-accounts") || pathname.includes("transactions") || pathname.includes("statements")) ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                                    }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClick();
                                                    setSidebarExpanded(true);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <Wallet className={`shrink-0 transition-colors duration-200 ${(pathname.includes('accounts') || pathname.includes('bank-accounts') || pathname.includes('transactions') || pathname.includes('statements')) ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                            Finance
                                                        </span>
                                                    </div>
                                                    {/* Icon */}
                                                    <div className="flex shrink-0 ml-2">
                                                        <ChevronDown className={`w-3 h-3 shrink-0 ml-1 text-gray-200 dark:text-gray-300 transition-transform duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 ${open && "rotate-180"}`} />
                                                    </div>
                                                </div>
                                            </a>
                                            <div className="lg:hidden lg:sidebar-expanded:block overflow-visible">
                                                <ul className={`pl-9 mt-1 space-y-0.5 ${!open && "hidden"}`}>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/accounts"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Accounts
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/bank-accounts"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Bank Accounts
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/transactions"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Transactions
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/statements"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Statements
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                </ul>
                                            </div>
                                        </React.Fragment>
                                    );
                                }}
                            </SidebarLinkGroup>
                            {/* Account */}
                            <SidebarLinkGroup activecondition={pathname.includes("settings") || pathname.includes("preferences") || pathname.includes("kyc") || pathname.includes("referrals")}>
                                {(handleClick, open) => {
                                    return (
                                        <React.Fragment>
                                            <a
                                                href="#0"
                                                className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${(pathname.includes("settings") || pathname.includes("preferences") || pathname.includes("kyc") || pathname.includes("referrals")) ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                                    }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClick();
                                                    setSidebarExpanded(true);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <User className={`shrink-0 transition-colors duration-200 ${(pathname.includes('settings') || pathname.includes('preferences') || pathname.includes('kyc') || pathname.includes('referrals')) ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                            Account
                                                        </span>
                                                    </div>
                                                    {/* Icon */}
                                                    <div className="flex shrink-0 ml-2">
                                                        <ChevronDown className={`w-3 h-3 shrink-0 ml-1 text-gray-200 dark:text-gray-300 transition-transform duration-200 lg:opacity-0 lg:sidebar-expanded:opacity-100 ${open && "rotate-180"}`} />
                                                    </div>
                                                </div>
                                            </a>
                                            <div className="lg:hidden lg:sidebar-expanded:block overflow-visible">
                                                <ul className={`pl-9 mt-1 space-y-0.5 ${!open && "hidden"}`}>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/settings"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Settings
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/preferences"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Preferences
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/kyc"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                KYC
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                    <li>
                                                        <NavLink
                                                            end
                                                            to="/referrals"
                                                            className={({ isActive }) =>
                                                                "block transition-all duration-200 truncate py-1 " + (isActive ? "text-[#2F6BFF]" : "text-gray-300/90 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200")
                                                            }
                                                        >
                                                            <span className="text-data-label lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                                Referrals
                                                            </span>
                                                        </NavLink>
                                                    </li>
                                                </ul>
                                            </div>
                                        </React.Fragment>
                                    );
                                }}
                            </SidebarLinkGroup>
                            {/* Notifications */}
                            <li className={`px-3 py-1.5 rounded-lg bg-linear-to-r ${pathname.includes("notifications") && "from-[#2F6BFF]/[0.12] dark:from-[#2F6BFF]/[0.24] to-[#2F6BFF]/[0.04]"}`}>
                                <NavLink
                                    end
                                    to="/notifications"
                                    className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${pathname.includes("notifications") ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="grow flex items-center">
                                            <Bell className={`shrink-0 transition-colors duration-200 ${pathname.includes('notifications') ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                            <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                                Notifications
                                            </span>
                                        </div>
                                        {/* Badge */}
                                        <div className="flex shrink-0 ml-2">
                                            <span className="inline-flex items-center justify-center h-4 text-micro font-medium text-white bg-[#FFA62B] px-1.5 rounded">4</span>
                                        </div>
                                    </div>
                                </NavLink>
                            </li>
                            {/* Mail */}
                            <li className={`px-3 py-1.5 rounded-lg bg-linear-to-r ${pathname.includes("mail") && "from-[#2F6BFF]/[0.12] dark:from-[#2F6BFF]/[0.24] to-[#2F6BFF]/[0.04]"}`}>
                                <NavLink
                                    end
                                    to="/mail"
                                    className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${pathname.includes("mail") ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <Mail className={`shrink-0 transition-colors duration-200 ${pathname.includes('mail') ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">Mail</span>
                                    </div>
                                </NavLink>
                            </li>
                            {/* Pricing */}
                            <li className={`px-3 py-1.5 rounded-lg bg-linear-to-r ${pathname.includes("pricing") && "from-[#2F6BFF]/[0.12] dark:from-[#2F6BFF]/[0.24] to-[#2F6BFF]/[0.04]"}`}>
                                <NavLink
                                    end
                                    to="/pricing"
                                    className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${pathname.includes("pricing") ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <DollarSign className={`shrink-0 transition-colors duration-200 ${pathname.includes('pricing') ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                            Pricing
                                        </span>
                                    </div>
                                </NavLink>
                            </li>
                            {/* Support */}
                            <li className={`px-3 py-1.5 rounded-lg bg-linear-to-r ${pathname.includes("support") && "from-[#2F6BFF]/[0.12] dark:from-[#2F6BFF]/[0.24] to-[#2F6BFF]/[0.04]"}`}>
                                <NavLink
                                    end
                                    to="/support"
                                    className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${pathname.includes("support") ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <HelpCircle className={`shrink-0 transition-colors duration-200 ${pathname.includes('support') ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} size={18} />
                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                            Support
                                        </span>
                                    </div>
                                </NavLink>
                            </li>
                        </ul>
                    </div>


                    {/* Additional Links */}
                    <div>
                        <ul className="space-y-0.5">
                            {/* Reports */}
                            <li className={`px-3 py-1.5 rounded-lg bg-linear-to-r ${pathname.includes("reports") && "from-[#2F6BFF]/[0.12] dark:from-[#2F6BFF]/[0.24] to-[#2F6BFF]/[0.04]"}`}>
                                <NavLink
                                    end
                                    to="/reports"
                                    className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${pathname.includes("reports") ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <svg className={`shrink-0 transition-colors duration-200 ${pathname.includes('reports') ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                            Reports
                                        </span>
                                    </div>
                                </NavLink>
                            </li>
                            {/* API Keys */}
                            <li className={`px-3 py-1.5 rounded-lg bg-linear-to-r ${pathname.includes("api-keys") && "from-[#2F6BFF]/[0.12] dark:from-[#2F6BFF]/[0.24] to-[#2F6BFF]/[0.04]"}`}>
                                <NavLink
                                    end
                                    to="/api-keys"
                                    className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${pathname.includes("api-keys") ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <svg className={`shrink-0 transition-colors duration-200 ${pathname.includes('api-keys') ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                                        </svg>
                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                            API Keys
                                        </span>
                                    </div>
                                </NavLink>
                            </li>
                            {/* Activity Log */}
                            <li className={`px-3 py-1.5 rounded-lg bg-linear-to-r ${pathname.includes("activity") && "from-[#2F6BFF]/[0.12] dark:from-[#2F6BFF]/[0.24] to-[#2F6BFF]/[0.04]"}`}>
                                <NavLink
                                    end
                                    to="/activity"
                                    className={`block text-[#efdede] dark:text-gray-100 truncate transition-all duration-200 ${pathname.includes("activity") ? "" : "hover:text-[#efdede] dark:hover:text-[#efdede]"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <svg className={`shrink-0 transition-colors duration-200 ${pathname.includes('activity') ? 'text-[#2F6BFF]' : 'text-gray-200 dark:text-gray-300'}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                        </svg>
                                        <span className="text-data-label ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-200">
                                            Activity Log
                                        </span>
                                    </div>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Sidebar;

