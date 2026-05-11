import { AlertCircle, Eye, Lock, Pause, Play, Settings, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { TradingAccount } from '../pages/AccountsPage';

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ViewAccountModalProps {
    isOpen: boolean;
    account: TradingAccount | null;
    onClose: () => void;
}

interface ManageAccountModalProps {
    isOpen: boolean;
    account: TradingAccount | null;
    onClose: () => void;
}

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
    const [formData, setFormData] = useState({
        accountType: 'demo' as 'demo' | 'live',
        apiToken: '',
        appId: '',
        initialBalance: '10000',
        currency: 'USD',
        maxDailyLoss: '100',
        maxDailyProfit: '500',
        riskLevel: 'Medium' as 'Low' | 'Medium' | 'High' | 'VeryHigh',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        toast.success('Account added successfully!');
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-[#2F6BFF]" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Add Trading Account</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-red-500/20 rounded-lg transition-all duration-200">
                        <X className="w-5 h-5 text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Account Type */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Account Type</h3>
                        <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                        >
                            <option value="demo">Demo Account</option>
                            <option value="live">Live Account</option>
                        </select>
                        {formData.accountType === 'live' && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                </div>
                                <p className="text-sm text-red-400 leading-relaxed">
                                    Live account will use real money. Make sure you understand the risks involved.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* API Credentials */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">API Credentials</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                API Token <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                name="apiToken"
                                value={formData.apiToken}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                placeholder="Enter your API token"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                App ID <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="appId"
                                value={formData.appId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                placeholder="Enter your App ID"
                            />
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Account Settings</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Initial Balance</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        name="initialBalance"
                                        value={formData.initialBalance}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Risk Management */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Risk Management</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Max Daily Loss</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        name="maxDailyLoss"
                                        value={formData.maxDailyLoss}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full pl-8 pr-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Max Daily Profit</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        name="maxDailyProfit"
                                        value={formData.maxDailyProfit}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full pl-8 pr-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                                <select
                                    name="riskLevel"
                                    value={formData.riskLevel}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="VeryHigh">Very High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2F6BFF]/30">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-[#16124A] border border-[#2F6BFF]/30 hover:bg-[#1E1854] hover:border-[#2F6BFF] text-white rounded-xl transition-all duration-300 text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-semibold"
                        >
                            Add Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function ViewAccountModal({ isOpen, account, onClose }: ViewAccountModalProps) {
    if (!isOpen || !account) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-[#2F6BFF]" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Account Details</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-red-500/20 rounded-lg transition-all duration-200">
                        <X className="w-5 h-5 text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Account Info */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Account Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Account ID</div>
                                <div className="text-sm font-semibold text-white">{account.accountId}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Account Type</div>
                                <div className="text-sm font-semibold text-white">{account.accountType.toUpperCase()}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Status</div>
                                <div className="text-sm font-semibold text-white">{account.status.toUpperCase()}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Currency</div>
                                <div className="text-sm font-semibold text-white">{account.currency}</div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Balance & Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Current Balance</div>
                                <div className="text-lg font-bold text-white">${account.balance.toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Net Profit</div>
                                <div className={`text-lg font-bold ${account.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${account.netProfit.toFixed(2)}
                                </div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Total Profit</div>
                                <div className="text-lg font-bold text-green-400">${account.totalProfit.toFixed(2)}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Total Loss</div>
                                <div className="text-lg font-bold text-red-400">${account.totalLoss.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Trading Stats */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Trading Statistics</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Total Trades</div>
                                <div className="text-lg font-bold text-white">{account.totalTrades}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                                <div className="text-lg font-bold text-white">{account.winRate}%</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Open Positions</div>
                                <div className="text-lg font-bold text-white">{account.openPositions}</div>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Activity</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Created</div>
                                <div className="text-sm font-semibold text-white">{account.createdAt}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Last Activity</div>
                                <div className="text-sm font-semibold text-white">{account.lastActivity}</div>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex items-center justify-end pt-4 border-t border-[#2F6BFF]/30">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-[#2F6BFF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2F6BFF] text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ManageAccountModal({ isOpen, account, onClose }: ManageAccountModalProps) {
    if (!isOpen || !account) return null;

    const handleAction = (action: string) => {
        toast.success(`Account ${action} successfully!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-[#2F6BFF]" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Manage Account</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-red-500/20 rounded-lg transition-all duration-200">
                        <X className="w-5 h-5 text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Account Info */}
                    <div className="p-6 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-lg font-semibold text-white mb-1">{account.accountId}</div>
                                <div className="text-sm text-gray-400">
                                    {account.accountType.toUpperCase()} • {account.status.toUpperCase()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">${account.balance.toLocaleString()}</div>
                                <div className="text-sm text-gray-400">{account.currency}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Account Actions</h3>

                        <button
                            onClick={() => handleAction(account.status === 'active' ? 'paused' : 'activated')}
                            className="w-full flex items-center gap-4 p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-xl transition-all text-left"
                        >
                            <div className={`w-10 h-10 ${account.status === 'active' ? 'bg-yellow-500/20' : 'bg-green-500/20'} rounded-lg flex items-center justify-center`}>
                                {account.status === 'active' ? (
                                    <Pause className="w-5 h-5 text-yellow-400" />
                                ) : (
                                    <Play className="w-5 h-5 text-green-400" />
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">
                                    {account.status === 'active' ? 'Pause Account' : 'Activate Account'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {account.status === 'active' ? 'Temporarily suspend trading' : 'Resume trading activities'}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('credentials updated')}
                            className="w-full flex items-center gap-4 p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-xl transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Update Credentials</div>
                                <div className="text-xs text-gray-400">Change API token and App ID</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('settings updated')}
                            className="w-full flex items-center gap-4 p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-xl transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Risk Settings</div>
                                <div className="text-xs text-gray-400">Adjust risk management parameters</div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
                                    handleAction('deleted');
                                }
                            }}
                            className="w-full flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 hover:border-red-500 rounded-xl transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-red-400">Delete Account</div>
                                <div className="text-xs text-gray-400">Permanently remove this account</div>
                            </div>
                        </button>
                    </div>

                    {/* Close Button */}
                    <div className="flex items-center justify-end pt-4 border-t border-[#2F6BFF]/30">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-[#16124A] border border-[#2F6BFF]/30 hover:bg-[#1E1854] hover:border-[#2F6BFF] text-white rounded-xl transition-all duration-300 text-sm font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
