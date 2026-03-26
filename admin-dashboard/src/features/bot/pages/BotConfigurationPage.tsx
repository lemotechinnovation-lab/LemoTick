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
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F6BFF] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading configuration...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                <p className="text-red-400">Error loading configuration: {(error as Error).message}</p>
            </div>
        )
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header with gradient background */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="sm:flex sm:justify-between sm:items-center">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                                <Settings size={16} className="text-[#2F6BFF]" />
                            </div>
                            <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Bot Configuration</h1>
                        </div>
                        <p className="text-micro text-gray-300 ml-8">Manage your trading bot settings</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    disabled={updateMutation.isPending}
                                    className="px-3 py-1.5 rounded-lg border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] disabled:opacity-50 transition-all duration-300 text-micro"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white disabled:opacity-50 transition-all duration-300 shadow-brand hover-lift text-micro"
                                >
                                    <Save size={14} />
                                    <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleReset}
                                    disabled={resetMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2F6BFF]/30 bg-[#16124A] text-gray-300 hover:bg-[#1E1854] disabled:opacity-50 transition-all duration-300 text-micro"
                                >
                                    <RotateCcw size={14} />
                                    <span>{resetMutation.isPending ? 'Resetting...' : 'Reset to Backup'}</span>
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white transition-all duration-300 shadow-brand hover-lift text-micro"
                                >
                                    <Settings size={14} />
                                    <span>Edit Configuration</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="mb-3 rounded-lg border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 p-3">
                <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-small-dashboard font-semibold text-yellow-400">Important</h3>
                        <p className="text-micro text-gray-300 mt-0.5 leading-relaxed">
                            Configuration changes require a bot restart to take effect. Make sure to stop the bot before making changes,
                            and restart it after saving. Invalid configuration may prevent the bot from starting.
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuration Editor */}
            <div className="mb-3 rounded-lg border border-[#2F6BFF]/30 bg-gradient-to-br from-[#0B0633] to-[#16124A] shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
                    <h2 className="text-small-dashboard font-semibold text-[#efdede]">settings.yaml</h2>
                    <span className={`text-[10px] font-medium ${isEditing ? 'text-[#FFA62B]' : 'text-gray-400'}`}>
                        {isEditing ? '● EDITING MODE' : 'VIEW MODE'}
                    </span>
                </div>

                <div className="p-3">
                    {isEditing ? (
                        <textarea
                            value={editedConfig}
                            onChange={(e) => setEditedConfig(e.target.value)}
                            className="w-full h-[450px] rounded-lg border border-[#2F6BFF]/30 bg-[#0B0633] p-3 font-mono text-[11px] text-gray-300 focus:border-[#2F6BFF] focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50 transition-all"
                            spellCheck={false}
                            placeholder="Loading configuration..."
                        />
                    ) : (
                        <pre className="w-full h-[450px] overflow-auto rounded-lg bg-[#0B0633] border border-[#2F6BFF]/20 p-3 font-mono text-[11px] text-gray-300">
                            {data?.yaml || 'No configuration available'}
                        </pre>
                    )}
                </div>
            </div>

            {/* Configuration Guide */}
            <div className="rounded-lg border border-[#2F6BFF]/30 bg-gradient-to-br from-[#0B0633] to-[#16124A] shadow-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
                    <h3 className="text-small-dashboard font-semibold text-[#efdede]">Configuration Guide</h3>
                </div>
                <div className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#2F6BFF] mt-1.5 flex-shrink-0"></div>
                        <p className="text-micro text-gray-300"><span className="text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Trading Settings:</span> Configure symbol, contract duration, stake amounts, and risk management</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#2F6BFF] mt-1.5 flex-shrink-0"></div>
                        <p className="text-micro text-gray-300"><span className="text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Strategy Configuration:</span> Enable/disable strategies and adjust confidence thresholds</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#2F6BFF] mt-1.5 flex-shrink-0"></div>
                        <p className="text-micro text-gray-300"><span className="text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Risk Management:</span> Set daily limits, stop losses, and position sizing rules</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#2F6BFF] mt-1.5 flex-shrink-0"></div>
                        <p className="text-micro text-gray-300"><span className="text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Technical Indicators:</span> Customize EMA, RSI, MACD, and other indicator parameters</p>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#2F6BFF] mt-1.5 flex-shrink-0"></div>
                        <p className="text-micro text-gray-300"><span className="text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Account Mode:</span> Toggle between demo and live trading (requires explicit confirmation)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
