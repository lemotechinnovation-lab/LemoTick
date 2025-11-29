import { useTradingUpdates } from '@/hooks/useTradingUpdates'
import { HubConnectionState } from '@microsoft/signalr'
import { Activity, DollarSign, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export function LiveTradingWidget() {
    const {
        connectionState,
        isConnected,
        latestTick,
        latestTrade,
        portfolioUpdate,
        balance,
    } = useTradingUpdates()

    const [tickHistory, setTickHistory] = useState<Array<{ price: number; timestamp: number }>>([])

    useEffect(() => {
        if (latestTick) {
            setTickHistory((prev) => [...prev.slice(-29), { price: latestTick.price, timestamp: latestTick.timestamp }])
        }
    }, [latestTick])

    const getConnectionStatusColor = () => {
        switch (connectionState) {
            case HubConnectionState.Connected:
                return 'bg-green-500'
            case HubConnectionState.Connecting:
            case HubConnectionState.Reconnecting:
                return 'bg-yellow-500'
            default:
                return 'bg-red-500'
        }
    }

    const getConnectionStatusText = () => {
        switch (connectionState) {
            case HubConnectionState.Connected:
                return 'Live'
            case HubConnectionState.Connecting:
                return 'Connecting...'
            case HubConnectionState.Reconnecting:
                return 'Reconnecting...'
            default:
                return 'Disconnected'
        }
    }

    const getPriceChange = () => {
        if (tickHistory.length < 2) return 0
        const current = tickHistory[tickHistory.length - 1].price
        const previous = tickHistory[tickHistory.length - 2].price
        return current - previous
    }

    const priceChange = getPriceChange()

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Live Trading Data
                </h3>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getConnectionStatusColor()} animate-pulse`} />
                    <span className="text-sm text-gray-600">{getConnectionStatusText()}</span>
                </div>
            </div>

            {!isConnected ? (
                <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Connecting to live trading feed...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Latest Tick */}
                    {latestTick && (
                        <div className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Latest Price - {latestTick.symbol}</p>
                                    <p className="text-2xl font-bold text-gray-900">{latestTick.price.toFixed(5)}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(latestTick.dateTime).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {priceChange !== 0 && (
                                        <div className={`flex items-center gap-1 ${priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {priceChange > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                            <span className="font-semibold">{Math.abs(priceChange).toFixed(5)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Balance */}
                    {balance && (
                        <div className="border-l-4 border-green-500 pl-4">
                            <p className="text-sm text-gray-600">Account Balance</p>
                            <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                                <DollarSign className="h-5 w-5" />
                                {balance.currency} {balance.balance.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                                Updated: {new Date(balance.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    )}

                    {/* Latest Trade */}
                    {latestTrade && (
                        <div className={`border-l-4 ${latestTrade.status === 'OPEN' ? 'border-yellow-500' : 'border-purple-500'} pl-4`}>
                            <p className="text-sm text-gray-600">Latest Trade</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {latestTrade.symbol} - {latestTrade.direction}
                                    </p>
                                    <p className="text-sm text-gray-600">Stake: ${latestTrade.stake}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${latestTrade.status === 'OPEN'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : latestTrade.profit && latestTrade.profit > 0
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {latestTrade.status}
                                    </span>
                                    {latestTrade.profit !== undefined && latestTrade.profit !== null && (
                                        <p className={`text-sm font-semibold mt-1 ${latestTrade.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {latestTrade.profit > 0 ? '+' : ''}{latestTrade.profit.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Portfolio Update */}
                    {portfolioUpdate && (
                        <div className="border-l-4 border-indigo-500 pl-4">
                            <p className="text-sm text-gray-600">Portfolio Performance</p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                    <p className="text-xs text-gray-500">Total Trades</p>
                                    <p className="font-semibold">{portfolioUpdate.totalTrades}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Win Rate</p>
                                    <p className="font-semibold">
                                        {((portfolioUpdate.winningTrades / portfolioUpdate.totalTrades) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Net Profit</p>
                                    <p className={`font-semibold ${portfolioUpdate.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${portfolioUpdate.netProfit.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">ROI</p>
                                    <p className={`font-semibold ${portfolioUpdate.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {portfolioUpdate.profitPercentage.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mini Tick Chart */}
                    {tickHistory.length > 1 && (
                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-600 mb-2">Price Movement (Last 30 ticks)</p>
                            <div className="h-16 flex items-end gap-0.5">
                                {tickHistory.map((tick, index) => {
                                    const minPrice = Math.min(...tickHistory.map(t => t.price))
                                    const maxPrice = Math.max(...tickHistory.map(t => t.price))
                                    const range = maxPrice - minPrice || 1
                                    const height = ((tick.price - minPrice) / range) * 100
                                    const isUp = index > 0 && tick.price > tickHistory[index - 1].price

                                    return (
                                        <div
                                            key={index}
                                            className={`flex-1 ${isUp ? 'bg-green-400' : 'bg-red-400'} rounded-t`}
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                            title={`${tick.price.toFixed(5)}`}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

