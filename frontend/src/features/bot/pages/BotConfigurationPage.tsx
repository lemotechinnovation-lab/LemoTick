import { QUERY_KEYS } from '@/config/constants'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, RotateCcw, Save, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { botConfigService } from '../services/botService'

export default function BotConfigurationPage() {
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [editedConfig, setEditedConfig] = useState<string>('')

    // Fetch configuration
    const { data, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.BOT_CONFIG,
        queryFn: () => botConfigService.getConfigurationRaw(),
    })

    // Update editedConfig when data is loaded
    useEffect(() => {
        if (data?.yaml) {
            setEditedConfig(data.yaml)
        }
    }, [data])

    // Update configuration mutation
    const updateMutation = useMutation({
        mutationFn: (yaml: string) => {
            // For simplicity, we're sending raw YAML as a single-key object
            // The backend will need to parse this
            return botConfigService.updateConfiguration({ yaml })
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message)
                setIsEditing(false)
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOT_CONFIG })
            } else {
                toast.error(result.message)
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update configuration')
        },
    })

    // Reset configuration mutation
    const resetMutation = useMutation({
        mutationFn: () => botConfigService.resetConfiguration(),
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message)
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOT_CONFIG })
                setIsEditing(false)
            } else {
                toast.error(result.message)
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reset configuration')
        },
    })

    const handleSave = () => {
        updateMutation.mutate(editedConfig)
    }

    const handleReset = () => {
        if (confirm('Are you sure you want to reset the configuration to the last backup? This cannot be undone.')) {
            resetMutation.mutate()
        }
    }

    const handleCancel = () => {
        setEditedConfig(data?.yaml || '')
        setIsEditing(false)
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading configuration...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4">
                <p className="text-red-600">Error loading configuration: {(error as Error).message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bot Configuration</h1>
                    <p className="text-gray-600 mt-1">Manage your trading bot settings</p>
                </div>
                <div className="flex space-x-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={updateMutation.isPending}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="flex items-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleReset}
                                disabled={resetMutation.isPending}
                                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RotateCcw className="h-4 w-4" />
                                <span>{resetMutation.isPending ? 'Resetting...' : 'Reset to Backup'}</span>
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                            >
                                <Settings className="h-4 w-4" />
                                <span>Edit Configuration</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Warning Banner */}
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-yellow-900">Important</h3>
                        <p className="text-sm text-yellow-800 mt-1">
                            Configuration changes require a bot restart to take effect. Make sure to stop the bot before making changes,
                            and restart it after saving. Invalid configuration may prevent the bot from starting.
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuration Editor */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">settings.yaml</h2>
                    <span className="text-sm text-gray-500">
                        {isEditing ? 'Editing Mode' : 'View Mode'}
                    </span>
                </div>

                {isEditing ? (
                    <textarea
                        value={editedConfig}
                        onChange={(e) => setEditedConfig(e.target.value)}
                        className="w-full h-[600px] rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        spellCheck={false}
                        placeholder="Loading configuration..."
                    />
                ) : (
                    <pre className="w-full h-[600px] overflow-auto rounded-lg bg-gray-50 p-4 font-mono text-sm">
                        {data?.yaml || 'No configuration available'}
                    </pre>
                )}
            </div>

            {/* Configuration Guide */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Configuration Guide</h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Trading Settings:</strong> Configure symbol, contract duration, stake amounts, and risk management</p>
                    <p><strong>Strategy Configuration:</strong> Enable/disable strategies and adjust confidence thresholds</p>
                    <p><strong>Risk Management:</strong> Set daily limits, stop losses, and position sizing rules</p>
                    <p><strong>Technical Indicators:</strong> Customize EMA, RSI, MACD, and other indicator parameters</p>
                    <p><strong>Account Mode:</strong> Toggle between demo and live trading (requires explicit confirmation)</p>
                </div>
            </div>
        </div>
    )
}

