import {
    Bot,
    ChevronDown,
    ChevronLeft,
    HelpCircle,
    LayoutDashboard,
    TrendingUp,
    User,
    Users,
    Wallet
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import logoFull from "../images/logo-full@2x.png";
import logoIcon from "../images/logo-icon@2x.png";
import SidebarLinkGroup from "./SidebarLinkGroup";

function Sidebar({
    sidebarOpen,
    setSidebarOpen,
}: {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}) {
    const location = useLocation();
    const { pathname } = location;

    const trigger = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLDivElement>(null);

    const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
    const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!sidebar.current || !trigger.current) return;
            if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
            setSidebarOpen(false);
        };
        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }: KeyboardEvent) => {
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
        <div className="lg:min-w-fit w-0 lg:w-auto">
            {/* Sidebar backdrop (mobile only) */}
            <div
                className={`fixed inset-0 bg-[#0B0633]/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                aria-hidden="true"
            ></div>

            {/* Sidebar */}
            <div
                id="sidebar"
                ref={sidebar}
                className={`flex flex-col fixed z-50 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-56 lg:w-16 lg:sidebar-expanded:!w-56 shrink-0 glass-card-elevated backdrop-blur-2xl border-r border-brand-blue/20 shadow-2xl shadow-brand-blue/10 px-3 pb-4 pt-0 transition-all duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-56"}`}
            >
                {/* Vertical shadow divider on right edge */}
                <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-blue/40 via-brand-blue/70 to-brand-blue/40 shadow-[2px_0_20px_rgba(47,107,255,0.6)] pointer-events-none"></div>

                {/* Sidebar header */}
                <div className="relative flex justify-center items-center h-16 mb-2 overflow-visible">
                    {/* Horizontal shadow divider below logo */}
                    <div className="absolute bottom-[-5px] left-0 right-0 h-[4px] bg-gradient-to-r from-transparent via-brand-blue/70 to-transparent shadow-[0_2px_20px_rgba(47,107,255,0.6)]"></div>

                    {/* Close button (mobile only) */}
                    <button
                        ref={trigger}
                        className="absolute left-0 lg:hidden text-white hover:text-primary transition-colors"
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
                    <NavLink end to="/" className="flex items-center justify-center py-4 group">
                        {/* Icon only - shown when collapsed on desktop */}
                        <img
                            src={logoIcon}
                            alt="LemoTick"
                            style={{ height: '48px', width: '48px' }}
                            className="lg:sidebar-expanded:hidden object-contain drop-shadow-[0_0_8px_rgba(47,107,255,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(47,107,255,0.6)] transition-all duration-300"
                        />
                        {/* Full logo - shown when expanded on desktop */}
                        <img
                            src={logoFull}
                            alt="LemoTick"
                            style={{ height: 'auto', width: 'auto', maxWidth: '170px' }}
                            className="hidden lg:sidebar-expanded:block object-contain drop-shadow-[0_0_8px_rgba(47,107,255,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(47,107,255,0.6)] transition-all duration-300"
                        />
                    </NavLink>

                    {/* Expand / collapse button */}
                    <button
                        className="absolute -right-6 top-4 z-50 hidden lg:flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-brand-blue via-[#4A7FFF] to-brand-blue text-white hover:from-accent-orange hover:via-[#FFB84D] hover:to-accent-orange shadow-[0_0_30px_rgba(47,107,255,0.8)] hover:shadow-[0_0_35px_rgba(255,166,43,1)] transition-all duration-300 hover:scale-110 border border-brand-blue/30 hover:border-accent-orange/50"
                        onClick={() => setSidebarExpanded(!sidebarExpanded)}
                        type="button"
                    >
                        <span className="sr-only">Expand / collapse sidebar</span>
                        <ChevronLeft className={`w-4 h-4 shrink-0 transition-transform duration-300 ${!sidebarExpanded && "rotate-180"}`} />
                    </button>
                </div>

                {/* Links */}
                <div className="space-y-6 px-0 pt-6">
                    {/* Pages group */}
                    <div>
                        <ul className="space-y-2">
                            {/* Dashboard */}
                            <li>
                                <NavLink
                                    end
                                    to="/dashboard"
                                    className={`nav-item ${pathname.includes("dashboard") ? "nav-item-active" : ""}`}
                                >
                                    <LayoutDashboard className={`shrink-0 transition-colors duration-300 nav-icon ${pathname.includes('dashboard') ? 'text-brand-primary' : 'text-white'}`} size={20} />
                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Dashboard</span>
                                </NavLink>
                            </li>

                            {/* Trading */}
                            <SidebarLinkGroup activecondition={pathname.includes("trade") || pathname.includes("portfolio") || pathname.includes("performance")}>
                                {(handleClick, open) => (
                                    <React.Fragment>
                                        <li>
                                            <a
                                                href="#0"
                                                className={`nav-item justify-between ${(pathname.includes("trade") || pathname.includes("portfolio") || pathname.includes("performance")) ? "nav-item-active" : ""}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClick();
                                                    setSidebarExpanded(true);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <TrendingUp className={`shrink-0 transition-colors duration-300 nav-icon ${(pathname.includes('trade') || pathname.includes('portfolio') || pathname.includes('performance')) ? 'text-brand-primary' : 'text-white'}`} size={20} />
                                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Trading</span>
                                                </div>
                                                <ChevronDown className={`w-3 h-3 shrink-0 ml-2 text-white transition-transform duration-300 lg:opacity-0 lg:sidebar-expanded:opacity-100 ${open && "rotate-180"}`} />
                                            </a>
                                        </li>
                                        <div className="hidden lg:sidebar-expanded:block overflow-visible">
                                            <ul className={`mt-1 space-y-2 ${!open && "hidden"}`}>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/trade"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Trade</span>
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/portfolio"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Portfolio</span>
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </div>
                                    </React.Fragment>
                                )}
                            </SidebarLinkGroup>

                            {/* Bots */}
                            <SidebarLinkGroup activecondition={pathname.includes("my-robots") || pathname.includes("management") || pathname.includes("configuration")}>
                                {(handleClick, open) => (
                                    <React.Fragment>
                                        <li>
                                            <a
                                                href="#0"
                                                className={`nav-item justify-between ${(pathname.includes("my-robots") || pathname.includes("management") || pathname.includes("configuration")) ? "nav-item-active" : ""}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClick();
                                                    setSidebarExpanded(true);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <Bot className={`shrink-0 transition-colors duration-300 nav-icon ${(pathname.includes('my-robots') || pathname.includes('management') || pathname.includes('configuration')) ? 'text-brand-primary' : 'text-white'}`} size={20} />
                                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Bots</span>
                                                </div>
                                                <ChevronDown className={`w-3 h-3 shrink-0 ml-2 text-white transition-transform duration-300 lg:opacity-0 lg:sidebar-expanded:opacity-100 ${open && "rotate-180"}`} />
                                            </a>
                                        </li>
                                        <div className="hidden lg:sidebar-expanded:block overflow-visible">
                                            <ul className={`mt-1 space-y-2 ${!open && "hidden"}`}>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/my-robots"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">My Robots</span>
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/configuration"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Configuration</span>
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </div>
                                    </React.Fragment>
                                )}
                            </SidebarLinkGroup>

                            {/* Finance */}
                            <SidebarLinkGroup activecondition={pathname.includes("accounts") || pathname.includes("bank-accounts") || pathname.includes("transactions") || pathname.includes("statements")}>
                                {(handleClick, open) => (
                                    <React.Fragment>
                                        <li>
                                            <a
                                                href="#0"
                                                className={`nav-item justify-between ${(pathname.includes("accounts") || pathname.includes("bank-accounts") || pathname.includes("transactions") || pathname.includes("statements")) ? "nav-item-active" : ""}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClick();
                                                    setSidebarExpanded(true);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <Wallet className={`shrink-0 transition-colors duration-300 nav-icon ${(pathname.includes('accounts') || pathname.includes('bank-accounts') || pathname.includes('transactions') || pathname.includes('statements')) ? 'text-brand-primary' : 'text-white'}`} size={20} />
                                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Finance</span>
                                                </div>
                                                <ChevronDown className={`w-3 h-3 shrink-0 ml-2 text-white transition-transform duration-300 lg:opacity-0 lg:sidebar-expanded:opacity-100 ${open && "rotate-180"}`} />
                                            </a>
                                        </li>
                                        <div className="hidden lg:sidebar-expanded:block overflow-visible">
                                            <ul className={`mt-1 space-y-2 ${!open && "hidden"}`}>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/accounts"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Accounts</span>
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/bank-accounts"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Bank Accounts</span>
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/transactions"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Transactions</span>
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </div>
                                    </React.Fragment>
                                )}
                            </SidebarLinkGroup>

                            {/* Social */}
                            <SidebarLinkGroup activecondition={pathname.includes("social")}>
                                {(handleClick, open) => (
                                    <React.Fragment>
                                        <li>
                                            <a
                                                href="#0"
                                                className={`nav-item justify-between ${pathname.includes("social") ? "nav-item-active" : ""}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleClick();
                                                    setSidebarExpanded(true);
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <Users className={`shrink-0 transition-colors duration-300 nav-icon ${pathname.includes('social') ? 'text-brand-primary' : 'text-white'}`} size={20} />
                                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Social</span>
                                                </div>
                                                <ChevronDown className={`w-3 h-3 shrink-0 ml-2 text-white transition-transform duration-300 lg:opacity-0 lg:sidebar-expanded:opacity-100 ${open && "rotate-180"}`} />
                                            </a>
                                        </li>
                                        <div className="hidden lg:sidebar-expanded:block overflow-visible">
                                            <ul className={`mt-1 space-y-2 ${!open && "hidden"}`}>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/social"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Profile</span>
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        end
                                                        to="/social/timeline"
                                                        className={({ isActive }) =>
                                                            `flex items-center pl-9 pr-3 py-1.5 rounded-xl text-sm transition-all duration-300 truncate ${isActive ? "text-brand-primary font-medium bg-[rgba(47,107,255,0.10)]" : "text-white hover:text-brand-primary hover:bg-[rgba(53,51,94,0.20)]"}`
                                                        }
                                                    >
                                                        <span className="lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Timeline</span>
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </div>
                                    </React.Fragment>
                                )}
                            </SidebarLinkGroup>

                            {/* Support */}
                            <li>
                                <NavLink
                                    end
                                    to="/support"
                                    className={`nav-item ${pathname.includes("support") ? "nav-item-active" : ""}`}
                                >
                                    <HelpCircle className={`shrink-0 transition-colors duration-300 nav-icon ${pathname.includes('support') ? 'text-brand-primary' : 'text-white'}`} size={20} />
                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Support</span>
                                </NavLink>
                            </li>

                            {/* Settings */}
                            <li>
                                <NavLink
                                    end
                                    to="/settings"
                                    className={`nav-item ${pathname.includes("settings") ? "nav-item-active" : ""}`}
                                >
                                    <User className={`shrink-0 transition-colors duration-300 nav-icon ${pathname.includes('settings') ? 'text-brand-primary' : 'text-white'}`} size={20} />
                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Settings</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Additional Links */}
                    <div>
                        <ul className="space-y-2">
                            {/* Reports */}
                            <li>
                                <NavLink
                                    end
                                    to="/reports"
                                    className={`nav-item ${pathname.includes("reports") ? "nav-item-active" : ""}`}
                                >
                                    <svg className={`shrink-0 transition-colors duration-300 nav-icon ${pathname.includes('reports') ? 'text-brand-primary' : 'text-white'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Reports</span>
                                </NavLink>
                            </li>

                            {/* Activity Log */}
                            <li>
                                <NavLink
                                    end
                                    to="/activity"
                                    className={`nav-item ${pathname.includes("activity") ? "nav-item-active" : ""}`}
                                >
                                    <svg className={`shrink-0 transition-colors duration-300 nav-icon ${pathname.includes('activity') ? 'text-brand-primary' : 'text-white'}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                    </svg>
                                    <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 duration-300">Activity Log</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
