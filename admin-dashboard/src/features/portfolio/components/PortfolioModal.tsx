import ModalHeader from '@/components/common/ModalHeader';
import { type FormEvent, useEffect, useState } from 'react';
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Submit portfolio:', formData);
        // TODO: Implement API call
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn border border-[#2F6BFF]/30 flex flex-col">
                {/* Header with blur effect */}
                <ModalHeader
                    title={portfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
                    onClose={onClose}
                />

                {/* Form - scrollable content */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="p-3 space-y-3">
                        {/* Basic Information */}
                        <div className="space-y-2">
                            <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Basic Information</h3>

                            <div>
                                <label className="block text-micro text-gray-200 mb-1">
                                    Portfolio Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    placeholder="Enter portfolio name"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-200 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200 resize-none"
                                    placeholder="Enter portfolio description"
                                />
                            </div>

                            <div>
                                <label className="block text-micro text-gray-200 mb-1">
                                    Initial Investment <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-micro">R</span>
                                    <input
                                        type="number"
                                        name="initialInvestment"
                                        value={formData.initialInvestment}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-6 pr-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status and Risk */}
                        <div className="space-y-2">
                            <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Status & Risk</h3>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-micro text-gray-200 mb-1">
                                        Status <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Suspended">Suspended</option>
                                        <option value="Closed">Closed</option>
                                        <option value="UnderReview">Under Review</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-micro text-gray-200 mb-1">
                                        Risk Level <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="riskLevel"
                                        value={formData.riskLevel}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="VeryHigh">Very High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Risk Management */}
                        <div className="space-y-2">
                            <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Risk Management</h3>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-micro text-gray-200 mb-1">Max Loss %</label>
                                    <input
                                        type="number"
                                        name="maxLossPercentage"
                                        value={formData.maxLossPercentage}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-micro text-gray-200 mb-1">Max DD %</label>
                                    <input
                                        type="number"
                                        name="maxDrawdownPercentage"
                                        value={formData.maxDrawdownPercentage}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-micro text-gray-200 mb-1">Daily Loss %</label>
                                    <input
                                        type="number"
                                        name="dailyLossLimit"
                                        value={formData.dailyLossLimit}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700/50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-white rounded-md transition-colors duration-200 text-micro"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-[#2F6BFF] hover:bg-[#2557c9] text-white rounded-md transition-colors duration-200 text-micro"
                            >
                                {portfolio ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PortfolioModal;
