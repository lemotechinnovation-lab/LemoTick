import { GlassCard, StatCard } from '@/components/ui/DesignSystem';
import { EnhancedModal, ModalActions, ModalButton, ModalSectionCard } from '@/components/ui/EnhancedModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, Stack } from '@/components/ui/PageLayoutEnhanced';
import { AlertCircle, CheckCircle, Clock, FileText, Headphones, Mail, MessageCircle, Phone, Plus, Tag } from 'lucide-react';
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
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        category: 'Technical',
        priority: 'Medium',
        description: '',
    });

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Support ticket created successfully');
        setShowNewTicketModal(false);
        setTicketForm({
            subject: '',
            category: 'Technical',
            priority: 'Medium',
            description: '',
        });
    };

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

    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const avgResponseTime = '2.5h';

    return (
        <PageContainer maxWidth="xl" className="fade-in-up relative overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-blue/15 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent-orange/10 via-pink-500/5 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }}></div>

            <PageHeader
                title="SUPPORT CENTER"
                description="Get help and find answers to your questions"
                icon={Headphones}
                actions={
                    <button
                        onClick={() => setShowNewTicketModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-[#3B82F6] hover:from-[#3B82F6] hover:to-brand-blue text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-brand-blue/50 text-sm font-semibold group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                        <Plus className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">New Ticket</span>
                    </button>
                }
            />

            <Stack spacing="lg" className="relative z-10">
                {/* Support Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
                    <StatCard
                        icon={<MessageCircle className="w-6 h-6" />}
                        value={tickets.length.toString()}
                        label="Total Tickets"
                        variant="blue"
                        delay={0}
                    />
                    <StatCard
                        icon={<AlertCircle className="w-6 h-6" />}
                        value={openTickets.toString()}
                        label="Open Tickets"
                        variant="orange"
                        delay={100}
                    />
                    <StatCard
                        icon={<CheckCircle className="w-6 h-6" />}
                        value={resolvedTickets.toString()}
                        label="Resolved"
                        variant="green"
                        delay={200}
                    />
                    <StatCard
                        icon={<Clock className="w-6 h-6" />}
                        value={avgResponseTime}
                        label="Avg Response"
                        variant="purple"
                        delay={300}
                    />
                </div>

                {/* Contact Options */}
                <GlassCard className="p-4 sm:p-6 smooth-hover border border-brand-blue/30 shadow-2xl shadow-brand-blue/10 backdrop-blur-xl relative group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <h3 className="text-base sm:text-lg font-bold text-[#E8B4B8] mb-4 relative z-10 uppercase">Contact Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                        <button
                            onClick={() => toast.success('Opening live chat...')}
                            className="group/contact relative overflow-hidden p-5 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl border border-brand-blue/30 hover:border-brand-blue/60 transition-all duration-300 hover:transform hover:scale-[1.02] text-left shadow-lg hover:shadow-xl hover:shadow-brand-blue/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover/contact:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/30 to-purple-500/30 flex items-center justify-center mb-3 shadow-lg border border-brand-blue/40 group-hover/contact:scale-110 transition-transform">
                                    <MessageCircle className="w-6 h-6 text-brand-blue" />
                                </div>
                                <div className="text-sm font-bold text-white mb-1 group-hover/contact:text-brand-blue transition-colors">Live Chat</div>
                                <div className="text-xs text-white font-medium">Average wait: 2 min</div>
                            </div>
                        </button>

                        <button
                            onClick={() => toast.success('Opening email form...')}
                            className="group/contact relative overflow-hidden p-5 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl border border-brand-blue/30 hover:border-brand-blue/60 transition-all duration-300 hover:transform hover:scale-[1.02] text-left shadow-lg hover:shadow-xl hover:shadow-brand-blue/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover/contact:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center mb-3 shadow-lg border border-green-400/40 group-hover/contact:scale-110 transition-transform">
                                    <Mail className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-sm font-bold text-white mb-1 group-hover/contact:text-green-400 transition-colors">Email Support</div>
                                <div className="text-xs text-white font-medium">Response in 24h</div>
                            </div>
                        </button>

                        <button
                            onClick={() => toast.success('Calling support...')}
                            className="group/contact relative overflow-hidden p-5 bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl border border-brand-blue/30 hover:border-brand-blue/60 transition-all duration-300 hover:transform hover:scale-[1.02] text-left shadow-lg hover:shadow-xl hover:shadow-brand-blue/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover/contact:opacity-100 transition-opacity pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-orange/30 to-orange-500/30 flex items-center justify-center mb-3 shadow-lg border border-accent-orange/40 group-hover/contact:scale-110 transition-transform">
                                    <Phone className="w-6 h-6 text-accent-orange" />
                                </div>
                                <div className="text-sm font-bold text-white mb-1 group-hover/contact:text-accent-orange transition-colors">Phone Support</div>
                                <div className="text-xs text-white font-medium">Mon-Fri 9AM-5PM</div>
                            </div>
                        </button>
                    </div>
                </GlassCard>

                {/* Support Tickets */}
                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base sm:text-lg font-bold text-[#E8B4B8] uppercase">My Support Tickets</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {tickets.map((ticket, index) => (
                            <GlassCard
                                key={ticket.id}
                                variant="blue"
                                className="p-0 animate-fade-in-up cursor-pointer"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-[#1E40AF] flex items-center justify-center shadow-lg shadow-brand-blue/30 group-hover:shadow-brand-blue/50 transition-all duration-300 group-hover:scale-110">
                                            <Headphones className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-xs text-gray-400 font-mono">{ticket.id}</span>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-sm ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-blue transition-colors duration-300 line-clamp-2">
                                                {ticket.subject}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-brand-blue/10 to-[#1E40AF]/5 border border-brand-blue/20 hover:border-brand-blue/40 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-blue/10 rounded-full blur-xl group-hover/metric:bg-brand-blue/20 transition-all duration-300 pointer-events-none" />
                                            <div className="relative">
                                                <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Category</div>
                                                <div className="text-sm font-bold text-white truncate">{ticket.category}</div>
                                            </div>
                                        </div>

                                        <div className={`group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br ${ticket.priority === 'high' ? 'from-[#EF4444]/10 to-[#DC2626]/5 border-[#EF4444]/20 hover:border-[#EF4444]/40' : ticket.priority === 'medium' ? 'from-[#F59E0B]/10 to-[#D97706]/5 border-[#F59E0B]/20 hover:border-[#F59E0B]/40' : 'from-[#10B981]/10 to-[#059669]/5 border-[#10B981]/20 hover:border-[#10B981]/40'} border backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                                            <div className={`absolute top-0 right-0 w-16 h-16 ${ticket.priority === 'high' ? 'bg-[#EF4444]/10 group-hover/metric:bg-[#EF4444]/20' : ticket.priority === 'medium' ? 'bg-[#F59E0B]/10 group-hover/metric:bg-[#F59E0B]/20' : 'bg-[#10B981]/10 group-hover/metric:bg-[#10B981]/20'} rounded-full blur-xl transition-all duration-300 pointer-events-none`} />
                                            <div className="relative">
                                                <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Priority</div>
                                                <div className={`text-sm font-bold ${getPriorityColor(ticket.priority)} capitalize truncate`}>
                                                    {ticket.priority}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group/metric relative overflow-hidden p-3 rounded-lg bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/5 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 col-span-2">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B5CF6]/10 rounded-full blur-xl group-hover/metric:bg-[#8B5CF6]/20 transition-all duration-300 pointer-events-none" />
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Clock className="w-3 h-3 text-[#8B5CF6]" />
                                                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Last Update</div>
                                                </div>
                                                <div className="text-sm font-bold text-white">{ticket.lastUpdate}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <button className="w-full group/btn relative overflow-hidden px-3 py-2.5 rounded-lg bg-gradient-to-r from-brand-blue via-[#3B82F6] to-brand-blue bg-size-200 bg-pos-0 hover:bg-pos-100 text-white transition-all duration-500 shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/50 text-xs font-bold hover:scale-[1.02]">
                                        <span className="relative flex items-center justify-center gap-1.5">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            View Ticket
                                        </span>
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <h2 className="text-base sm:text-lg font-bold text-[#E8B4B8] mb-4 uppercase">Frequently Asked Questions</h2>

                    <GlassCard className="p-4 sm:p-8 smooth-hover border border-brand-blue/30 shadow-2xl shadow-brand-blue/10 backdrop-blur-xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-1 relative z-10">
                            {faqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="group/faq relative overflow-hidden rounded-lg border border-transparent hover:border-brand-blue/30 transition-all duration-300"
                                >
                                    <button
                                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                        className="w-full px-4 py-4 flex items-center justify-between gap-4 text-left bg-transparent hover:bg-[#16124A]/50 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-1 h-1 rounded-full bg-gray-600 group-hover/faq:bg-brand-blue transition-colors duration-300 shrink-0" />
                                            <span className="text-sm font-medium text-gray-300 group-hover/faq:text-white transition-colors duration-300">
                                                {faq.question}
                                            </span>
                                        </div>
                                        <div className={`shrink-0 transition-transform duration-300 ${expandedFAQ === faq.id ? 'rotate-45' : ''}`}>
                                            <Plus className="w-4 h-4 text-gray-500 group-hover/faq:text-brand-blue" />
                                        </div>
                                    </button>

                                    {expandedFAQ === faq.id && (
                                        <div className="px-4 pb-4 pl-11 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </Stack>

            {/* New Ticket Modal */}
            <EnhancedModal
                isOpen={showNewTicketModal}
                onClose={() => setShowNewTicketModal(false)}
                title="Create Support Ticket"
            >
                <form onSubmit={handleTicketSubmit} className="space-y-2">
                    {/* Ticket Details */}
                    <ModalSectionCard title="Ticket Details" icon={<FileText className="w-4 h-4" />} colorScheme="blue">
                        <div className="space-y-1">
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Subject <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={ticketForm.subject}
                                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                    required
                                    placeholder="Brief description of your issue"
                                    className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={ticketForm.description}
                                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                    required
                                    placeholder="Provide detailed information about your issue"
                                    rows={3}
                                    className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 resize-none transition-all"
                                />
                            </div>
                        </div>
                    </ModalSectionCard>

                    {/* Category & Priority */}
                    <ModalSectionCard title="Category & Priority" icon={<Tag className="w-4 h-4" />} colorScheme="orange">
                        <div className="grid grid-cols-2 gap-1.5">
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Category <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={ticketForm.category}
                                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                                    required
                                    className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option>Technical</option>
                                    <option>Billing</option>
                                    <option>Account</option>
                                    <option>Trading</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Priority <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={ticketForm.priority}
                                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                                    required
                                    className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>
                    </ModalSectionCard>

                    {/* Actions */}
                    <ModalActions>
                        <ModalButton type="button" onClick={() => setShowNewTicketModal(false)} variant="secondary">
                            Cancel
                        </ModalButton>
                        <ModalButton type="submit" variant="primary">
                            Create Ticket
                        </ModalButton>
                    </ModalActions>
                </form>
            </EnhancedModal>
        </PageContainer>
    );
}


