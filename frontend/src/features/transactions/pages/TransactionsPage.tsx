import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { bankAccountService } from '@features/banking/services/bankAccountService'
import { portfolioService } from '@features/portfolio/services/portfolioService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatCurrency, formatDateTime } from '@utils/format'
import { ArrowDownCircle, ArrowUpCircle, Filter, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { transactionService, type CreateTransactionRequest } from '../services/transactionService'

export default function TransactionsPage() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [showDepositModal, setShowDepositModal] = useState(false)
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)

    // Fetch transactions from API
    const { data: transactions, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.TRANSACTIONS, user?.id],
        queryFn: () => transactionService.getInvestorTransactions(user!.id),
        enabled: !!user?.id,
    })

    // Fetch portfolios for dropdowns
    const { data: portfolios } = useQuery({
        queryKey: [...QUERY_KEYS.PORTFOLIO, user?.id],
        queryFn: () => portfolioService.getInvestorPortfolios(user!.id),
        enabled: !!user?.id,
    })

    // Fetch bank accounts for withdrawal
    const { data: bankAccounts } = useQuery({
        queryKey: [...QUERY_KEYS.BANK_ACCOUNTS, user?.id],
        queryFn: () => bankAccountService.getInvestorBankAccounts(user!.id),
        enabled: !!user?.id && showWithdrawalModal,
    })

    // Create transaction mutation
    const createTransactionMutation = useMutation({
        mutationFn: (data: CreateTransactionRequest) => transactionService.createTransaction(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD })
            const isDeposit = variables.type === 'Deposit'
            toast.success(isDeposit ? 'Deposit initiated successfully!' : 'Withdrawal request submitted!')
            setShowDepositModal(false)
            setShowWithdrawalModal(false)
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { error?: string } } }
            toast.error(apiError?.response?.data?.error || 'Transaction failed')
        },
    })

    // Calculate summary statistics
    const summary = useMemo(() => {
        if (!transactions) return { deposits: 0, withdrawals: 0, netBalance: 0, depositCount: 0, withdrawalCount: 0 }

        let deposits = 0
        let withdrawals = 0
        let depositCount = 0
        let withdrawalCount = 0

        transactions.forEach(t => {
            if (t.type === 'Deposit') {
                deposits += t.amount
                depositCount++
            } else if (t.type === 'Withdrawal') {
                withdrawals += Math.abs(t.amount)
                withdrawalCount++
            }
        })

        return {
            deposits,
            withdrawals,
            netBalance: deposits - withdrawals,
            depositCount,
            withdrawalCount,
        }
    }, [transactions])

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading transactions...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading transactions</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800'
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800'
            case 'Failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeIcon = (type: string) => {
        if (type === 'Withdrawal' || type === 'Fee') {
            return <ArrowUpCircle className="h-5 w-5 text-red-600" />
        }
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-gray-600">View all your transactions and history</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        className="btn-primary bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                        onClick={() => setShowDepositModal(true)}
                    >
                        <ArrowDownCircle className="h-4 w-4" />
                        <span>Make Deposit</span>
                    </button>
                    <button
                        className="btn-primary bg-orange-600 hover:bg-orange-700 flex items-center space-x-2"
                        onClick={() => setShowWithdrawalModal(true)}
                    >
                        <ArrowUpCircle className="h-4 w-4" />
                        <span>Request Withdrawal</span>
                    </button>
                    <button className="btn-secondary flex items-center space-x-2">
                        <Filter className="h-4 w-4" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="mb-6 grid gap-6 sm:grid-cols-3">
                <div className="card bg-green-50">
                    <p className="text-sm font-medium text-green-800">Total Deposits</p>
                    <p className="mt-2 text-2xl font-bold text-green-900">
                        {formatCurrency(summary.deposits)}
                    </p>
                    <p className="mt-1 text-sm text-green-700">{summary.depositCount} transactions</p>
                </div>

                <div className="card bg-red-50">
                    <p className="text-sm font-medium text-red-800">Total Withdrawals</p>
                    <p className="mt-2 text-2xl font-bold text-red-900">
                        {formatCurrency(summary.withdrawals)}
                    </p>
                    <p className="mt-1 text-sm text-red-700">{summary.withdrawalCount} transactions</p>
                </div>

                <div className="card bg-blue-50">
                    <p className="text-sm font-medium text-blue-800">Net Balance</p>
                    <p className="mt-2 text-2xl font-bold text-blue-900">
                        {formatCurrency(summary.netBalance)}
                    </p>
                    <p className="mt-1 text-sm text-blue-700">Current balance</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {transactions && transactions.length > 0 ? (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                {getTypeIcon(transaction.type)}
                                                <span className="text-sm font-medium text-gray-900">
                                                    {transaction.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {transaction.description}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {formatDateTime(transaction.createdAt)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {transaction.amount >= 0 ? '+' : ''}
                                                {formatCurrency(Math.abs(transaction.amount))}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-gray-500">No transactions found</p>
                                        <p className="text-sm text-gray-400 mt-1">Your transaction history will appear here</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <DepositModal
                    onClose={() => setShowDepositModal(false)}
                    onSubmit={(data) => createTransactionMutation.mutate(data)}
                    isSubmitting={createTransactionMutation.isPending}
                    investorId={user!.id}
                    portfolios={portfolios || []}
                />
            )}

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <WithdrawalModal
                    onClose={() => setShowWithdrawalModal(false)}
                    onSubmit={(data) => createTransactionMutation.mutate(data)}
                    isSubmitting={createTransactionMutation.isPending}
                    investorId={user!.id}
                    portfolios={portfolios || []}
                    bankAccounts={bankAccounts || []}
                />
            )}
        </div>
    )
}

// Deposit Modal Component
interface DepositModalProps {
    onClose: () => void
    onSubmit: (data: CreateTransactionRequest) => void
    isSubmitting: boolean
    investorId: string
    portfolios: Array<{ id: string; name: string; currentValue: number }>
}

function DepositModal({ onClose, onSubmit, isSubmitting, investorId, portfolios }: DepositModalProps) {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateTransactionRequest>({
        defaultValues: {
            investorId,
            type: 'Deposit',
            currency: 'ZAR',
            amount: 1000,
        }
    })

    const amount = watch('amount')
    const [showBankDetails, setShowBankDetails] = useState(false)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-green-100 p-2">
                            <ArrowDownCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Make Deposit</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="portfolioId" className="label">
                            Deposit to Portfolio *
                        </label>
                        <select
                            id="portfolioId"
                            {...register('portfolioId', { required: 'Please select a portfolio' })}
                            className="input"
                        >
                            <option value="">Select portfolio...</option>
                            {portfolios.map((portfolio) => (
                                <option key={portfolio.id} value={portfolio.id}>
                                    {portfolio.name} (Current: {formatCurrency(portfolio.currentValue)})
                                </option>
                            ))}
                        </select>
                        {errors.portfolioId && (
                            <p className="mt-1 text-sm text-red-600">{errors.portfolioId.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="amount" className="label">
                            Deposit Amount (R) *
                        </label>
                        <input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="100"
                            {...register('amount', {
                                required: 'Amount is required',
                                min: { value: 100, message: 'Minimum deposit is R100' },
                                valueAsNumber: true
                            })}
                            className="input text-2xl font-bold"
                            placeholder="1000.00"
                        />
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Minimum: R100</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <button
                            type="button"
                            onClick={() => setShowBankDetails(!showBankDetails)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <p className="text-sm font-medium text-blue-900">💳 Bank Transfer Details</p>
                            <span className="text-blue-600 text-xs">
                                {showBankDetails ? '▲ Hide' : '▼ Show'}
                            </span>
                        </button>
                        {showBankDetails && (
                            <div className="text-xs text-blue-800 space-y-1 mt-3 pt-3 border-t border-blue-200">
                                <p><strong>Bank:</strong> First National Bank</p>
                                <p><strong>Account Name:</strong> LemoTick Investment Holdings</p>
                                <p><strong>Account Number:</strong> 62xxxx xxxx xx15</p>
                                <p><strong>Branch Code:</strong> 250655</p>
                                <p><strong>Reference:</strong> Your Investor ID + Name</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="reference" className="label">
                            Reference Number (Optional)
                        </label>
                        <input
                            id="reference"
                            {...register('reference')}
                            className="input"
                            placeholder="e.g., Bank transfer reference"
                        />
                        <p className="mt-1 text-xs text-gray-500">Your payment reference for tracking</p>
                    </div>

                    <div>
                        <label htmlFor="description" className="label">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="description"
                            {...register('description')}
                            className="input"
                            rows={2}
                            placeholder="Add any notes about this deposit..."
                        />
                    </div>

                    {amount && amount >= 100 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">
                                ✅ You're about to deposit <strong>{formatCurrency(amount)}</strong>
                            </p>
                        </div>
                    )}

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
                            className="btn-primary bg-green-600 hover:bg-green-700 flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Deposit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Withdrawal Modal Component
interface WithdrawalModalProps {
    onClose: () => void
    onSubmit: (data: CreateTransactionRequest) => void
    isSubmitting: boolean
    investorId: string
    portfolios: Array<{ id: string; name: string; currentValue: number }>
    bankAccounts: Array<{ id: string; bankName: string; accountNumber: string; isDefault: boolean }>
}

function WithdrawalModal({ onClose, onSubmit, isSubmitting, investorId, portfolios, bankAccounts }: WithdrawalModalProps) {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateTransactionRequest>({
        defaultValues: {
            investorId,
            type: 'Withdrawal',
            currency: 'ZAR',
            amount: 1000,
        }
    })

    const amount = watch('amount')
    const selectedPortfolioId = watch('portfolioId')
    const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId)

    const defaultBankAccount = bankAccounts.find(b => b.isDefault) || bankAccounts[0]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-orange-100 p-2">
                            <ArrowUpCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Request Withdrawal</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="portfolioId" className="label">
                            Withdraw from Portfolio *
                        </label>
                        <select
                            id="portfolioId"
                            {...register('portfolioId', { required: 'Please select a portfolio' })}
                            className="input"
                        >
                            <option value="">Select portfolio...</option>
                            {portfolios.map((portfolio) => (
                                <option key={portfolio.id} value={portfolio.id}>
                                    {portfolio.name} (Available: {formatCurrency(portfolio.currentValue)})
                                </option>
                            ))}
                        </select>
                        {errors.portfolioId && (
                            <p className="mt-1 text-sm text-red-600">{errors.portfolioId.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="amount" className="label">
                            Withdrawal Amount (R) *
                        </label>
                        <input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="100"
                            max={selectedPortfolio?.currentValue || undefined}
                            {...register('amount', {
                                required: 'Amount is required',
                                min: { value: 100, message: 'Minimum withdrawal is R100' },
                                max: selectedPortfolio ? {
                                    value: selectedPortfolio.currentValue,
                                    message: `Maximum available: ${formatCurrency(selectedPortfolio.currentValue)}`
                                } : undefined,
                                valueAsNumber: true
                            })}
                            className="input text-2xl font-bold"
                            placeholder="1000.00"
                        />
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                        )}
                        {selectedPortfolio && (
                            <p className="mt-1 text-xs text-gray-500">
                                Available: {formatCurrency(selectedPortfolio.currentValue)}
                            </p>
                        )}
                    </div>

                    {bankAccounts.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-900 mb-2">💰 Withdrawal Destination</p>
                            <div className="text-xs text-gray-700 space-y-1">
                                <p><strong>Bank:</strong> {defaultBankAccount.bankName}</p>
                                <p><strong>Account:</strong> ****{defaultBankAccount.accountNumber.slice(-4)}</p>
                                {defaultBankAccount.isDefault && (
                                    <p className="text-green-600 font-medium">✓ Default Account</p>
                                )}
                            </div>
                        </div>
                    )}

                    {bankAccounts.length === 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">
                                ⚠️ No bank accounts found. Please add a bank account first.
                            </p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="description" className="label">
                            Reason for Withdrawal (Optional)
                        </label>
                        <textarea
                            id="description"
                            {...register('description')}
                            className="input"
                            rows={3}
                            placeholder="e.g., Personal use, Reinvestment, Emergency..."
                        />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-xs font-medium text-yellow-900 mb-1">⏳ Processing Time</p>
                        <p className="text-xs text-yellow-800">
                            Withdrawals are processed within 1-3 business days. You'll receive a notification once approved.
                        </p>
                    </div>

                    {amount && amount >= 100 && selectedPortfolio && amount <= selectedPortfolio.currentValue && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="text-sm text-orange-800">
                                📤 You're requesting to withdraw <strong>{formatCurrency(amount)}</strong>
                            </p>
                        </div>
                    )}

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
                            className="btn-primary bg-orange-600 hover:bg-orange-700 flex-1"
                            disabled={isSubmitting || bankAccounts.length === 0}
                        >
                            {isSubmitting ? 'Processing...' : 'Request Withdrawal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

