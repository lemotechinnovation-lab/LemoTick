import { ChevronDown, ChevronRight, Headphones, Mail, MessageCircle, Phone, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SupportTicket {
    id: string;
    subject: string;
    category: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    created: string;
    lastUpdate: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);

    const tickets: SupportTicket[] = [
        {
            id: 'TKT-001',
            subject: 'Unable to execute trade',
            category: 'Technical',
            status: 'in-progress',
            priority: 'high',
            created: '2024-03-08',
            lastUpdate: '2 hours ago',
        },
        {
            id: 'TKT-002',
            subject: 'Question about withdrawal fees',
            category: 'Billing',
            status: 'resolved',
            priority: 'medium',
            created: '2024-03-07',
            lastUpdate: '1 day ago',
        },
        {
            id: 'TKT-003',
            subject: 'Account verification pending',
            category: 'Account',
            status: 'open',
            priority: 'medium',
            created: '2024-03-06',
            lastUpdate: '2 days ago',
        },
    ];

    const faqs: FAQ[] = [
        {
            id: '1',
            question: 'How do I verify my account?',
            answer: 'To verify your account, go to Settings > Account Verification and upload the required documents (ID, proof of address, and selfie). Verification typically takes 24-48 hours.',
            category: 'Account',
        },
        {
            id: '2',
            question: 'What are the trading fees?',
            answer: 'Trading fees vary by plan: Free plan has 0.5% per trade, Pro plan has 0.3% per trade, and Enterprise plan has 0.1% per trade. Volume discounts are available.',
            category: 'Trading',
        },
        {
            id: '3',
            question: 'How long do withdrawals take?',
            answer: 'Withdrawals are processed within 24 hours. Bank transfers take 1-3 business days, while crypto withdrawals are typically instant after confirmation.',
            category: 'Billing',
        },
        {
            id: '4',
            question: 'Can I change my subscription plan?',
            answer: 'Yes, you can upgrade or downgrade your plan anytime from the Pricing page. Changes take effect immediately, and billing is prorated.',
            category: 'Billing',
        },
        {
            id: '5',
            question: 'Is my data secure?',
            answer: 'Yes, we use bank-level encryption (256-bit SSL) and store sensitive data in encrypted format. We are also compliant with GDPR and SOC 2 standards.',
            category: 'Security',
        },
        {
            id: '6',
            question: 'How do I enable two-factor authentication?',
            answer: 'Go to Settings > Security and click "Enable 2FA". Scan the QR code with your authenticator app and enter the verification code to complete setup.',
            category: 'Security',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'in-progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'resolved': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'closed': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const filteredFAQs = faqs.filter(faq =>
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                        <Headphones size={16} className="text-[#2F6BFF]" />
                    </div>
                    <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Support Center</h1>
                </div>
                <p className="text-micro text-gray-300 ml-8">Get help and find answers to your questions</p>
            </div>

            <div className="grid grid-cols-12 gap-4">
                {/* Left Column - Contact & Tickets */}
                <div className="col-span-8 space-y-4">
                    {/* Contact Options */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => toast.success('Opening live chat...')}
                            className="p-3 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift"
                        >
                            <MessageCircle size={20} className="text-[#2F6BFF] mb-2" />
                            <div className="text-xs font-semibold text-white mb-0.5">Live Chat</div>
                            <div className="text-[9px] text-gray-400">Average wait: 2 min</div>
                        </button>

                        <button
                            onClick={() => toast.success('Opening email form...')}
                            className="p-3 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift"
                        >
                            <Mail size={20} className="text-[#2F6BFF] mb-2" />
                            <div className="text-xs font-semibold text-white mb-0.5">Email Support</div>
                            <div className="text-[9px] text-gray-400">Response in 24h</div>
                        </button>

                        <button
                            onClick={() => toast.success('Calling support...')}
                            className="p-3 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift"
                        >
                            <Phone size={20} className="text-[#2F6BFF] mb-2" />
                            <div className="text-xs font-semibold text-white mb-0.5">Phone Support</div>
                            <div className="text-[9px] text-gray-400">Mon-Fri 9AM-5PM</div>
                        </button>
                    </div>

                    {/* Support Tickets */}
                    <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 p-3">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-small-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">My Support Tickets</h2>
                            <button
                                onClick={() => setShowNewTicketModal(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] text-white rounded-lg text-[10px] font-semibold hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300"
                            >
                                <Plus size={12} />
                                <span>New Ticket</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="p-2.5 bg-[#0B0633] rounded-lg border border-gray-700/30 hover:border-[#2F6BFF]/30 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] text-gray-400 font-mono">{ticket.id}</span>
                                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-xs font-semibold text-white mb-1">{ticket.subject}</h3>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                                <span>{ticket.category}</span>
                                                <span>•</span>
                                                <span className={getPriorityColor(ticket.priority)}>
                                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-gray-400 mb-0.5">Last update</div>
                                            <div className="text-[10px] text-gray-300">{ticket.lastUpdate}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - FAQ */}
                <div className="col-span-4">
                    <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 p-3">
                        <h2 className="text-small-dashboard font-bold text-[#efdede] mb-3">Frequently Asked Questions</h2>

                        {/* Search */}
                        <div className="mb-3 relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-2.5 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-[11px] text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF]"
                            />
                        </div>

                        {/* FAQ List */}
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {filteredFAQs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-[#0B0633] rounded-lg border border-gray-700/30 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                        className="w-full p-2.5 flex items-start justify-between gap-2 hover:bg-[#1E1854] transition-all duration-300"
                                    >
                                        <span className="text-[11px] font-semibold text-white text-left">{faq.question}</span>
                                        {expandedFAQ === faq.id ? (
                                            <ChevronDown size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <ChevronRight size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                        )}
                                    </button>
                                    {expandedFAQ === faq.id && (
                                        <div className="px-2.5 pb-2.5">
                                            <p className="text-[10px] text-gray-300 leading-relaxed">{faq.answer}</p>
                                            <span className="inline-block mt-2 px-2 py-0.5 bg-[#2F6BFF]/20 text-[#2F6BFF] rounded text-[9px] font-semibold">
                                                {faq.category}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* New Ticket Modal */}
            {showNewTicketModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowNewTicketModal(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg border border-[#2F6BFF]/30 shadow-2xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-small-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Create Support Ticket</h3>
                            <button
                                onClick={() => setShowNewTicketModal(false)}
                                className="text-gray-400 hover:text-[#efdede] transition-colors"
                            >
                                <Plus size={16} className="rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Brief description of your issue"
                                    className="w-full px-3 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF]"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Category</label>
                                <select className="w-full px-3 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white focus:outline-none focus:border-[#2F6BFF]">
                                    <option>Technical</option>
                                    <option>Billing</option>
                                    <option>Account</option>
                                    <option>Trading</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Priority</label>
                                <select className="w-full px-3 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white focus:outline-none focus:border-[#2F6BFF]">
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Description</label>
                                <textarea
                                    placeholder="Provide detailed information about your issue"
                                    rows={4}
                                    className="w-full px-3 py-2 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] resize-none"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => {
                                        toast.success('Support ticket created successfully');
                                        setShowNewTicketModal(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all duration-300"
                                >
                                    Create Ticket
                                </button>
                                <button
                                    onClick={() => setShowNewTicketModal(false)}
                                    className="px-4 py-2 bg-[#0B0633] text-gray-300 rounded-lg text-xs font-semibold hover:bg-[#1E1854] transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
