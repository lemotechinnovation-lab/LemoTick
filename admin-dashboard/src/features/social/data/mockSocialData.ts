// Mock Social Data for Social Features
// Provides user data, relationships, and helper functions

export interface User {
    id: string;
    name: string;
    avatar: string;
    verified?: boolean;
    role?: string;
    bio?: string;
    location?: string;
    joinedDate?: string;
    friendsCount?: number;
    followersCount?: number;
    followingCount?: number;
    isFriend?: boolean;
    friendRequestSent?: boolean;
}

export const mockUsers: Record<string, User> = {
    'current': {
        id: 'current',
        name: 'You',
        avatar: '/src/images/user-avatar-32.png',
        verified: true,
        role: 'Trader',
        bio: 'Professional trader and market analyst',
        location: 'New York, USA',
        joinedDate: 'January 2024',
        friendsCount: 234,
        followersCount: 1250,
        followingCount: 180
    },
    '1': {
        id: '1',
        name: 'Alex Morgan',
        avatar: '/src/images/user-36-05.jpg',
        verified: true,
        role: 'Pro Trader',
        bio: 'Full-time crypto trader | Market analyst | Sharing my journey',
        location: 'London, UK',
        joinedDate: 'March 2023',
        friendsCount: 456,
        followersCount: 3200,
        followingCount: 120,
        isFriend: false
    },
    '2': {
        id: '2',
        name: 'Sarah Chen',
        avatar: '/src/images/user-36-06.jpg',
        verified: true,
        role: 'Educator',
        bio: 'Teaching trading strategies | Technical analysis expert',
        location: 'Singapore',
        joinedDate: 'June 2023',
        friendsCount: 892,
        followersCount: 15300,
        followingCount: 89,
        isFriend: true
    },
    '3': {
        id: '3',
        name: 'Mike Johnson',
        avatar: '/src/images/user-36-07.jpg',
        verified: true,
        role: 'Signal Provider',
        bio: 'Daily trading signals | 78% win rate | Risk management focused',
        location: 'Toronto, Canada',
        joinedDate: 'February 2023',
        friendsCount: 567,
        followersCount: 8900,
        followingCount: 234,
        isFriend: false
    },
    '4': {
        id: '4',
        name: 'Emma Davis',
        avatar: '/src/images/user-36-08.jpg',
        verified: false,
        role: 'Trader',
        bio: 'Learning and growing in the crypto space',
        location: 'Sydney, Australia',
        joinedDate: 'August 2024',
        friendsCount: 123,
        followersCount: 890,
        followingCount: 456,
        isFriend: false
    },
    '5': {
        id: '5',
        name: 'David Kim',
        avatar: '/src/images/user-36-09.jpg',
        verified: true,
        role: 'Bot Developer',
        bio: 'Creating automated trading bots | Python & ML enthusiast',
        location: 'Seoul, South Korea',
        joinedDate: 'January 2023',
        friendsCount: 678,
        followersCount: 12400,
        followingCount: 145,
        isFriend: true
    },
    '6': {
        id: '6',
        name: 'Lisa Anderson',
        avatar: '/src/images/user-36-05.jpg',
        verified: true,
        role: 'Whale Trader',
        bio: 'High volume trader | Market maker | Institutional experience',
        location: 'Dubai, UAE',
        joinedDate: 'November 2022',
        friendsCount: 234,
        followersCount: 18900,
        followingCount: 67,
        isFriend: false
    },
    '7': {
        id: '7',
        name: 'James Wilson',
        avatar: '/src/images/user-36-06.jpg',
        verified: true,
        role: 'Analyst',
        bio: 'Market research and analysis | Fundamental + Technical',
        location: 'Frankfurt, Germany',
        joinedDate: 'April 2023',
        friendsCount: 445,
        followersCount: 9800,
        followingCount: 198,
        isFriend: true
    },
    '8': {
        id: '8',
        name: 'Sophie Martinez',
        avatar: '/src/images/user-36-07.jpg',
        verified: true,
        role: 'Day Trader',
        bio: 'Scalping specialist | Fast-paced trading | Real-time updates',
        location: 'Barcelona, Spain',
        joinedDate: 'July 2023',
        friendsCount: 567,
        followersCount: 7600,
        followingCount: 234,
        isFriend: false
    }
};

// Get current user
export function getCurrentUser(): User {
    return mockUsers['current'];
}

// Get user by ID
export function getUserById(userId: string): User | undefined {
    return mockUsers[userId];
}

// Get user's friends
export function getUserFriends(userId: string): User[] {
    // Return a subset of users who are friends
    return Object.values(mockUsers).filter(user =>
        user.id !== userId && user.isFriend === true
    );
}

// Get suggested users (not friends)
export function getSuggestedUsers(userId: string, limit: number = 5): User[] {
    return Object.values(mockUsers)
        .filter(user => user.id !== userId && !user.isFriend)
        .slice(0, limit);
}
