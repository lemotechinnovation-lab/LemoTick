import {
    EnhancedModal,
    ModalActions,
    ModalButton,
    ModalSectionCard,
} from '@/components/ui/EnhancedModal';
import { AlertCircle, Eye, Lock, Pause, Play, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Account added successfully!');
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <EnhancedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Trading Account"
            maxWidth="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-2">
                {/* Account Type */}
                <ModalSectionCard
                    title="ACCOUNT TYPE"
                    colorScheme="blue"
                    icon={<Settings className="w-4 h-4" />}
                >
                    <div className="space-y-1">
                        <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-gradient-to-br from-[#2F6BFF]/15 to-purple-500/10 hover:from-[#2F6BFF]/25 hover:to-purple-500/20 border-2 border-[#2F6BFF]/40 hover:border-[#2F6BFF]/70 rounded-lg text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/30 transition-all duration-300 text-sm cursor-pointer smooth-hover font-medium"
                        >
                            <option value="demo">Demo Account</option>
                            <option value="live">Live Account</option>
                        </select>
                        {formData.accountType === 'live' && (
                            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 mt-1">
                                <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                </div>
                                <p className="text-xs text-red-400 leading-relaxed">
                                    Live account will use real money. Make sure you understand the risks involved.
                                </p>
                            </div>
                        )}
                    </div>
                </ModalSectionCard>

                {/* API Credentials */}
                <ModalSectionCard
                    title="API CREDENTIALS"
                    colorScheme="purple"
                    icon={<Lock className="w-4 h-4" />}
                >
                    <div className="space-y-1">
                        <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">
                            API Token <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="password"
                            name="apiToken"
                            value={formData.apiToken}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 bg-gradient-to-br from-purple-500/15 to-violet-500/10 hover:from-purple-500/25 hover:to-violet-500/20 border-2 border-purple-500/40 hover:border-purple-500/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 text-sm smooth-hover font-medium"
                            placeholder="Enter your API token"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">
                            App ID <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="appId"
                            value={formData.appId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-1.5 bg-gradient-to-br from-purple-500/15 to-violet-500/10 hover:from-purple-500/25 hover:to-violet-500/20 border-2 border-purple-500/40 hover:border-purple-500/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 text-sm smooth-hover font-medium"
                            placeholder="Enter your App ID"
                        />
                    </div>
                </ModalSectionCard>

                {/* Account Settings */}
                <ModalSectionCard
                    title="ACCOUNT SETTINGS"
                    colorScheme="orange"
                    icon={<Settings className="w-4 h-4" />}
                >
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="space-y-1">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Initial Balance</label>
                            <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#FFA62B] font-bold text-sm">$</span>
                                <input
                                    type="number"
                                    name="initialBalance"
                                    value={formData.initialBalance}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-7 pr-2.5 py-1.5 bg-gradient-to-br from-[#FFA62B]/15 to-yellow-500/10 hover:from-[#FFA62B]/25 hover:to-yellow-500/20 border-2 border-[#FFA62B]/40 hover:border-[#FFA62B]/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#FFA62B] focus:ring-2 focus:ring-[#FFA62B]/30 transition-all duration-300 text-sm smooth-hover font-medium"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full px-2.5 py-1.5 bg-gradient-to-br from-[#FFA62B]/15 to-yellow-500/10 hover:from-[#FFA62B]/25 hover:to-yellow-500/20 border-2 border-[#FFA62B]/40 hover:border-[#FFA62B]/70 rounded-lg text-white focus:outline-none focus:border-[#FFA62B] focus:ring-2 focus:ring-[#FFA62B]/30 transition-all duration-300 text-sm cursor-pointer smooth-hover font-medium"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Risk Management */}
                <ModalSectionCard
                    title="RISK MANAGEMENT"
                    colorScheme="red"
                    icon={<AlertCircle className="w-4 h-4" />}
                >
                    <div className="grid grid-cols-3 gap-1.5">
                        <div className="space-y-1">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Max Daily Loss</label>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-400 font-bold text-xs">$</span>
                                <input
                                    type="number"
                                    name="maxDailyLoss"
                                    value={formData.maxDailyLoss}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full pl-6 pr-2 py-1.5 bg-gradient-to-br from-red-500/15 to-orange-500/10 hover:from-red-500/25 hover:to-orange-500/20 border-2 border-red-500/40 hover:border-red-500/70 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300 text-sm smooth-hover font-medium"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Max Daily Profit</label>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-400 font-bold text-xs">$</span>
                                <input
                                    type="number"
                                    name="maxDailyProfit"
                                    value={formData.maxDailyProfit}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full pl-6 pr-2 py-1.5 bg-gradient-to-br from-red-500/15 to-orange-500/10 hover:from-red-500/25 hover:to-orange-500/20 border-2 border-red-500/40 hover:border-red-500/70 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300 text-sm smooth-hover font-medium"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs text-gray-300 font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">Risk Level</label>
                            <select
                                name="riskLevel"
                                value={formData.riskLevel}
                                onChange={handleChange}
                                className="w-full px-2 py-1.5 bg-gradient-to-br from-red-500/15 to-orange-500/10 hover:from-red-500/25 hover:to-orange-500/20 border-2 border-red-500/40 hover:border-red-500/70 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all duration-300 text-sm cursor-pointer smooth-hover font-medium"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="VeryHigh">Very High</option>
                            </select>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Actions */}
                <ModalActions>
                    <ModalButton type="button" onClick={onClose} variant="secondary">
                        Cancel
                    </ModalButton>
                    <ModalButton type="submit" variant="primary">
                        Add Account
                    </ModalButton>
                </ModalActions>
            </form>
        </EnhancedModal>
    );
}

export function ViewAccountModal({ isOpen, account, onClose }: ViewAccountModalProps) {
    if (!account) return null;

    return (
        <EnhancedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Account Details"
            maxWidth="xl"
        >
            <div className="space-y-3">
                {/* Account Info */}
                <ModalSectionCard
                    title="ACCOUNT INFORMATION"
                    colorScheme="blue"
                    icon={<Eye className="w-4 h-4" />}
                >
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Account ID</div>
                            <div className="text-sm font-semibold text-white">{account.accountId}</div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Account Type</div>
                            <div className="text-sm font-semibold text-white">{account.accountType.toUpperCase()}</div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Status</div>
                            <div className="text-sm font-semibold text-white">{account.status.toUpperCase()}</div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Currency</div>
                            <div className="text-sm font-semibold text-white">{account.currency}</div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Balance Info */}
                <ModalSectionCard
                    title="BALANCE & PERFORMANCE"
                    colorScheme="green"
                    icon={<Settings className="w-4 h-4" />}
                >
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 bg-[#0B0633]/50 border border-green-500/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Current Balance</div>
                            <div className="text-lg font-bold text-white">${account.balance.toLocaleString()}</div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-green-500/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Net Profit</div>
                            <div className={`text-lg font-bold ${account.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${account.netProfit.toFixed(2)}
                            </div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-green-500/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Total Profit</div>
                            <div className="text-lg font-bold text-green-400">${account.totalProfit.toFixed(2)}</div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-green-500/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Total Loss</div>
                            <div className="text-lg font-bold text-red-400">${account.totalLoss.toFixed(2)}</div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Trading Stats */}
                <ModalSectionCard
                    title="TRADING STATISTICS"
                    colorScheme="orange"
                    icon={<Settings className="w-4 h-4" />}
                >
                    <div className="grid grid-cols-3 gap-1.5">
                        <div className="p-2 bg-[#0B0633]/50 border border-[#FFA62B]/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Total Trades</div>
                            <div className="text-lg font-bold text-white">{account.totalTrades}</div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-[#FFA62B]/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                            <div className="text-lg font-bold text-white">{account.winRate}%</div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-[#FFA62B]/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Open Positions</div>
                            <div className="text-lg font-bold text-white">{account.openPositions}</div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Dates */}
                <ModalSectionCard
                    title="ACTIVITY"
                    colorScheme="purple"
                    icon={<Settings className="w-4 h-4" />}
                >
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 bg-[#0B0633]/50 border border-purple-500/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Created</div>
                            <div className="text-sm font-semibold text-white">{account.createdAt}</div>
                        </div>
                        <div className="p-3 bg-[#0B0633]/50 border border-purple-500/20 rounded-lg">
                            <div className="text-xs text-gray-400 mb-1">Last Activity</div>
                            <div className="text-sm font-semibold text-white">{account.lastActivity}</div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Close Button */}
                <ModalActions>
                    <ModalButton onClick={onClose} variant="primary">
                        Close
                    </ModalButton>
                </ModalActions>
            </div>
        </EnhancedModal>
    );
}

export function ManageAccountModal({ isOpen, account, onClose }: ManageAccountModalProps) {
    if (!account) return null;

    const handleAction = (action: string) => {
        toast.success(`Account ${action} successfully!`);
        onClose();
    };

    return (
        <EnhancedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Manage Account"
            maxWidth="xl"
        >
            <div className="space-y-3">
                {/* Account Info */}
                <ModalSectionCard
                    title="ACCOUNT OVERVIEW"
                    colorScheme="blue"
                    icon={<Settings className="w-4 h-4" />}
                >
                    <div className="flex items-center justify-between p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                        <div>
                            <div className="text-base font-semibold text-white mb-1">{account.accountId}</div>
                            <div className="text-sm text-gray-400">
                                {account.accountType.toUpperCase()} • {account.status.toUpperCase()}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">${account.balance.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">{account.currency}</div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Actions */}
                <ModalSectionCard
                    title="ACCOUNT ACTIONS"
                    colorScheme="orange"
                    icon={<Settings className="w-4 h-4" />}
                >
                    <div className="space-y-1.5">
                        <button
                            onClick={() => handleAction(account.status === 'active' ? 'paused' : 'activated')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633]/50 border border-[#FFA62B]/20 hover:border-[#FFA62B] rounded-lg transition-all text-left smooth-hover"
                        >
                            <div className={`w-6 h-6 ${account.status === 'active' ? 'bg-yellow-500/20' : 'bg-green-500/20'} rounded-lg flex items-center justify-center`}>
                                {account.status === 'active' ? (
                                    <Pause className="w-4 h-4 text-yellow-400" />
                                ) : (
                                    <Play className="w-4 h-4 text-green-400" />
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
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633]/50 border border-[#FFA62B]/20 hover:border-[#FFA62B] rounded-lg transition-all text-left smooth-hover"
                        >
                            <div className="w-6 h-6 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center">
                                <Lock className="w-4 h-4 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Update Credentials</div>
                                <div className="text-xs text-gray-400">Change API token and App ID</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('settings updated')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633]/50 border border-[#FFA62B]/20 hover:border-[#FFA62B] rounded-lg transition-all text-left smooth-hover"
                        >
                            <div className="w-6 h-6 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center">
                                <Settings className="w-4 h-4 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Risk Settings</div>
                                <div className="text-xs text-gray-400">Adjust risk management parameters</div>
                            </div>
                        </button>
                    </div>
                </ModalSectionCard>

                {/* Delete Action */}
                <ModalSectionCard
                    title="DANGER ZONE"
                    colorScheme="red"
                    icon={<AlertCircle className="w-4 h-4" />}
                >
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
                                handleAction('deleted');
                            }
                        }}
                        className="w-full flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 hover:border-red-500 rounded-lg transition-all text-left smooth-hover"
                    >
                        <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-red-400">Delete Account</div>
                            <div className="text-xs text-gray-400">Permanently remove this account</div>
                        </div>
                    </button>
                </ModalSectionCard>

                {/* Close Button */}
                <ModalActions>
                    <ModalButton onClick={onClose} variant="secondary">
                        Close
                    </ModalButton>
                </ModalActions>
            </div>
        </EnhancedModal>
    );
}
