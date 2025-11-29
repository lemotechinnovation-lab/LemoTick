import { QUERY_KEYS } from '@/config/constants'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Activity, BarChart3, DollarSign, Play, RotateCw, Square, TrendingDown, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { botService } from '../services/botService'

export default function BotManagementPage() {
    // Fetch bot status
    const { data: status, isLoading, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.BOT_STATUS,
        queryFn: () => botService.getStatus(),
        refetchInterval: 5000, // Refresh every 5 seconds
    })

    // Start bot mutation
    const startMutation = useMutation({
        mutationFn: () => botService.startBot(),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message)
                refetch()
            } else {
                toast.error(result.message)
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to start bot')
        },
    })

    // Stop bot mutation
    const stopMutation = useMutation({
        mutationFn: () => botService.stopBot(),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message)
                refetch()
            } else {
                toast.error(result.message)
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to stop bot')
        },
    })

    // Restart bot mutation
    const restartMutation = useMutation({
        mutationFn: () => botService.restartBot(),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message)
                refetch()
            } else {
                toast.error(result.message)
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to restart bot')
        },
    })

    const metrics = status?.currentMetrics

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bot status...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4">
                <p className="text-red-600">Error loading bot status: {(error as Error).message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bot Management</h1>
                    <p className="text-gray-600 mt-1">Control and monitor your trading bot</p>
                </div>
            </div>

            {/* Status Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${status?.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {status?.isRunning ? 'Bot is Running' : 'Bot is Stopped'}
                            </h2>
                            {status?.isRunning && status?.processId && (
                                <p className="text-sm text-gray-500">Process ID: {status.processId}</p>
                            )}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex space-x-2">
                        {!status?.isRunning ? (
                            <button
                                onClick={() => startMutation.mutate()}
                                disabled={startMutation.isPending}
                                className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                <Play className="h-4 w-4" />
                                <span>{startMutation.isPending ? 'Starting...' : 'Start Bot'}</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => stopMutation.mutate()}
                                    disabled={stopMutation.isPending}
                                    className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    <Square className="h-4 w-4" />
                                    <span>{stopMutation.isPending ? 'Stopping...' : 'Stop Bot'}</span>
                                </button>
                                <button
                                    onClick={() => restartMutation.mutate()}
                                    disabled={restartMutation.isPending}
                                    className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <RotateCw className="h-4 w-4" />
                                    <span>{restartMutation.isPending ? 'Restarting...' : 'Restart Bot'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {status?.errorMessage && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4">
                        <p className="text-sm text-red-600">{status.errorMessage}</p>
                    </div>
                )}

                {/* Uptime */}
                {status?.uptime && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Uptime: {status.uptime}</p>
                    </div>
                )}
            </div>

            {/* Metrics Grid */}
            {metrics && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Trades */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Trades</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalTrades}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Win Rate */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Win Rate</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {(metrics.winRate * 100).toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {metrics.winningTrades}W / {metrics.losingTrades}L
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <Activity className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Profit */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Profit</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    R {metrics.totalProfit.toFixed(2)}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Total Loss */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Loss</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">
                                    R {metrics.totalLoss.toFixed(2)}
                                </p>
                            </div>
                            <div className="rounded-full bg-red-100 p-3">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    {/* Current Balance */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Current Balance</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    R {metrics.currentBalance.toFixed(2)}
                                </p>
                            </div>
                            <div className="rounded-full bg-yellow-100 p-3">
                                <DollarSign className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    {/* Active Trades */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Trades</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.activeTrades}</p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3">
                                <Activity className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Metrics Message */}
            {!metrics && status?.isRunning && (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <p className="text-center text-gray-600">
                        Bot metrics are not available yet. Metrics will appear once the bot starts trading.
                    </p>
                </div>
            )}
        </div>
    )
}

