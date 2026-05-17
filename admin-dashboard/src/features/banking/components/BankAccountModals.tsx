import { Building2, CreditCard, DollarSign, Lock, Settings, Shield, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { EnhancedModal, ModalActions, ModalButton, ModalSectionCard } from '../../../components/ui/EnhancedModal';
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

    return (
        <EnhancedModal isOpen={isOpen} onClose={onClose} title="Link Bank Account">
            <form onSubmit={handleSubmit} className="space-y-2">
                {/* Account Information */}
                <ModalSectionCard title="Account Information" icon={<Building2 className="w-4 h-4" />} colorScheme="blue">
                    <div className="space-y-1">
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                Account Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="accountName"
                                value={formData.accountName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                placeholder="e.g., Primary Checking"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                Bank Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                placeholder="e.g., Chase Bank"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Account Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                    placeholder="Account number"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Routing Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="routingNumber"
                                    value={formData.routingNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                    placeholder="Routing number"
                                />
                            </div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Account Type & Settings */}
                <ModalSectionCard title="Account Settings" icon={<Settings className="w-4 h-4" />} colorScheme="orange">
                    <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-1.5">
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Account Type <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="accountType"
                                    value={formData.accountType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option value="checking">Checking</option>
                                    <option value="savings">Savings</option>
                                    <option value="business">Business</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Currency</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full px-3 py-1.5 bg-[#0B0633] border border-[#2F6BFF]/30 rounded-lg text-xs text-white focus:outline-none focus:border-[#2F6BFF] focus:ring-1 focus:ring-[#2F6BFF]/50 transition-all"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                                className="w-4 h-4 rounded bg-[#16124A] border-[#2F6BFF]/30 text-[#2F6BFF] focus:ring-[#2F6BFF] focus:ring-offset-0"
                            />
                            <label className="text-xs text-gray-300">Set as default account</label>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Security Notice */}
                <ModalSectionCard title="Security Notice" icon={<Shield className="w-4 h-4" />} colorScheme="purple">
                    <p className="text-xs text-gray-300 leading-relaxed">
                        Your bank account information is encrypted and securely stored. We use bank-level security to protect your data.
                    </p>
                </ModalSectionCard>

                {/* Actions */}
                <ModalActions>
                    <ModalButton type="button" onClick={onClose} variant="secondary">
                        Cancel
                    </ModalButton>
                    <ModalButton type="submit" variant="primary">
                        Link Account
                    </ModalButton>
                </ModalActions>
            </form>
        </EnhancedModal>
    );
}

export function ViewAccountModal({ isOpen, account, onClose }: ViewAccountModalProps) {
    return (
        <EnhancedModal isOpen={isOpen} onClose={onClose} title="Bank Account Details">
            <div className="space-y-2">
                {/* Account Info */}
                <ModalSectionCard title="Account Information" icon={<Building2 className="w-4 h-4" />} colorScheme="blue">
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Account Name</div>
                            <div className="text-xs font-semibold text-white">{account?.accountName}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Bank Name</div>
                            <div className="text-xs font-semibold text-white">{account?.bankName}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Account Number</div>
                            <div className="text-xs font-semibold text-white">{account?.accountNumber}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Account Type</div>
                            <div className="text-xs font-semibold text-white capitalize">{account?.accountType}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Status</div>
                            <div className="text-xs font-semibold text-white capitalize">{account?.status}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Currency</div>
                            <div className="text-xs font-semibold text-white">{account?.currency}</div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Balance Info */}
                <ModalSectionCard title="Balance & Transactions" icon={<DollarSign className="w-4 h-4" />} colorScheme="green">
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Current Balance</div>
                            <div className="text-sm font-bold text-white">${account?.balance.toLocaleString()}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Total Deposits</div>
                            <div className="text-sm font-bold text-green-400">${account?.totalDeposits.toLocaleString()}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Total Withdrawals</div>
                            <div className="text-sm font-bold text-[#F59E0B]">${account?.totalWithdrawals.toLocaleString()}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Last Transaction</div>
                            <div className="text-xs font-semibold text-white">{account?.lastTransaction}</div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Account Details */}
                <ModalSectionCard title="Account Details" icon={<CreditCard className="w-4 h-4" />} colorScheme="purple">
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Added On</div>
                            <div className="text-xs font-semibold text-white">{account?.createdAt}</div>
                        </div>
                        <div className="p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 rounded-lg">
                            <div className="text-[10px] text-gray-400 mb-0.5">Default Account</div>
                            <div className="text-xs font-semibold text-white">{account?.isDefault ? 'Yes' : 'No'}</div>
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
    const handleAction = (action: string) => {
        toast.success(`Bank account ${action} successfully!`);
        onClose();
    };

    return (
        <EnhancedModal isOpen={isOpen} onClose={onClose} title="Manage Bank Account">
            <div className="space-y-2">
                {/* Account Overview */}
                <ModalSectionCard title="Account Overview" icon={<Building2 className="w-4 h-4" />} colorScheme="blue">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-white mb-0.5">{account?.accountName}</div>
                            <div className="text-xs text-gray-400">
                                {account?.bankName} • {account?.accountNumber}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-white">${account?.balance.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">{account?.currency}</div>
                        </div>
                    </div>
                </ModalSectionCard>

                {/* Actions */}
                <ModalSectionCard title="Account Actions" icon={<Settings className="w-4 h-4" />} colorScheme="orange">
                    <div className="space-y-1.5">
                        <button
                            onClick={() => handleAction('set as default')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-lg transition-all text-left group"
                        >
                            <div className="w-7 h-7 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center group-hover:bg-[#2F6BFF]/30 transition-colors">
                                <Building2 className="w-3.5 h-3.5 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-white">Set as Default</div>
                                <div className="text-[10px] text-gray-400">Make this your primary bank account</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('verified')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-lg transition-all text-left group"
                        >
                            <div className="w-7 h-7 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center group-hover:bg-[#2F6BFF]/30 transition-colors">
                                <Lock className="w-3.5 h-3.5 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-white">Verify Account</div>
                                <div className="text-[10px] text-gray-400">Complete verification process</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleAction('updated')}
                            className="w-full flex items-center gap-2 p-2 bg-[#0B0633]/50 border border-[#2F6BFF]/20 hover:border-[#2F6BFF] rounded-lg transition-all text-left group"
                        >
                            <div className="w-7 h-7 bg-[#2F6BFF]/20 rounded-lg flex items-center justify-center group-hover:bg-[#2F6BFF]/30 transition-colors">
                                <Settings className="w-3.5 h-3.5 text-[#2F6BFF]" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-white">Update Details</div>
                                <div className="text-[10px] text-gray-400">Change account information</div>
                            </div>
                        </button>
                    </div>
                </ModalSectionCard>

                {/* Danger Zone */}
                <ModalSectionCard title="Danger Zone" icon={<Trash2 className="w-4 h-4" />} colorScheme="red">
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to unlink this bank account? This action cannot be undone.')) {
                                handleAction('unlinked');
                            }
                        }}
                        className="w-full flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 hover:border-red-500 rounded-lg transition-all text-left group"
                    >
                        <div className="w-7 h-7 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-red-400">Unlink Account</div>
                            <div className="text-[10px] text-gray-400">Remove this bank account</div>
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


