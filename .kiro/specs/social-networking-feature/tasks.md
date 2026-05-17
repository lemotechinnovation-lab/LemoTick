# Implementation Plan: Social Networking Feature

## Overview

This implementation plan breaks down the social networking feature into discrete, actionable tasks. The feature includes user profiles, friend requests, friends management, privacy controls, and integration with existing messenger and notification systems. The implementation follows the modern UI patterns used in the LemoTick platform with gradient backgrounds, professional cards, and clean layouts.

**Technology Stack:**
- Frontend: React 19, TypeScript, TailwindCSS, Lucide React icons
- Backend: .NET Core (API endpoints assumed to exist or be created separately)
- State Management: Zustand
- Real-time: SignalR/WebSocket for notifications

## Tasks

### Phase 1: Database Schema and Data Models

- [ ] 1. Create database schema and migrations
  - Create UserProfile table with fields: userId, bio, tradingExperience, tradingStyle, preferredMarkets, profileVisibility, friendsListVisibility, allowFriendRequests, avatarUrl, createdAt, updatedAt
  - Create Friendship table with fields: id, userId1, userId2, status (pending/accepted/declined/cancelled), requesterId, requestMessage, createdAt, acceptedAt, updatedAt
  - Create FriendList table with fields: id, userId, name, description, createdAt
  - Create FriendListMember table with fields: id, listId, friendId, addedAt
  - Create BlockedUser table with fields: id, blockerId, blockedId, reason, createdAt
  - Add indexes for performance: userId, status, createdAt on Friendship table
  - Add composite indexes for friendship lookups
  - _Requirements: Data-1, Data-2, Data-3, Data-4, Data-5, FR-1, FR-7_

- [ ] 2. Create TypeScript interfaces and types for frontend
  - Define UserProfile interface matching backend model
  - Define Friendship interface with status enum
  - Define FriendRequest interface for pending requests
  - Define FriendList and FriendListMember interfaces
  - Define BlockedUser interface
  - Define PrivacySettings interface
  - Define API response types for all endpoints
  - _Requirements: FR-1, FR-4, FR-7, FR-9_

### Phase 2: Backend API Endpoints (Frontend Integration Points)

- [ ] 3. Document and prepare for Profile API endpoints
  - Document expected endpoints: GET /api/profile/:userId, PUT /api/profile, GET /api/profile/:userId/friends, GET /api/profile/:userId/mutual-friends
  - Create API service methods in TypeScript for profile operations
  - Add error handling and response type definitions
  - _Requirements: FR-1, FR-2, FR-3, API-8.1_

- [ ] 4. Document and prepare for Friend Request API endpoints
  - Document expected endpoints: POST /api/friends/request, GET /api/friends/requests/received, GET /api/friends/requests/sent, PUT /api/friends/request/:id/accept, PUT /api/friends/request/:id/decline, DELETE /api/friends/request/:id
  - Create API service methods in TypeScript for friend request operations
  - Add request/response type definitions
  - _Requirements: FR-4, FR-5, FR-6, API-8.2_

- [ ] 5. Document and prepare for Friends Management API endpoints
  - Document expected endpoints: GET /api/friends, DELETE /api/friends/:userId, GET /api/friends/suggestions, POST /api/friends/lists, PUT /api/friends/lists/:id, POST /api/friends/lists/:id/members
  - Create API service methods in TypeScript for friends management
  - Add pagination support for friends list
  - _Requirements: FR-7, FR-8, FR-9, FR-10, API-8.3_

- [ ] 6. Document and prepare for Privacy API endpoints
  - Document expected endpoints: POST /api/users/block, DELETE /api/users/block/:userId, GET /api/users/blocked, PUT /api/profile/privacy
  - Create API service methods in TypeScript for privacy operations
  - _Requirements: FR-12, FR-13, API-8.4_

### Phase 3: State Management with Zustand

- [ ] 7. Create Zustand store for social networking state
  - Create socialStore with state for: currentUserProfile, friends list, friend requests, blocked users, friend suggestions
  - Add actions for: fetchProfile, updateProfile, sendFriendRequest, acceptRequest, declineRequest, cancelRequest
  - Add actions for: fetchFriends, unfriend, fetchSuggestions, blockUser, unblockUser
  - Add actions for: createFriendList, updateFriendList, addToFriendList, removeFromFriendList
  - Implement optimistic updates for better UX
  - Add loading and error states
  - _Requirements: FR-1, FR-4, FR-7, FR-9, FR-13_

- [ ]* 7.1 Write unit tests for Zustand store
  - Test all store actions and state updates
  - Test optimistic updates and rollback on error
  - Test loading and error state management
  - _Requirements: FR-1, FR-4, FR-7_

### Phase 4: Core UI Components

- [ ] 8. Create UserProfileCard component
  - Display user avatar, name, bio, trading experience
  - Show online/offline status indicator
  - Display friend count and mutual friends count
  - Show action buttons based on relationship status (Add Friend, Message, Unfriend, Block)
  - Apply gradient card styling matching platform design
  - Make responsive for mobile and desktop
  - _Requirements: US-1, US-2, UI-4, NFR-10_

- [ ] 9. Create FriendRequestCard component
  - Display requester avatar, name, and optional message
  - Show timestamp of request
  - Include Accept and Decline buttons for received requests
  - Include Cancel button for sent requests
  - Show "View Profile" link
  - Apply platform styling with hover effects
  - _Requirements: US-4, UI-6_

- [ ] 10. Create FriendCard component
  - Display friend avatar, name, and online status
  - Show quick action buttons: Message, View Profile, Unfriend
  - Display mutual friends count
  - Support grid and list view layouts
  - Apply gradient styling and hover effects
  - _Requirements: US-6, UI-5_

- [ ] 11. Create FriendSuggestionCard component
  - Display suggested user avatar and name
  - Show mutual friends count and common interests
  - Include "Add Friend" and "Dismiss" buttons
  - Apply platform card styling
  - _Requirements: US-9, UI-7_

### Phase 5: Profile Pages

- [ ] 12. Create ProfilePage component
  - [ ] 12.1 Implement profile header section
    - Display large avatar with edit button (own profile)
    - Show user name, bio, and trading experience
    - Display statistics cards: friends count, trading stats
    - Add action buttons: Edit Profile (own), Add Friend/Message (others)
    - Apply gradient background and professional card styling
    - _Requirements: US-1, US-2, UI-4_
  
  - [ ] 12.2 Implement friends list preview section
    - Show 6 friend avatars in grid
    - Add "View All Friends" link
    - Display online status indicators
    - _Requirements: US-6, UI-4_
  
  - [ ] 12.3 Implement profile edit modal
    - Create form for editing bio, trading experience, interests
    - Add avatar upload functionality
    - Include save and cancel buttons
    - Add form validation
    - _Requirements: US-1, FR-2_
  
  - [ ]* 12.4 Write integration tests for ProfilePage
    - Test profile loading and display
    - Test edit functionality
    - Test different view states (own profile vs others)
    - _Requirements: US-1, US-2_

### Phase 6: Friends Management Pages

- [ ] 13. Create FriendsPage component
  - [ ] 13.1 Implement friends list with search and filters
    - Add search bar for filtering by name
    - Add filter controls: All, Online, Offline
    - Add sort options: Name, Recent Activity, Friendship Date
    - Implement pagination (50 friends per page)
    - Display friends in grid layout with FriendCard components
    - _Requirements: US-6, FR-8, UI-5, NFR-1_
  
  - [ ] 13.2 Implement friend list organization
    - Add "Create List" button and modal
    - Display existing friend lists in sidebar
    - Allow filtering friends by list
    - Add drag-and-drop or checkbox selection for adding to lists
    - _Requirements: US-8, FR-9_
  
  - [ ] 13.3 Implement unfriend confirmation dialog
    - Show confirmation modal before unfriending
    - Display warning message
    - Include Confirm and Cancel buttons
    - _Requirements: US-7, FR-7_
  
  - [ ]* 13.4 Write integration tests for FriendsPage
    - Test search and filter functionality
    - Test pagination
    - Test friend list organization
    - _Requirements: US-6, US-7, US-8_

- [ ] 14. Create FriendRequestsPage component
  - [ ] 14.1 Implement tabs for Received and Sent requests
    - Create tab navigation component
    - Display received requests with Accept/Decline actions
    - Display sent requests with Cancel action
    - Show empty state when no requests
    - _Requirements: US-4, US-5, UI-6_
  
  - [ ] 14.2 Implement request actions
    - Handle accept request with optimistic update
    - Handle decline request with confirmation
    - Handle cancel sent request
    - Show success/error notifications
    - _Requirements: US-4, FR-4, FR-5_
  
  - [ ]* 14.3 Write integration tests for FriendRequestsPage
    - Test accepting and declining requests
    - Test canceling sent requests
    - Test tab navigation
    - _Requirements: US-4, US-5_

- [ ] 15. Create FriendSuggestionsPage component
  - Display friend suggestions in grid layout
  - Show mutual friends count and common interests for each suggestion
  - Implement "Add Friend" action
  - Implement "Dismiss" action to hide suggestion
  - Show empty state when no suggestions
  - Add refresh button to get new suggestions
  - _Requirements: US-9, FR-10, FR-11, UI-7_

### Phase 7: Privacy and Settings

- [ ] 16. Create PrivacySettingsPage component
  - [ ] 16.1 Implement profile visibility settings
    - Add radio buttons: Public, Friends Only, Private
    - Add friends list visibility control
    - Add "Who can send friend requests" dropdown
    - Apply settings immediately on change
    - _Requirements: US-10, FR-12_
  
  - [ ] 16.2 Implement blocked users management
    - Display list of blocked users
    - Add "Block User" search and action
    - Add "Unblock" button for each blocked user
    - Show confirmation dialog before blocking
    - _Requirements: US-11, FR-13_
  
  - [ ]* 16.3 Write integration tests for PrivacySettingsPage
    - Test privacy settings updates
    - Test blocking and unblocking users
    - _Requirements: US-10, US-11_

### Phase 8: Navigation and Integration

- [ ] 17. Add social networking navigation to Sidebar
  - Add "Social" or "Network" section to sidebar navigation
  - Add icon (Users or UserPlus from Lucide)
  - Create submenu items: My Profile, Friends, Friend Requests, Suggestions, Privacy
  - Apply active state styling matching existing patterns
  - _Requirements: UI-1, INT-7_

- [ ] 18. Integrate friend request notifications in Header
  - Add friend request badge to notifications dropdown
  - Display count of pending friend requests
  - Show recent friend requests in dropdown
  - Add click handler to navigate to Friend Requests page
  - Apply real-time updates when new requests arrive
  - _Requirements: US-5, UI-2, FR-6, INT-4_

- [ ] 19. Integrate with MessengerPanel
  - Add "Message" button to friend profiles and cards
  - Pass friend data to messenger when clicking Message
  - Open messenger panel with selected conversation
  - Show online status from friends system in messenger
  - _Requirements: US-12, INT-1, INT-2, INT-3_

### Phase 9: Real-time Features with SignalR

- [ ] 20. Implement SignalR client for real-time updates
  - [ ] 20.1 Create SignalR connection service
    - Initialize SignalR connection on app load
    - Handle connection lifecycle (connect, disconnect, reconnect)
    - Add authentication token to connection
    - _Requirements: INT-6_
  
  - [ ] 20.2 Implement real-time friend request notifications
    - Listen for "FriendRequestReceived" event
    - Update Zustand store when new request arrives
    - Show toast notification
    - Update badge count in header
    - _Requirements: US-5, FR-6, INT-5_
  
  - [ ] 20.3 Implement real-time friend status updates
    - Listen for "FriendOnlineStatusChanged" event
    - Update friend online/offline status in UI
    - Update messenger online status
    - _Requirements: INT-3, INT-6_
  
  - [ ] 20.4 Implement real-time friendship updates
    - Listen for "FriendRequestAccepted" event
    - Listen for "Unfriended" event
    - Update friends list in real-time
    - Show appropriate notifications
    - _Requirements: FR-6, INT-5_

### Phase 10: Search and Discovery

- [ ] 21. Create UserSearchPage component
  - Implement search bar with debounced input
  - Display search results in grid with UserProfileCard components
  - Add filters: Trading Experience, Preferred Markets
  - Show "No results" state
  - Add pagination for search results
  - Implement "Add Friend" action from search results
  - _Requirements: US-2, FR-14, NFR-4_

- [ ]* 21.1 Write integration tests for UserSearchPage
  - Test search functionality with various queries
  - Test filters and pagination
  - Test adding friends from search results
  - _Requirements: US-2_

### Phase 11: Performance Optimization

- [ ] 22. Implement caching and optimization
  - Add React Query or SWR for API caching
  - Implement virtual scrolling for large friends lists
  - Add lazy loading for friend avatars
  - Implement debouncing for search inputs
  - Add memoization for expensive computations
  - Optimize re-renders with React.memo
  - _Requirements: NFR-1, NFR-2, NFR-3, NFR-4_

- [ ] 23. Implement pagination and infinite scroll
  - Add pagination controls to friends list
  - Implement infinite scroll for activity feeds
  - Add "Load More" buttons where appropriate
  - Show loading skeletons during data fetch
  - _Requirements: FR-8, NFR-1_

### Phase 12: Error Handling and Edge Cases

- [ ] 24. Implement comprehensive error handling
  - Add error boundaries for each major component
  - Show user-friendly error messages
  - Implement retry logic for failed API calls
  - Add fallback UI for error states
  - Log errors for debugging
  - _Requirements: NFR-9, NFR-14_

- [ ] 25. Handle edge cases and empty states
  - Show empty state when user has no friends
  - Show empty state when no friend requests
  - Show empty state when no suggestions available
  - Handle blocked user scenarios in UI
  - Handle privacy settings preventing actions
  - Show appropriate messages for rate-limited actions
  - _Requirements: FR-5, FR-11, FR-14, NFR-9_

### Phase 13: Accessibility and Responsive Design

- [ ] 26. Implement accessibility features
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works throughout
  - Add focus indicators for keyboard users
  - Ensure color contrast meets WCAG 2.1 AA standards
  - Add screen reader announcements for dynamic updates
  - Test with screen readers (NVDA, JAWS, VoiceOver)
  - _Requirements: NFR-11_

- [ ] 27. Ensure responsive design for all components
  - Test all pages on mobile (320px - 768px)
  - Test all pages on tablet (768px - 1024px)
  - Test all pages on desktop (1024px+)
  - Adjust layouts for different screen sizes
  - Ensure touch targets are at least 44x44px on mobile
  - Test on iOS Safari and Android Chrome
  - _Requirements: NFR-10_

### Phase 14: Testing and Quality Assurance

- [ ]* 28. Write end-to-end tests for critical user flows
  - Test complete friend request flow (send, receive, accept)
  - Test profile viewing and editing
  - Test friends list management
  - Test privacy settings
  - Test blocking and unblocking users
  - Test search and discovery
  - _Requirements: All user stories_

- [ ] 29. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all integration tests and verify they pass
  - Run end-to-end tests and verify they pass
  - Fix any failing tests
  - Ensure code coverage meets project standards
  - Ask the user if questions arise

### Phase 15: Documentation and Deployment Preparation

- [ ] 30. Create user documentation
  - Write guide for sending and managing friend requests
  - Write guide for organizing friends into lists
  - Write guide for privacy settings
  - Write guide for blocking/unblocking users
  - Add tooltips and help text in UI
  - _Requirements: Documentation-15.1_

- [ ] 31. Create developer documentation
  - Document all API endpoints and their usage
  - Document Zustand store structure and actions
  - Document component props and usage
  - Document SignalR events and handlers
  - Add JSDoc comments to all public functions
  - _Requirements: Documentation-15.2_

- [ ] 32. Final checkpoint - Review and polish
  - Review all components for consistency with design system
  - Verify all requirements are met
  - Test all features end-to-end
  - Check performance metrics (load times, API response times)
  - Verify accessibility compliance
  - Ensure all tests pass
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements from the requirements document for traceability
- The implementation follows the modern UI patterns used in the LemoTick platform (Portfolio/Dashboard style)
- Backend API endpoints are assumed to be created separately or already exist; frontend tasks focus on integration
- Real-time features require SignalR/WebSocket infrastructure to be available
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Privacy and security are prioritized throughout the implementation
- All components should use TypeScript for type safety
- All styling should use TailwindCSS with the platform's gradient and color scheme
