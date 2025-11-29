import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDateTime } from '@utils/format'
import { Building2, Check, CreditCard, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { bankAccountService, type CreateBankAccountRequest } from '../services/bankAccountService'

export default function BankAccountsPage() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [showAddForm, setShowAddForm] = useState(false)

    // Fetch bank accounts
    const { data: accounts, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.BANK_ACCOUNTS, user?.id],
        queryFn: () => bankAccountService.getInvestorBankAccounts(user!.id),
        enabled: !!user?.id,
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (accountId: string) => bankAccountService.deleteBankAccount(accountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS })
            toast.success('Bank account deleted successfully')
        },
        onError: () => {
            toast.error('Failed to delete bank account')
        },
    })

    // Set default mutation
    const setDefaultMutation = useMutation({
        mutationFn: (accountId: string) => bankAccountService.setAsDefault(accountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS })
            toast.success('Default bank account updated')
        },
        onError: () => {
            toast.error('Failed to set default account')
        },
    })

    // Add account mutation
    const addAccountMutation = useMutation({
        mutationFn: (data: CreateBankAccountRequest) => bankAccountService.createBankAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS })
            toast.success('Bank account added successfully')
            setShowAddForm(false)
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { error?: string } } }
            toast.error(apiError?.response?.data?.error || 'Failed to add bank account')
        },
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bank accounts...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading bank accounts</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
                    <p className="text-gray-600">Manage your bank accounts for deposits and withdrawals</p>
                </div>
                <button
                    className="btn-primary flex items-center space-x-2"
                    onClick={() => setShowAddForm(true)}
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Bank Account</span>
                </button>
            </div>

            {accounts && accounts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {accounts.map((account) => (
                        <div key={account.id} className="card relative">
                            {account.isDefault && (
                                <div className="absolute top-4 right-4">
                                    <span className="inline-flex items-center space-x-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                        <Check className="h-3 w-3" />
                                        <span>Default</span>
                                    </span>
                                </div>
                            )}

                            <div className="flex items-start space-x-4">
                                <div className="rounded-full bg-primary-100 p-3">
                                    <Building2 className="h-6 w-6 text-primary-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{account.bankName}</h3>
                                    <p className="text-sm text-gray-600">{account.accountHolderName}</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Account Number</span>
                                    <span className="font-medium text-gray-900">
                                        ****{account.accountNumber.slice(-4)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Branch Code</span>
                                    <span className="font-medium text-gray-900">{account.branchCode}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Account Type</span>
                                    <span className="font-medium text-gray-900">{account.accountType}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${account.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {account.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex space-x-2">
                                {!account.isDefault && (
                                    <button
                                        className="btn-secondary flex-1"
                                        onClick={() => setDefaultMutation.mutate(account.id)}
                                        disabled={setDefaultMutation.isPending}
                                    >
                                        Set as Default
                                    </button>
                                )}
                                <button
                                    className="btn-secondary text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this bank account?')) {
                                            deleteMutation.mutate(account.id)
                                        }
                                    }}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="mt-3 text-xs text-gray-500">
                                Added {formatDateTime(account.createdAt)}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card flex flex-col items-center justify-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No bank accounts yet</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Add a bank account to receive withdrawals and make deposits
                    </p>
                    <button
                        className="btn-primary mt-6 flex items-center space-x-2"
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Your First Bank Account</span>
                    </button>
                </div>
            )}

            {/* Add Form Modal */}
            {showAddForm && (
                <AddBankAccountModal
                    onClose={() => setShowAddForm(false)}
                    onSubmit={(data) => addAccountMutation.mutate(data)}
                    isSubmitting={addAccountMutation.isPending}
                    investorId={user!.id}
                />
            )}
        </div>
    )
}

// Add Bank Account Modal Component
interface AddBankAccountModalProps {
    onClose: () => void
    onSubmit: (data: CreateBankAccountRequest) => void
    isSubmitting: boolean
    investorId: string
}

function AddBankAccountModal({ onClose, onSubmit, isSubmitting, investorId }: AddBankAccountModalProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateBankAccountRequest>({
        defaultValues: {
            investorId,
            accountType: 'Savings' as const,
        }
    })

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Add Bank Account</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="accountHolderName" className="label">
                            Account Holder Name
                        </label>
                        <input
                            id="accountHolderName"
                            {...register('accountHolderName', { required: 'Account holder name is required' })}
                            className="input"
                            placeholder="John Doe"
                        />
                        {errors.accountHolderName && (
                            <p className="mt-1 text-sm text-red-600">{errors.accountHolderName.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="bankName" className="label">
                            Bank Name
                        </label>
                        <input
                            id="bankName"
                            {...register('bankName', { required: 'Bank name is required' })}
                            className="input"
                            placeholder="First National Bank"
                        />
                        {errors.bankName && (
                            <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="accountNumber" className="label">
                                Account Number
                            </label>
                            <input
                                id="accountNumber"
                                {...register('accountNumber', { required: 'Account number is required' })}
                                className="input"
                                placeholder="1234567890"
                            />
                            {errors.accountNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="branchCode" className="label">
                                Branch Code
                            </label>
                            <input
                                id="branchCode"
                                {...register('branchCode', { required: 'Branch code is required' })}
                                className="input"
                                placeholder="250655"
                            />
                            {errors.branchCode && (
                                <p className="mt-1 text-sm text-red-600">{errors.branchCode.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="accountType" className="label">
                            Account Type
                        </label>
                        <select
                            id="accountType"
                            {...register('accountType', { required: 'Account type is required' })}
                            className="input"
                        >
                            <option value="Savings">Savings</option>
                            <option value="Checking">Checking</option>
                            <option value="Business">Business</option>
                        </select>
                        {errors.accountType && (
                            <p className="mt-1 text-sm text-red-600">{errors.accountType.message}</p>
                        )}
                    </div>

                    <div className="flex items-start">
                        <input
                            id="isDefault"
                            type="checkbox"
                            {...register('isDefault')}
                            className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-600">
                            Set as default account for withdrawals
                        </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

