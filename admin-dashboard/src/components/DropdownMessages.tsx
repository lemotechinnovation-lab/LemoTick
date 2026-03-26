import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Transition from '../utils/Transition';

interface DropdownMessagesProps {
    align?: string;
}

function DropdownMessages({ align }: DropdownMessagesProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const trigger = useRef<HTMLButtonElement>(null);
    const dropdown = useRef<HTMLDivElement>(null);

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!dropdown.current) return;
            if (!dropdownOpen || dropdown.current.contains(target as Node) || trigger.current?.contains(target as Node)) return;
            setDropdownOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }: KeyboardEvent) => {
            if (!dropdownOpen || keyCode !== 27) return;
            setDropdownOpen(false);
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
    });

    return (
        <div className="relative inline-flex">
            <button
                ref={trigger}
                className={`w-9 h-9 flex items-center justify-center hover:bg-[#16124A]/50 rounded-lg transition-colors relative ${dropdownOpen && 'bg-[#16124A]/70'}`}
                aria-haspopup="true"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="Messages"
            >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#1A1547] rounded-full"></div>
            </button>

            <Transition
                className={`origin-top-right z-[9999] absolute top-full min-w-80 bg-gradient-to-br from-[#1A1547] to-[#16124A] border border-[#2F6BFF]/30 rounded-2xl shadow-2xl shadow-[#2F6BFF]/10 overflow-hidden mt-2 ${align === 'right' ? 'right-0' : 'left-0'}`}
                show={dropdownOpen}
                enter="transition ease-out duration-200 transform"
                enterStart="opacity-0 -translate-y-2"
                enterEnd="opacity-100 translate-y-0"
                leave="transition ease-out duration-200"
                leaveStart="opacity-100"
                leaveEnd="opacity-0"
            >
                <div
                    ref={dropdown}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setDropdownOpen(false)}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#efdede]">Messages</h3>
                            <span className="text-xs bg-[#2F6BFF]/20 text-[#2F6BFF] px-2 py-0.5 rounded-full font-medium">3 New</span>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="max-h-80 overflow-y-auto">
                        <Link
                            className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10"
                            to="#0"
                            onClick={() => setDropdownOpen(false)}
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center text-white font-semibold text-sm">
                                    JD
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-[#efdede] truncate">John Doe</p>
                                    <span className="text-xs text-gray-400">2m ago</span>
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-2">Hey! I wanted to discuss the new trading strategy...</p>
                            </div>
                            <div className="w-2 h-2 bg-[#2F6BFF] rounded-full flex-shrink-0 mt-2"></div>
                        </Link>

                        <Link
                            className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10"
                            to="#0"
                            onClick={() => setDropdownOpen(false)}
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA62B] to-[#2F6BFF] flex items-center justify-center text-white font-semibold text-sm">
                                    SM
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-[#efdede] truncate">Sarah Miller</p>
                                    <span className="text-xs text-gray-400">1h ago</span>
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-2">The portfolio analysis report is ready for review</p>
                            </div>
                            <div className="w-2 h-2 bg-[#2F6BFF] rounded-full flex-shrink-0 mt-2"></div>
                        </Link>

                        <Link
                            className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10"
                            to="#0"
                            onClick={() => setDropdownOpen(false)}
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22C55E] to-[#2F6BFF] flex items-center justify-center text-white font-semibold text-sm">
                                    MK
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-[#efdede] truncate">Michael Kim</p>
                                    <span className="text-xs text-gray-400">3h ago</span>
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-2">Great work on the bot configuration! 🚀</p>
                            </div>
                            <div className="w-2 h-2 bg-[#2F6BFF] rounded-full flex-shrink-0 mt-2"></div>
                        </Link>

                        <Link
                            className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200"
                            to="#0"
                            onClick={() => setDropdownOpen(false)}
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16124A] to-[#2F6BFF] flex items-center justify-center text-white font-semibold text-sm">
                                    AL
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-gray-400 truncate">Alex Lee</p>
                                    <span className="text-xs text-gray-400">1d ago</span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">Thanks for the update on the market trends</p>
                            </div>
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/5 to-transparent">
                        <Link
                            to="/messages"
                            className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors flex items-center justify-center gap-1"
                            onClick={() => setDropdownOpen(false)}
                        >
                            View all messages
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </Transition>
        </div>
    );
}

export default DropdownMessages;
