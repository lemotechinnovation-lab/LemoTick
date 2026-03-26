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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                    <h2 className="text-small-dashboard text-[#efdede] font-bold">Link Bank Account</h2>
                    <button onClick={onClose} className="p-1 hover:bg-red-500/20 rounded-md transition-all duration-200 hover:scale-110">
                        <X size={16} className="text-gray-300 hover:text-red-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-3 space-y-3">
                    {/* Account Information */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Account Information</h3>

                        <div>
                            <label className="block text-micro text-gray-200 mb-1">
                                Account Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="accountName"
                                value={formData.accountName}
                                onChange={handleChange}
                                required
                                className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                placeholder="e.g., Primary Checking"
                            />
                        </div>

                        <div>
                            <label className="block text-micro text-gray-200 mb-1">
                                Bank Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                required
                                className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                placeholder="e.g., Chase Bank"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-micro text-gray-200 mb-1">
                                    Account Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    placeholder="Account number"
                                />
                            </div>
                            <div>
                                <label className="block text-micro text-gray-200 mb-1">
                                    Routing Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="routingNumber"
                                    value={formData.routingNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] placeholder-gray-400 focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                    placeholder="Routing number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Type & Settings */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Account Type & Settings</h3>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-micro text-gray-200 mb-1">
                                    Account Type <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="accountType"
                                    value={formData.accountType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-2.5 py-1.5 bg-[#0B0633] border border-gray-700/50 rounded-md text-micro text-[#efdede] focus:outline-none focus:border-[#2F6BFF] transition-colors duration-200"
                                >
                                    <option value="checking">Checking</option>
                                    <option value="savings">Savings</option>
                                    <option value="business">Business</option>
                                </select>
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

                        <div className="flex items-center gap-2 p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                                className="w-4 h-4 rounded bg-[#16124A] border-gray-700 text-[#2F6BFF] focus:ring-[#2F6BFF] focus:ring-offset-0"
                            />
                            <label className="text-micro text-gray-200">Set as default account</label>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-[#2F6BFF]/10 border border-[#2F6BFF]/30">
                        <Lock size={14} className="text-[#2F6BFF] mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-gray-300 leading-relaxed">
                            Your bank account information is encrypted and securely stored. We use bank-level security to protect your data.
                        </p>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                    <div className="flex items-center gap-2">
                        <Eye size={16} className="text-[#2F6BFF]" />
                        <h2 className="text-small-dashboard text-[#efdede] font-bold">Bank Account Details</h2>
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
                                <div className="text-[10px] text-gray-400 mb-0.5">Account Name</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.accountName}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Bank Name</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.bankName}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Account Number</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.accountNumber}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Account Type</div>
                                <div className="text-micro text-[#efdede] font-semibold capitalize">{account.accountType}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Status</div>
                                <div className="text-micro text-[#efdede] font-semibold capitalize">{account.status}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Currency</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.currency}</div>
                            </div>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Balance & Transactions</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Current Balance</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">${account.balance.toLocaleString()}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Total Deposits</div>
                                <div className="text-micro text-green-400 font-semibold">${account.totalDeposits.toLocaleString()}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Total Withdrawals</div>
                                <div className="text-micro text-[#FFA62B] font-semibold">${account.totalWithdrawals.toLocaleString()}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Last Transaction</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.lastTransaction}</div>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <h3 className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Account Details</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Added On</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.createdAt}</div>
                            </div>
                            <div className="p-2 bg-[#0B0633] border border-gray-700/50 rounded-md">
                                <div className="text-[10px] text-gray-400 mb-0.5">Default Account</div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.isDefault ? 'Yes' : 'No'}</div>
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
        toast.success(`Bank account ${action} successfully!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-xl shadow-brand-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn border border-[#2F6BFF]/30">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 via-transparent to-[#FFA62B]/10">
                    <div className="flex items-center gap-2">
                        <Settings size={16} className="text-[#2F6BFF]" />
                        <h2 className="text-small-dashboard text-[#efdede] font-bold">Manage Bank Account</h2>
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
                                <div className="text-small-dashboard text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{account.accountName}</div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                    {account.bankName} • {account.accountNumber}
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
                            onClick={() => handleAction('set as default')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633] border border-gray-700/50 hover:border-[#2F6BFF]/50 rounded-md transition-all text-left"
                        >
                            <Building2 size={14} className="text-[#2F6BFF]" />
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Set as Default</div>
                                <div className="text-[10px] text-gray-400">Make this your primary bank account</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('verified')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633] border border-gray-700/50 hover:border-[#2F6BFF]/50 rounded-md transition-all text-left"
                        >
                            <Lock size={14} className="text-[#2F6BFF]" />
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Verify Account</div>
                                <div className="text-[10px] text-gray-400">Complete verification process</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('updated')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633] border border-gray-700/50 hover:border-[#2F6BFF]/50 rounded-md transition-all text-left"
                        >
                            <Settings size={14} className="text-[#2F6BFF]" />
                            <div>
                                <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Update Details</div>
                                <div className="text-[10px] text-gray-400">Change account information</div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to unlink this bank account? This action cannot be undone.')) {
                                    handleAction('unlinked');
                                }
                            }}
                            className="w-full flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 hover:border-red-500/50 rounded-md transition-all text-left"
                        >
                            <Trash2 size={14} className="text-red-400" />
                            <div>
                                <div className="text-micro text-red-400 font-semibold">Unlink Account</div>
                                <div className="text-[10px] text-gray-400">Remove this bank account</div>
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
