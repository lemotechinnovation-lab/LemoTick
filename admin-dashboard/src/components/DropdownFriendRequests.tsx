import { useSocialStore } from '@/stores/socialStore';
import { UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';

interface DropdownFriendRequestsProps {
    align?: string;
}

function DropdownFriendRequests({ align }: DropdownFriendRequestsProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const trigger = useRef<HTMLButtonElement>(null);
    const dropdown = useRef<HTMLDivElement>(null);

    const {
        receivedRequests,
        acceptFriendRequest,
        declineFriendRequest,
        isLoading
    } = useSocialStore();

    // Ensure receivedRequests is always an array
    const safeReceivedRequests = Array.isArray(receivedRequests) ? receivedRequests : [];

    // Get only the first 5 requests for the dropdown
    const displayRequests = safeReceivedRequests.slice(0, 5);
    const hasMore = safeReceivedRequests.length > 5;

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

    const handleAccept = async (requestId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await acceptFriendRequest(requestId);
    };

    const handleDecline = async (requestId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await declineFriendRequest(requestId);
    };

    const handleViewProfile = (userId: string) => {
        setDropdownOpen(false);
        navigate(`/social/profile/${userId}`);
    };

    return (
        <div className="relative inline-flex">
            <button
                ref={trigger}
                className={`w-9 h-9 flex items-center justify-center hover:bg-[#16124A]/50 rounded-lg transition-colors relative ${dropdownOpen && 'bg-[#16124A]/70'}`}
                aria-haspopup="true"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
            >
                <span className="sr-only">Friend Requests</span>
                <UserPlus className="w-5 h-5 text-gray-300" />
                {safeReceivedRequests.length > 0 && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FFA62B] border-2 border-[#1A1547] rounded-full"></div>
                )}
            </button>

            <Transition
                className={`origin-top z-[9999] fixed sm:absolute top-16 sm:top-full left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 w-80 sm:w-auto sm:min-w-96 max-w-md bg-gradient-to-br from-[#1A1547] to-[#16124A] border border-[#2F6BFF]/30 rounded-2xl shadow-2xl shadow-[#2F6BFF]/10 overflow-hidden mt-2 ${align === 'right' ? 'sm:right-0' : 'sm:left-0'}`}
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
                            <h3 className="text-sm font-semibold text-[#efdede]">Friend Requests</h3>
                            {safeReceivedRequests.length > 0 && (
                                <span className="text-xs bg-[#FFA62B]/20 text-[#FFA62B] px-2 py-0.5 rounded-full font-medium">
                                    {safeReceivedRequests.length} New
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Friend Requests List */}
                    <div className="max-h-96 overflow-y-auto">
                        {displayRequests.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 flex items-center justify-center">
                                    <UserPlus className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-400 mb-1">No friend requests</p>
                                <p className="text-xs text-gray-500">You're all caught up!</p>
                            </div>
                        ) : (
                            displayRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-start gap-3 p-4 hover:bg-[#2F6BFF]/5 transition-all duration-200 border-b border-[#2F6BFF]/10 cursor-pointer"
                                    onClick={() => handleViewProfile(request.requesterId)}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {request.requesterAvatarUrl ? (
                                            <img
                                                src={request.requesterAvatarUrl}
                                                alt={request.requesterUsername}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-[#2F6BFF]/30"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2F6BFF] to-[#FFA62B] flex items-center justify-center">
                                                <span className="text-white font-semibold text-lg">
                                                    {request.requesterUsername.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#efdede] mb-1">
                                            {request.requesterDisplayName}
                                        </p>
                                        {request.message && (
                                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                                {request.message}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={(e) => handleAccept(request.id, e)}
                                                disabled={isLoading.acceptFriendRequest}
                                                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-[#2F6BFF] to-[#4A7FFF] text-white text-xs font-medium rounded-lg hover:from-[#4A7FFF] hover:to-[#2F6BFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={(e) => handleDecline(request.id, e)}
                                                disabled={isLoading.declineFriendRequest}
                                                className="flex-1 px-3 py-1.5 bg-[#16124A]/50 border border-[#2F6BFF]/20 text-gray-300 text-xs font-medium rounded-lg hover:bg-[#16124A] hover:border-[#2F6BFF]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {safeReceivedRequests.length > 0 && (
                        <div className="px-4 py-3 border-t border-[#2F6BFF]/20 bg-gradient-to-r from-[#2F6BFF]/5 to-transparent">
                            <Link
                                to="/social/requests"
                                className="text-sm text-[#2F6BFF] hover:text-[#FFA62B] font-semibold transition-colors flex items-center justify-center gap-1"
                                onClick={() => setDropdownOpen(false)}
                            >
                                {hasMore ? `View all ${safeReceivedRequests.length} requests` : 'View all requests'}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            </Transition>
        </div>
    );
}

export default DropdownFriendRequests;
