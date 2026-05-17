import {
    EnhancedModal,
    ModalActions,
    ModalButton,
    ModalSectionCard,
} from '@/components/ui/EnhancedModal';
import { useEffect, useState } from 'react';
import { Portfolio } from '../pages/PortfolioPage';

interface PortfolioModalProps {
    portfolio: Portfolio | null;
    onClose: () => void;
}

function PortfolioModal({ portfolio, onClose }: PortfolioModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        initialInvestment: '',
        status: 'Active' as Portfolio['status'],
        riskLevel: 'Medium' as Portfolio['riskLevel'],
        maxLossPercentage: '10',
        maxDrawdownPercentage: '15',
        dailyLossLimit: '5',
    });

    useEffect(() => {
        if (portfolio) {
            setFormData({
                name: portfolio.name,
                description: portfolio.description || '',
                initialInvestment: portfolio.initialInvestment.toString(),
                status: portfolio.status,
                riskLevel: portfolio.riskLevel,
                maxLossPercentage: portfolio.maxLossPercentage.toString(),
                maxDrawdownPercentage: portfolio.maxDrawdownPercentage.toString(),
                dailyLossLimit: portfolio.dailyLossLimit.toString(),
            });
        }
    }, [portfolio]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submit portfolio:', formData);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <EnhancedModal
            isOpen={true}
            onClose={onClose}
            title={portfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
            maxWidth="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* Basic Info - Enhanced */}
                    <ModalSectionCard
                        title="BASIC INFORMATION"
                        colorScheme="blue"
                        icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    >
                        <div className="space-y-1.5">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Portfolio Name <span className="text-red-400">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-gradient-to-br from-[#2F6BFF]/15 to-purple-500/10 hover:from-[#2F6BFF]/25 hover:to-purple-500/20 border-2 border-[#2F6BFF]/40 hover:border-[#2F6BFF]/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/30 transition-all duration-300 shadow-[0_4px_20px_rgba(47,107,255,0.15)] hover:shadow-[0_4px_24px_rgba(47,107,255,0.25)] text-sm smooth-hover font-medium" placeholder="Enter portfolio name" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full px-3 py-2 bg-gradient-to-br from-[#2F6BFF]/15 to-purple-500/10 hover:from-[#2F6BFF]/25 hover:to-purple-500/20 border-2 border-[#2F6BFF]/40 hover:border-[#2F6BFF]/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/30 transition-all duration-300 shadow-[0_4px_20px_rgba(47,107,255,0.15)] hover:shadow-[0_4px_24px_rgba(47,107,255,0.25)] text-sm resize-none smooth-hover font-medium" placeholder="Enter description" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Initial Investment <span className="text-red-400">*</span></label>
                            <div className="relative group/input">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2F6BFF] font-bold text-base drop-shadow-[0_0_8px_rgba(47,107,255,0.6)]">R</span>
                                <input type="number" name="initialInvestment" value={formData.initialInvestment} onChange={handleChange} required min="0" step="0.01" className="w-full pl-9 pr-3 py-2 bg-gradient-to-br from-[#2F6BFF]/15 to-purple-500/10 hover:from-[#2F6BFF]/25 hover:to-purple-500/20 border-2 border-[#2F6BFF]/40 hover:border-[#2F6BFF]/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/30 transition-all duration-300 shadow-[0_4px_20px_rgba(47,107,255,0.15)] hover:shadow-[0_4px_24px_rgba(47,107,255,0.25)] text-sm smooth-hover font-medium" placeholder="0.00" />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#2F6BFF]/0 via-[#2F6BFF]/10 to-[#2F6BFF]/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>
                    </ModalSectionCard>

                    {/* Status & Risk - Enhanced */}
                    <ModalSectionCard
                        title="STATUS & RISK"
                        colorScheme="orange"
                        icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    >
                        <div className="space-y-1.5">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Status <span className="text-red-400">*</span></label>
                            <select name="status" value={formData.status} onChange={handleChange} required className="w-full px-3 py-2 bg-gradient-to-br from-[#FFA62B]/15 to-yellow-500/10 hover:from-[#FFA62B]/25 hover:to-yellow-500/20 border-2 border-[#FFA62B]/40 hover:border-[#FFA62B]/70 rounded-lg text-white focus:outline-none focus:border-[#FFA62B] focus:ring-2 focus:ring-[#FFA62B]/30 transition-all duration-300 shadow-[0_4px_20px_rgba(255,166,43,0.15)] hover:shadow-[0_4px_24px_rgba(255,166,43,0.25)] text-sm cursor-pointer smooth-hover font-medium">
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Closed">Closed</option>
                                <option value="UnderReview">Under Review</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Risk Level <span className="text-red-400">*</span></label>
                            <select name="riskLevel" value={formData.riskLevel} onChange={handleChange} required className="w-full px-3 py-2 bg-gradient-to-br from-[#FFA62B]/15 to-yellow-500/10 hover:from-[#FFA62B]/25 hover:to-yellow-500/20 border-2 border-[#FFA62B]/40 hover:border-[#FFA62B]/70 rounded-lg text-white focus:outline-none focus:border-[#FFA62B] focus:ring-2 focus:ring-[#FFA62B]/30 transition-all duration-300 shadow-[0_4px_20px_rgba(255,166,43,0.15)] hover:shadow-[0_4px_24px_rgba(255,166,43,0.25)] text-sm cursor-pointer smooth-hover font-medium">
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="VeryHigh">Very High</option>
                            </select>
                        </div>
                    </ModalSectionCard>
                </div>

                {/* Risk Management - Enhanced */}
                <ModalSectionCard
                    title="RISK MANAGEMENT"
                    colorScheme="red"
                    icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    }
                >
                    <div className="grid grid-cols-3 gap-2.5">
                        <div className="space-y-1.5">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Max Loss %</label>
                            <input type="number" name="maxLossPercentage" value={formData.maxLossPercentage} onChange={handleChange} min="0" max="100" step="0.1" className="w-full px-2.5 py-2 bg-gradient-to-br from-red-500/15 to-orange-500/10 hover:from-red-500/25 hover:to-orange-500/20 border-2 border-red-500/40 hover:border-red-500/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300 shadow-[0_4px_20px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_24px_rgba(239,68,68,0.25)] text-sm smooth-hover font-medium" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Max DD %</label>
                            <input type="number" name="maxDrawdownPercentage" value={formData.maxDrawdownPercentage} onChange={handleChange} min="0" max="100" step="0.1" className="w-full px-2.5 py-2 bg-gradient-to-br from-red-500/15 to-orange-500/10 hover:from-red-500/25 hover:to-orange-500/20 border-2 border-red-500/40 hover:border-red-500/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300 shadow-[0_4px_20px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_24px_rgba(239,68,68,0.25)] text-sm smooth-hover font-medium" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Daily Loss %</label>
                            <input type="number" name="dailyLossLimit" value={formData.dailyLossLimit} onChange={handleChange} min="0" max="100" step="0.1" className="w-full px-2.5 py-2 bg-gradient-to-br from-red-500/15 to-orange-500/10 hover:from-red-500/25 hover:to-orange-500/20 border-2 border-red-500/40 hover:border-red-500/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300 shadow-[0_4px_20px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_24px_rgba(239,68,68,0.25)] text-sm smooth-hover font-medium" />
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Enhanced Action Buttons */}
                <ModalActions>
                    <ModalButton type="button" onClick={onClose} variant="secondary">
                        Cancel
                    </ModalButton>
                    <ModalButton type="submit" variant="primary">
                        {portfolio ? 'Update Portfolio' : 'Create Portfolio'}
                    </ModalButton>
                </ModalActions>
            </form>
        </EnhancedModal>
    );
}

export default PortfolioModal;
