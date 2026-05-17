// SocialNavigation Component - Facebook-style sub-navigation for social pages

import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
    label: string;
    path: string;
}

const navItems: NavItem[] = [
    { label: 'All Friends', path: '/social/friends' },
    { label: 'Friend Requests', path: '/social/requests' },
    { label: 'Suggestions', path: '/social/suggestions' },
    { label: 'Search', path: '/social/search' },
    { label: 'Privacy', path: '/social/privacy' },
];

export default function SocialNavigation() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="mb-6 border-b border-[#2F6BFF]/20">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`pb-3 px-1 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 ${isActive
                                ? 'text-[#2F6BFF] border-[#2F6BFF]'
                                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
                                }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


