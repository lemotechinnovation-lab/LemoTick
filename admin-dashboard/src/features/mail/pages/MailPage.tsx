import { ChevronLeft, ChevronRight, Clock, Inbox, Mail, Maximize2, Minimize2, Paperclip, Reply, ReplyAll, Search, Send, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Email {
    id: string;
    from: string;
    fromEmail: string;
    subject: string;
    preview: string;
    body: string;
    timestamp: string;
    read: boolean;
    starred: boolean;
    hasAttachment: boolean;
    folder: 'inbox' | 'sent' | 'drafts' | 'trash';
    labels: string[];
}

interface ComposeModalState {
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    mode: 'compose' | 'reply' | 'replyAll';
    to: string;
    subject: string;
    body: string;
    originalEmail?: Email;
}

export default function MailPage() {
    const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;;

    const [composeModal, setComposeModal] = useState<ComposeModalState>({
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        mode: 'compose',
        to: '',
        subject: '',
        body: '',
    });

    const [emails, setEmails] = useState<Email[]>([
        {
            id: '1',
            from: 'Sarah Chen',
            fromEmail: 'sarah@company.com',
            subject: 'Updated design tokens for the dashboard',
            preview: 'I\'ve finished updating the OAuth color tokens across all components...',
            body: 'I\'ve finished updating the OAuth color tokens across all components. Please review and let me know if you have any feedback.',
            timestamp: 'Feb 20',
            read: false,
            starred: true,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['personal'],
        },
        {
            id: '2',
            from: 'Marcus Johnson',
            fromEmail: 'marcus@company.com',
            subject: 'TanStack Table v8 migration plan',
            preview: 'I\'ve been looking into the TanStack Table v8 release notes...',
            body: 'I\'ve been looking into the TanStack Table v8 release notes and created a migration plan for our data tables.',
            timestamp: 'Feb 23',
            read: false,
            starred: false,
            hasAttachment: true,
            folder: 'inbox',
            labels: ['work'],
        },
        {
            id: '3',
            from: 'Priya Sharma',
            fromEmail: 'priya@company.com',
            subject: 'Q1 roadmap review — action items',
            preview: 'Following up on our roadmap review yesterday. Here are the action items...',
            body: 'Following up on our roadmap review yesterday. Here are the action items we discussed and the timeline for Q1.',
            timestamp: 'Feb 22',
            read: false,
            starred: true,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['important'],
        },
        {
            id: '4',
            from: 'Alex Rivera',
            fromEmail: 'alex@company.com',
            subject: 'Re: Notification API endpoints',
            preview: 'The notification endpoints are now deployed to staging...',
            body: 'The notification endpoints are now deployed to staging. You can test them with the provided API keys.',
            timestamp: 'Feb 22',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['work'],
        },
        {
            id: '5',
            from: 'GitHub',
            fromEmail: 'notifications@github.com',
            subject: '[DashboardPack/apex-dashboard] PR #245 merged',
            preview: 'Pull request #245 has been merged. Title: feat: add advanced form components...',
            body: 'Pull request #245 has been merged. Title: feat: add advanced form components. The changes are now live in the main branch.',
            timestamp: 'Feb 21',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['updates'],
        },
        {
            id: '6',
            from: 'Emma Taylor',
            fromEmail: 'emma@company.com',
            subject: 'QA report: Country settings regression',
            preview: 'During the latest QA pass, I found a regression with the country settings...',
            body: 'During the latest QA pass, I found a regression with the country settings module. The dropdown is not saving selections properly.',
            timestamp: 'Feb 21',
            read: true,
            starred: false,
            hasAttachment: true,
            folder: 'inbox',
            labels: ['important'],
        },
        {
            id: '7',
            from: 'David Park',
            fromEmail: 'david@company.com',
            subject: 'Cloudflare Pages deployment config',
            preview: 'I\'ve looked into the auto-deploy setup for Cloudflare Pages...',
            body: 'I\'ve looked into the auto-deploy setup for Cloudflare Pages. Here\'s the configuration we need to implement.',
            timestamp: 'Feb 20',
            read: true,
            starred: true,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['work'],
        },
        {
            id: '8',
            from: 'Liam Murphy',
            fromEmail: 'liam@company.com',
            subject: 'Design system component status',
            preview: 'I wanted to share a quick status update on the design system components...',
            body: 'I wanted to share a quick status update on the design system components. Most of the core components are now complete.',
            timestamp: 'Feb 19',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['updates'],
        },
        {
            id: '9',
            from: 'Me',
            fromEmail: 'me@example.com',
            subject: 'Re: Updated design tokens for the dashboard',
            preview: 'Great work! I\'ve reviewed the OAuth color tokens and they look perfect...',
            body: 'Great work! I\'ve reviewed the OAuth color tokens and they look perfect. Let\'s proceed with the implementation.',
            timestamp: 'Feb 20',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'sent',
            labels: [],
        },
        {
            id: '10',
            from: 'Me',
            fromEmail: 'me@example.com',
            subject: 'Re: Architecture review: State management approach',
            preview: 'Great points! I agree we should keep the current approach for now...',
            body: 'Great points! I agree we should keep the current approach for now and revisit this in Q2.',
            timestamp: 'Feb 19',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'sent',
            labels: [],
        },
        {
            id: '11',
            from: 'Me',
            fromEmail: 'me@example.com',
            subject: 'Re: Cloudflare Pages deployment config',
            preview: 'Yes, please go ahead and set up auto-deploy...',
            body: 'Yes, please go ahead and set up auto-deploy. The configuration looks good to me.',
            timestamp: 'Feb 20',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'sent',
            labels: [],
        },
        {
            id: '12',
            from: 'Me',
            fromEmail: 'me@example.com',
            subject: 'Draft: February Newsletter draft',
            preview: 'Apex Dashboard — February Update. Exciting updates this month...',
            body: 'Apex Dashboard — February Update. Exciting updates this month including new components and performance improvements.',
            timestamp: 'Feb 19',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'drafts',
            labels: [],
        },
        {
            id: '13',
            from: 'Me',
            fromEmail: 'me@example.com',
            subject: 'Draft: Phase 4 progress update',
            preview: 'Phase 4 progress — Quick update on Phase 4 progress. Chat is complete. Email is in progress...',
            body: 'Phase 4 progress — Quick update on Phase 4 progress. Chat is complete. Email is in progress.',
            timestamp: 'Feb 20',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'drafts',
            labels: [],
        },
        {
            id: '14',
            from: 'No Reply',
            fromEmail: 'noreply@service.com',
            subject: 'Re: You won\'t believe this limited offer!',
            preview: 'For a limited time only, get 90% off our premium plan...',
            body: 'For a limited time only, get 90% off our premium plan. This offer expires soon!',
            timestamp: 'Feb 16',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'trash',
            labels: [],
        },
        {
            id: '15',
            from: 'Jessica Wong',
            fromEmail: 'jessica@company.com',
            subject: 'Team meeting notes - Q1 Planning',
            preview: 'Here are the notes from today\'s team meeting about Q1 planning...',
            body: 'Here are the notes from today\'s team meeting about Q1 planning. Please review and add your comments.',
            timestamp: 'Feb 18',
            read: false,
            starred: false,
            hasAttachment: true,
            folder: 'inbox',
            labels: ['work'],
        },
        {
            id: '16',
            from: 'Michael Brown',
            fromEmail: 'michael@company.com',
            subject: 'Code review request: Feature branch',
            preview: 'Could you please review my feature branch before I merge it...',
            body: 'Could you please review my feature branch before I merge it to main? The PR is ready.',
            timestamp: 'Feb 17',
            read: false,
            starred: true,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['work'],
        },
        {
            id: '17',
            from: 'LinkedIn',
            fromEmail: 'notifications@linkedin.com',
            subject: 'You have 5 new connection requests',
            preview: 'People are trying to connect with you on LinkedIn...',
            body: 'People are trying to connect with you on LinkedIn. Check out who wants to connect.',
            timestamp: 'Feb 16',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['updates'],
        },
        {
            id: '18',
            from: 'Slack',
            fromEmail: 'notifications@slack.com',
            subject: 'Daily digest: 12 new messages',
            preview: 'You have 12 new messages across 3 channels...',
            body: 'You have 12 new messages across 3 channels. Stay up to date with your team.',
            timestamp: 'Feb 15',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['updates'],
        },
        {
            id: '19',
            from: 'Rachel Green',
            fromEmail: 'rachel@company.com',
            subject: 'Budget approval needed',
            preview: 'The Q2 budget proposal needs your approval before Friday...',
            body: 'The Q2 budget proposal needs your approval before Friday. Please review the attached spreadsheet.',
            timestamp: 'Feb 14',
            read: false,
            starred: true,
            hasAttachment: true,
            folder: 'inbox',
            labels: ['important'],
        },
        {
            id: '20',
            from: 'Tom Anderson',
            fromEmail: 'tom@company.com',
            subject: 'Server maintenance scheduled',
            preview: 'Scheduled maintenance window this weekend from 2 AM to 6 AM...',
            body: 'Scheduled maintenance window this weekend from 2 AM to 6 AM. Services will be temporarily unavailable.',
            timestamp: 'Feb 13',
            read: true,
            starred: false,
            hasAttachment: false,
            folder: 'inbox',
            labels: ['important'],
        },
    ]);

    const handleToggleStar = (id: string) => {
        setEmails(emails.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
    };

    const handleMarkAsRead = (id: string) => {
        setEmails(emails.map(e => e.id === id ? { ...e, read: true } : e));
    };

    const handleDelete = (id: string) => {
        setEmails(emails.map(e => e.id === id ? { ...e, folder: 'trash' } : e));
        setSelectedEmail(null);
        toast.success('Email moved to trash');
    };

    const handleFolderChange = (folder: 'inbox' | 'sent' | 'drafts' | 'trash') => {
        setSelectedFolder(folder);
        setSelectedEmail(null);
        setCurrentPage(1);
    };

    const openComposeModal = (mode: 'compose' | 'reply' | 'replyAll' = 'compose', email?: Email) => {
        setComposeModal({
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            mode,
            to: mode === 'compose' ? '' : email?.fromEmail || '',
            subject: mode === 'compose' ? '' : `Re: ${email?.subject || ''}`,
            body: mode === 'compose' ? '' : `\n\n--- Original Message ---\nFrom: ${email?.from}\nSubject: ${email?.subject}\n\n${email?.body}`,
            originalEmail: email,
        });
    };

    const closeComposeModal = () => {
        setComposeModal(prev => ({ ...prev, isOpen: false }));
    };

    const toggleMinimize = () => {
        setComposeModal(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    };

    const toggleMaximize = () => {
        setComposeModal(prev => ({ ...prev, isMaximized: !prev.isMaximized }));
    };

    const handleSendEmail = () => {
        toast.success('Email sent successfully');
        closeComposeModal();
    };

    const handleDeleteDraft = () => {
        toast.success('Draft deleted');
        closeComposeModal();
    };

    const filteredEmails = emails.filter(e => {
        const matchesFolder = e.folder === selectedFolder;
        const matchesSearch = searchQuery === '' ||
            e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.preview.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFolder && matchesSearch;
    });

    const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEmails = filteredEmails.slice(startIndex, endIndex);

    const unreadCount = emails.filter(e => !e.read && e.folder === 'inbox').length;
    const inboxCount = emails.filter(e => e.folder === 'inbox').length;
    const sentCount = emails.filter(e => e.folder === 'sent').length;
    const draftsCount = emails.filter(e => e.folder === 'drafts').length;
    const trashCount = emails.filter(e => e.folder === 'trash').length;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                        <Mail size={16} className="text-[#2F6BFF]" />
                    </div>
                    <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Mail</h1>
                </div>
                <p className="text-micro text-gray-300 ml-8">Email inbox and messages.</p>
            </div>

            <div className="grid grid-cols-12 gap-3">
                {/* Sidebar */}
                <div className="col-span-2 xl:col-span-2 lg:col-span-3">
                    <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 p-3 h-full flex flex-col">
                        <button
                            onClick={() => openComposeModal('compose')}
                            className="w-full mb-4 px-3 py-3 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300"
                        >
                            + Compose
                        </button>

                        <div className="space-y-1 mb-4">
                            <button
                                onClick={() => handleFolderChange('inbox')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${selectedFolder === 'inbox'
                                    ? 'bg-[#2F6BFF] text-white'
                                    : 'text-gray-300 hover:bg-[#1E1854]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Inbox size={16} />
                                    <span>Inbox</span>
                                </div>
                                {inboxCount > 0 && <span className="text-[11px] font-semibold">{inboxCount}</span>}
                            </button>

                            <button
                                onClick={() => handleFolderChange('sent')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${selectedFolder === 'sent'
                                    ? 'bg-[#2F6BFF] text-white'
                                    : 'text-gray-300 hover:bg-[#1E1854]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Send size={16} />
                                    <span>Sent</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleFolderChange('drafts')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${selectedFolder === 'drafts'
                                    ? 'bg-[#2F6BFF] text-white'
                                    : 'text-gray-300 hover:bg-[#1E1854]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Clock size={16} />
                                    <span>Drafts</span>
                                </div>
                                {draftsCount > 0 && <span className="text-[11px] font-semibold">{draftsCount}</span>}
                            </button>

                            <button
                                onClick={() => handleFolderChange('trash')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${selectedFolder === 'trash'
                                    ? 'bg-[#2F6BFF] text-white'
                                    : 'text-gray-300 hover:bg-[#1E1854]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 size={16} />
                                    <span>Trash</span>
                                </div>
                            </button>
                        </div>

                        {/* Labels */}
                        <div className="pt-3 border-t border-gray-700/30 flex-1">
                            <div className="text-[10px] text-gray-400 font-semibold mb-2 px-3 tracking-wider">LABELS</div>
                            <div className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#1E1854] transition-all duration-300">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span>Personal</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#1E1854] transition-all duration-300">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span>Work</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#1E1854] transition-all duration-300">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span>Important</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#1E1854] transition-all duration-300">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <span>Updates</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email List or Detail View */}
                <div className="col-span-10 xl:col-span-10 lg:col-span-9 flex flex-col">
                    {!selectedEmail ? (
                        <>
                            {/* Search */}
                            <div className="mb-2 relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search emails..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-2.5 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-[11px] text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF]"
                                />
                            </div>

                            {/* Email List */}
                            <div className="flex-1 mb-2 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 overflow-hidden flex flex-col">
                                <div className="flex-1 overflow-y-auto">
                                    {currentEmails.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-micro">
                                            No emails in {selectedFolder}
                                        </div>
                                    ) : (
                                        currentEmails.map((email, index) => (
                                            <div
                                                key={email.id}
                                                onClick={() => {
                                                    setSelectedEmail(email);
                                                    handleMarkAsRead(email.id);
                                                }}
                                                className={`flex items-center gap-2.5 p-2 cursor-pointer hover:bg-[#1E1854] transition-all duration-300 ${index !== currentEmails.length - 1 ? 'border-b border-gray-700/30' : ''
                                                    } ${!email.read ? 'bg-[#1E1854]/30' : ''}`}
                                            >
                                                {/* Star */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleStar(email.id);
                                                    }}
                                                    className="flex-shrink-0"
                                                >
                                                    <Star
                                                        size={16}
                                                        className={`transition-colors ${email.starred
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-600 hover:text-gray-400'
                                                            }`}
                                                    />
                                                </button>

                                                {/* From */}
                                                <div className="w-40 flex-shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs truncate ${!email.read ? 'text-white font-semibold' : 'text-gray-300'}`}>
                                                            {email.from}
                                                        </span>
                                                        {!email.read && (
                                                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Subject and Preview */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs ${!email.read ? 'text-white font-semibold' : 'text-gray-300'}`}>
                                                            {email.subject}
                                                        </span>
                                                        <span className="text-xs text-gray-500 truncate">
                                                            — {email.preview}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Timestamp and Attachment */}
                                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                                    {email.hasAttachment && (
                                                        <Paperclip size={14} className="text-gray-500" />
                                                    )}
                                                    <span className="text-[11px] text-gray-500 w-16 text-right">
                                                        {email.timestamp}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Pagination */}
                            {filteredEmails.length > 0 && (
                                <div className="flex items-center justify-between p-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg">
                                    <div className="text-[10px] text-gray-400">
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredEmails.length)} of {filteredEmails.length}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1 rounded bg-[#16124A] text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-2 py-1 rounded text-[10px] font-semibold transition-all duration-300 ${currentPage === page
                                                    ? 'bg-[#2F6BFF] text-white'
                                                    : 'bg-[#16124A] text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854]'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1 rounded bg-[#16124A] text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Email Detail View */
                        <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 p-3">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-700/30">
                                <div className="flex-1">
                                    <h2 className="text-micro text-[#efdede] font-semibold mb-1">{selectedEmail.subject}</h2>
                                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                        <span className="font-semibold text-gray-300">{selectedEmail.from}</span>
                                        <span>&lt;{selectedEmail.fromEmail}&gt;</span>
                                        <span>•</span>
                                        <span>{selectedEmail.timestamp}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedEmail(null)}
                                    className="p-1 text-gray-400 hover:text-[#efdede] transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="mb-3 text-[10px] text-gray-300 leading-relaxed">
                                {selectedEmail.body}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-700/30">
                                <button
                                    onClick={() => openComposeModal('reply', selectedEmail)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2F6BFF] text-white rounded-lg text-[10px] font-semibold hover:bg-[#2557c9] transition-all duration-300"
                                >
                                    <Reply size={12} />
                                    <span>Reply</span>
                                </button>
                                <button
                                    onClick={() => openComposeModal('replyAll', selectedEmail)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16124A] text-gray-300 rounded-lg text-[10px] font-semibold hover:bg-[#1E1854] transition-all duration-300"
                                >
                                    <ReplyAll size={12} />
                                    <span>Reply All</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedEmail.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-semibold hover:bg-red-500/20 transition-all duration-300"
                                >
                                    <Trash2 size={12} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Modal */}
            {composeModal.isOpen && (
                <>
                    {/* Backdrop */}
                    {!composeModal.isMinimized && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={closeComposeModal}
                        />
                    )}

                    {/* Modal */}
                    <div
                        className={`fixed z-50 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 shadow-2xl transition-all duration-300 ${composeModal.isMinimized
                            ? 'bottom-0 right-4 w-80 h-14'
                            : composeModal.isMaximized
                                ? 'inset-4'
                                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[600px]'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-700/30">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-[#2F6BFF]" />
                                <h3 className="text-xs font-semibold text-white">
                                    {composeModal.mode === 'compose' ? 'New Message' : composeModal.mode === 'reply' ? 'Reply' : 'Reply All'}
                                </h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={toggleMinimize}
                                    className="p-1.5 text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854] rounded transition-all duration-300"
                                    title={composeModal.isMinimized ? 'Restore' : 'Minimize'}
                                >
                                    <Minimize2 size={14} />
                                </button>
                                {!composeModal.isMinimized && (
                                    <button
                                        onClick={toggleMaximize}
                                        className="p-1.5 text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854] rounded transition-all duration-300"
                                        title={composeModal.isMaximized ? 'Restore' : 'Maximize'}
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={closeComposeModal}
                                    className="p-1.5 text-gray-400 hover:text-[#efdede] hover:bg-[#1E1854] rounded transition-all duration-300"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        {!composeModal.isMinimized && (
                            <div className="flex flex-col h-[calc(100%-120px)] p-3 space-y-3">
                                {/* To */}
                                <div>
                                    <label className="text-[10px] text-gray-400 mb-1 block">To</label>
                                    <input
                                        type="email"
                                        value={composeModal.to}
                                        onChange={(e) => setComposeModal(prev => ({ ...prev, to: e.target.value }))}
                                        placeholder="recipient@example.com"
                                        className="w-full px-3 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF]"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="text-[10px] text-gray-400 mb-1 block">Subject</label>
                                    <input
                                        type="text"
                                        value={composeModal.subject}
                                        onChange={(e) => setComposeModal(prev => ({ ...prev, subject: e.target.value }))}
                                        placeholder="Email subject"
                                        className="w-full px-3 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF]"
                                    />
                                </div>

                                {/* Message */}
                                <div className="flex-1 flex flex-col">
                                    <label className="text-[10px] text-gray-400 mb-1 block">Message</label>
                                    <textarea
                                        value={composeModal.body}
                                        onChange={(e) => setComposeModal(prev => ({ ...prev, body: e.target.value }))}
                                        placeholder="Write your message..."
                                        className="flex-1 px-3 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        {!composeModal.isMinimized && (
                            <div className="flex items-center justify-between p-3 border-t border-gray-700/30">
                                <button
                                    onClick={handleSendEmail}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300"
                                >
                                    <Send size={14} />
                                    <span>Send</span>
                                </button>
                                <button
                                    onClick={handleDeleteDraft}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-all duration-300"
                                >
                                    <Trash2 size={14} />
                                    <span>Delete Draft</span>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
