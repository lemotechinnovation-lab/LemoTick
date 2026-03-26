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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                    <h2 className="text-small-dashboard text-[#efdede] font-bold">Add Trading Account</h2>
                    <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110">
                        <X size={16} className="text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-3 space-y-3">
                    {/* Account Type */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Account Type</h3>
                        <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                        >
                            <option value="demo">Demo Account</option>
                            <option value="live">Live Account</option>
                        </select>
                        {formData.accountType === 'live' && (
                            <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                                <AlertCircle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] text-red-400 leading-relaxed">
                                    Live account will use real money. Make sure you understand the risks involved.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* API Credentials */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">API Credentials</h3>
                        <div>
                            <label className="block text-micro text-gray-200 mb-1">
                                API Token <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                name="apiToken"
                                value={formData.apiToken}
                                onChange={handleChange}
                                required
                                className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                placeholder="Enter your API token"
                            />
                        </div>
                        <div>
                            <label className="block text-micro text-gray-200 mb-1">
                                App ID <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="appId"
                                value={formData.appId}
                                onChange={handleChange}
                                required
                                className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                placeholder="Enter your App ID"
                            />
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Account Settings</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-micro text-gray-200 mb-1">Initial Balance</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-micro">$</span>
                                    <input
                                        type="number"
                                        name="initialBalance"
                                        value={formData.initialBalance}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-6 pr-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-micro text-gray-200 mb-1">Currency</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Risk Management */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Risk Management</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-micro text-gray-200 mb-1">Max Daily Loss</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-micro">$</span>
                                    <input
                                        type="number"
                                        name="maxDailyLoss"
                                        value={formData.maxDailyLoss}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full pl-6 pr-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-micro text-gray-200 mb-1">Max Daily Profit</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-micro">$</span>
                                    <input
                                        type="number"
                                        name="maxDailyProfit"
                                        value={formData.maxDailyProfit}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full pl-6 pr-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-micro text-gray-200 mb-1">Risk Level</label>
                                <select
                                    name="riskLevel"
                                    value={formData.riskLevel}
                                    onChange={handleChange}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                    <div className="flex items-center gap-2">
                        <Eye size={16} className="text-[#2F6BFF]" />
                        <h2 className="text-small-dashboard text-[#efdede] font-bold">Account Details</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110">
                        <X size={16} className="text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-3">
                    {/* Account Info */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Account Information</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Account ID</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.accountId}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Account Type</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.accountType.toUpperCase()}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Status</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.status.toUpperCase()}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Currency</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.currency}</div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Balance & Performance</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Current Balance</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">${account.balance.toLocaleString()}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Net Profit</div>
                                <div className={`text-micro font-semibold ${account.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${account.netProfit.toFixed(2)}
                                </div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Total Profit</div>
                                <div className="text-micro text-green-400 font-semibold">${account.totalProfit.toFixed(2)}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Total Loss</div>
                                <div className="text-micro text-red-400 font-semibold">${account.totalLoss.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Trading Stats */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Trading Statistics</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Total Trades</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.totalTrades}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Win Rate</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.winRate}%</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Open Positions</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.openPositions}</div>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Activity</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Created</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.createdAt}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Last Activity</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.lastActivity}</div>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex items-center justify-end pt-2 border-t border-gray-700/50">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 bg-[#2F6BFF] hover:bg-[#2557c9] text-white rounded-md transition-colors duration-200 text-micro"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                    <div className="flex items-center gap-2">
                        <Settings size={16} className="text-[#2F6BFF]" />
                        <h2 className="text-small-dashboard text-[#efdede] font-bold">Manage Account</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110">
                        <X size={16} className="text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-3">
                    {/* Account Info */}
                    <div className="p-3 bg-[#0B0633] border border-gray-700/50 rounded-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.accountId}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                    {account.accountType.toUpperCase()} • {account.status.toUpperCase()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-small-dashboard text-[#efdede] font-bold">${account.balance.toLocaleString()}</div>
                                <div className="text-[10px] text-gray-400">{account.currency}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Account Actions</h3>

                        <button
                            onClick={() => handleAction(account.status === 'active' ? 'paused' : 'activated')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633] border border-gray-700/50 hover:border-[#2F6BFF]/50 rounded-md transition-all text-left"
                        >
                            {account.status === 'active' ? (
                                <>
                                    <Pause size={14} className="text-yellow-400" />
                                    <div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Pause Account</div>
                                        <div className="text-[10px] text-gray-400">Temporarily suspend trading</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Play size={14} className="text-green-400" />
                                    <div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Activate Account</div>
                                        <div className="text-[10px] text-gray-400">Resume trading activities</div>
                                    </div>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => handleAction('credentials updated')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633] border border-gray-700/50 hover:border-[#2F6BFF]/50 rounded-md transition-all text-left"
                        >
                            <Lock size={14} className="text-[#2F6BFF]" />
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Update Credentials</div>
                                <div className="text-[10px] text-gray-400">Change API token and App ID</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('settings updated')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633] border border-gray-700/50 hover:border-[#2F6BFF]/50 rounded-md transition-all text-left"
                        >
                            <Settings size={14} className="text-[#2F6BFF]" />
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Risk Settings</div>
                                <div className="text-[10px] text-gray-400">Adjust risk management parameters</div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
                                    handleAction('deleted');
                                }
                            }}
                            className="w-full flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 hover:border-red-500/50 rounded-md transition-all text-left"
                        >
                            <Trash2 size={14} className="text-red-400" />
                            <div>
                                <div className="text-micro text-red-400 font-semibold">Delete Account</div>
                                <div className="text-[10px] text-gray-400">Permanently remove this account</div>
                            </div>
                        </button>
                    </div>

                    {/* Close Button */}
                    <div className="flex items-center justify-end pt-2 border-t border-gray-700/50">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-white rounded-md transition-colors duration-200 text-micro"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
