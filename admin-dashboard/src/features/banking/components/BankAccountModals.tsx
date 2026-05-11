import { Building2, Eye, Lock, Settings, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { BankAccount } from '../pages/BankAccountsPage';

interface LinkAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ViewAccountModalProps {
    isOpen: boolean;
    account: BankAccount | null;
    onClose: () => void;
}

interface ManageAccountModalProps {
    isOpen: boolean;
    account: BankAccount | null;
    onClose: () => void;
}

export function LinkAccountModal({ isOpen, onClose }: LinkAccountModalProps) {
    const [formData, setFormData] = useState({
        accountName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking' as 'checking' | 'savings' | 'business',
        currency: 'USD',
        isDefault: false,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        toast.success('Bank account linked successfully!');
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2F6BFF]/20 to-[#FFA62B]/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-[#2F6BFF]" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Link Bank Account</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-red-500/20 rounded-lg transition-all duration-200">
                        <X className="w-5 h-5 text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Account Information */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Account Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Account Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="accountName"
                                value={formData.accountName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                placeholder="e.g., Primary Checking"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Bank Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                placeholder="e.g., Chase Bank"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Account Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    placeholder="Account number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Routing Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="routingNumber"
                                    value={formData.routingNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                    placeholder="Routing number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Type & Settings */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Account Type & Settings</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Account Type <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="accountType"
                                    value={formData.accountType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option value="checking">Checking</option>
                                    <option value="savings">Savings</option>
                                    <option value="business">Business</option>
                                </select>
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

                        <div className="flex items-center gap-3 p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                                className="w-5 h-5 rounded bg-[#16124A] border-[#2F6BFF]/30 text-[#2F6BFF] focus:ring-[#2F6BFF] focus:ring-offset-0"
                            />
                            <label className="text-sm text-gray-300">Set as default account</label>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#2F6BFF]/10 border border-[#2F6BFF]/30">
                        <div className="w-8 h-8 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4 text-[#2F6BFF]" />
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Your bank account information is encrypted and securely stored. We use bank-level security to protect your data.
                        </p>
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
                            Link Account
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
                        <h2 className="text-xl font-semibold text-white">Bank Account Details</h2>
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
                                <div className="text-xs text-gray-400 mb-1">Account Name</div>
                                <div className="text-sm font-semibold text-white">{account.accountName}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Bank Name</div>
                                <div className="text-sm font-semibold text-white">{account.bankName}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Account Number</div>
                                <div className="text-sm font-semibold text-white">{account.accountNumber}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Account Type</div>
                                <div className="text-sm font-semibold text-white capitalize">{account.accountType}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Status</div>
                                <div className="text-sm font-semibold text-white capitalize">{account.status}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Currency</div>
                                <div className="text-sm font-semibold text-white">{account.currency}</div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Balance & Transactions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Current Balance</div>
                                <div className="text-lg font-bold text-white">${account.balance.toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Total Deposits</div>
                                <div className="text-lg font-bold text-green-400">${account.totalDeposits.toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Total Withdrawals</div>
                                <div className="text-lg font-bold text-[#F59E0B]">${account.totalWithdrawals.toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Last Transaction</div>
                                <div className="text-sm font-semibold text-white">{account.lastTransaction}</div>
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Account Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Added On</div>
                                <div className="text-sm font-semibold text-white">{account.createdAt}</div>
                            </div>
                            <div className="p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-xl">
                                <div className="text-xs text-gray-400 mb-1">Default Account</div>
                                <div className="text-sm font-semibold text-white">{account.isDefault ? 'Yes' : 'No'}</div>
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
        toast.success(`Bank account ${action} successfully!`);
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
                        <h2 className="text-xl font-semibold text-white">Manage Bank Account</h2>
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
                                <div className="text-lg font-semibold text-white mb-1">{account.accountName}</div>
                                <div className="text-sm text-gray-400">
                                    {account.bankName} • {account.accountNumber}
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
                            onClick={() => handleAction('set as default')}
                            className="w-full flex items-center gap-4 p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-xl transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Set as Default</div>
                                <div className="text-xs text-gray-400">Make this your primary bank account</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('verified')}
                            className="w-full flex items-center gap-4 p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-xl transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Verify Account</div>
                                <div className="text-xs text-gray-400">Complete verification process</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('updated')}
                            className="w-full flex items-center gap-4 p-4 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-xl transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Update Details</div>
                                <div className="text-xs text-gray-400">Change account information</div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to unlink this bank account? This action cannot be undone.')) {
                                    handleAction('unlinked');
                                }
                            }}
                            className="w-full flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 hover:border-red-500 rounded-xl transition-all text-left"
                        >
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-red-400">Unlink Account</div>
                                <div className="text-xs text-gray-400">Remove this bank account</div>
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
