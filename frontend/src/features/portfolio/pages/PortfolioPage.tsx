import { QUERY_KEYS } from '@/config/constants'
import { useAuthStore } from '@features/auth/stores/authStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatCurrency, formatPercentage } from '@utils/format'
import { AlertCircle, Briefcase, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { portfolioService, type CreatePortfolioRequest } from '../services/portfolioService'

export default function PortfolioPage() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [showCreateForm, setShowCreateForm] = useState(false)

    // Fetch portfolios from API
    const { data: portfolios, isLoading, error } = useQuery({
        queryKey: [...QUERY_KEYS.PORTFOLIO, user?.id],
        queryFn: () => portfolioService.getInvestorPortfolios(user!.id),
        enabled: !!user?.id,
    })

    // Create portfolio mutation
    const createPortfolioMutation = useMutation({
        mutationFn: (data: CreatePortfolioRequest) => portfolioService.createPortfolio(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO })
            toast.success('Portfolio created successfully!')
            setShowCreateForm(false)
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: { error?: string } } }
            toast.error(apiError?.response?.data?.error || 'Failed to create portfolio')
        },
    })

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading portfolios...</p>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600">Error loading portfolios</p>
                    <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High':
                return 'bg-red-100 text-red-800'
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800'
            case 'Low':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Portfolios</h1>
                    <p className="text-gray-600">Manage your investment portfolios</p>
                </div>
                <button
                    className="btn-primary flex items-center space-x-2"
                    onClick={() => setShowCreateForm(true)}
                >
                    <Plus className="h-4 w-4" />
                    <span>Create Portfolio</span>
                </button>
            </div>

            {portfolios && portfolios.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {portfolios.map((portfolio) => (
                        <div key={portfolio.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-full bg-primary-100 p-3">
                                        <Briefcase className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{portfolio.name}</h3>
                                        <p className="text-sm text-gray-500">{portfolio.description}</p>
                                    </div>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getRiskColor(portfolio.riskLevel)}`}>
                                    {portfolio.riskLevel}
                                </span>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Current Value</span>
                                    <span className="font-bold text-gray-900">
                                        {formatCurrency(portfolio.currentValue)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Initial Investment</span>
                                    <span className="text-gray-900">
                                        {formatCurrency(portfolio.initialInvestment)}
                                    </span>
                                </div>

                                <div className="flex justify-between border-t pt-3">
                                    <span className="text-sm font-medium text-gray-600">Net Profit</span>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">
                                            {formatCurrency(portfolio.netProfit)}
                                        </div>
                                        <div className="text-sm text-green-600">
                                            {formatPercentage(portfolio.profitPercentage)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-2">
                                <button className="btn-primary flex-1">View Details</button>
                                <button className="btn-secondary">Settings</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No portfolios yet</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Create your first portfolio to start investing
                    </p>
                    <button
                        className="btn-primary mt-6 flex items-center space-x-2"
                        onClick={() => setShowCreateForm(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create Your First Portfolio</span>
                    </button>
                </div>
            )}

            {/* Create Portfolio Modal */}
            {showCreateForm && (
                <CreatePortfolioModal
                    onClose={() => setShowCreateForm(false)}
                    onSubmit={(data) => createPortfolioMutation.mutate(data)}
                    isSubmitting={createPortfolioMutation.isPending}
                    investorId={user!.id}
                />
            )}
        </div>
    )
}

// Create Portfolio Modal Component
interface CreatePortfolioModalProps {
    onClose: () => void
    onSubmit: (data: CreatePortfolioRequest) => void
    isSubmitting: boolean
    investorId: string
}

function CreatePortfolioModal({ onClose, onSubmit, isSubmitting, investorId }: CreatePortfolioModalProps) {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<CreatePortfolioRequest>({
        defaultValues: {
            investorId,
            strategyType: 'Balanced',
            riskLevel: 'Medium',
            initialInvestment: 10000,
            maxDrawdown: 20,
            targetReturn: 15,
        }
    })

    const riskLevel = watch('riskLevel')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Create New Portfolio</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="label">
                            Portfolio Name *
                        </label>
                        <input
                            id="name"
                            {...register('name', { required: 'Portfolio name is required' })}
                            className="input"
                            placeholder="e.g., Aggressive Growth, Conservative Income"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="strategyType" className="label">
                                Strategy Type *
                            </label>
                            <select
                                id="strategyType"
                                {...register('strategyType', { required: 'Strategy type is required' })}
                                className="input"
                            >
                                <option value="Aggressive">Aggressive</option>
                                <option value="Balanced">Balanced</option>
                                <option value="Conservative">Conservative</option>
                                <option value="Custom">Custom</option>
                            </select>
                            {errors.strategyType && (
                                <p className="mt-1 text-sm text-red-600">{errors.strategyType.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="riskLevel" className="label">
                                Risk Level *
                            </label>
                            <select
                                id="riskLevel"
                                {...register('riskLevel', { required: 'Risk level is required' })}
                                className="input"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="VeryHigh">Very High</option>
                            </select>
                            {errors.riskLevel && (
                                <p className="mt-1 text-sm text-red-600">{errors.riskLevel.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Risk Level Description */}
                    <div className={`p-3 rounded-lg text-sm ${riskLevel === 'Low' ? 'bg-green-50 text-green-800' :
                        riskLevel === 'Medium' ? 'bg-yellow-50 text-yellow-800' :
                            riskLevel === 'High' ? 'bg-orange-50 text-orange-800' :
                                'bg-red-50 text-red-800'
                        }`}>
                        <p className="font-medium">
                            {riskLevel === 'Low' && '🛡️ Low Risk: Conservative approach with stable returns'}
                            {riskLevel === 'Medium' && '⚖️ Medium Risk: Balanced approach with moderate volatility'}
                            {riskLevel === 'High' && '📈 High Risk: Aggressive approach with higher potential returns'}
                            {riskLevel === 'VeryHigh' && '🚀 Very High Risk: Maximum growth potential with high volatility'}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="initialInvestment" className="label">
                            Initial Investment (R) *
                        </label>
                        <input
                            id="initialInvestment"
                            type="number"
                            step="0.01"
                            min="100"
                            {...register('initialInvestment', {
                                required: 'Initial investment is required',
                                min: { value: 100, message: 'Minimum investment is R100' }
                            })}
                            className="input"
                            placeholder="10000.00"
                        />
                        {errors.initialInvestment && (
                            <p className="mt-1 text-sm text-red-600">{errors.initialInvestment.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Minimum: R100</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="maxDrawdown" className="label">
                                Max Drawdown (%)
                            </label>
                            <input
                                id="maxDrawdown"
                                type="number"
                                step="1"
                                min="5"
                                max="100"
                                {...register('maxDrawdown', {
                                    valueAsNumber: true,
                                    min: { value: 5, message: 'Minimum 5%' },
                                    max: { value: 100, message: 'Maximum 100%' }
                                })}
                                className="input"
                                placeholder="20"
                            />
                            {errors.maxDrawdown && (
                                <p className="mt-1 text-sm text-red-600">{errors.maxDrawdown.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Risk protection threshold</p>
                        </div>

                        <div>
                            <label htmlFor="targetReturn" className="label">
                                Target Return (%)
                            </label>
                            <input
                                id="targetReturn"
                                type="number"
                                step="1"
                                min="0"
                                max="1000"
                                {...register('targetReturn', {
                                    valueAsNumber: true,
                                    min: { value: 0, message: 'Must be positive' }
                                })}
                                className="input"
                                placeholder="15"
                            />
                            {errors.targetReturn && (
                                <p className="mt-1 text-sm text-red-600">{errors.targetReturn.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Annual return target</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Tip:</strong> Start with a balanced portfolio if you're unsure. You can adjust settings later.
                        </p>
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
                            {isSubmitting ? 'Creating...' : 'Create Portfolio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

