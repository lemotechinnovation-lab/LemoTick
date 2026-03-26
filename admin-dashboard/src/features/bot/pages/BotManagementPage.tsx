import { Activity, AlertCircle, CheckCircle, DollarSign, Pause, Play, TrendingDown, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BotMetrics {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'stopped';
    totalTrades: number;
    winRate: number;
    profit: number;
    profitPercent: number;
    lastTrade: string;
    uptime: string;
}

interface LogEntry {
    id: string;
    timestamp: string;
    botName: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
}

export default function BotManagementPage() {
    const [bots, setBots] = useState<BotMetrics[]>([
        {
            id: '1',
            name: 'Scalper Bot Alpha',
            status: 'active',
            totalTrades: 147,
            winRate: 68.5,
            profit: 2450.75,
            profitPercent: 24.5,
            lastTrade: '2 min ago',
            uptime: '12h 34m',
        },
        {
            id: '2',
            name: 'Trend Follower Beta',
            status: 'active',
            totalTrades: 89,
            winRate: 72.1,
            profit: 1890.25,
            profitPercent: 18.9,
            lastTrade: '5 min ago',
            uptime: '8h 12m',
        },
        {
            id: '3',
            name: 'Range Trader Gamma',
            status: 'paused',
            totalTrades: 203,
            winRate: 65.2,
            profit: -340.50,
            profitPercent: -3.4,
            lastTrade: '1h ago',
            uptime: '0h 0m',
        },
    ]);

    const [logs, setLogs] = useState<LogEntry[]>([
        { id: '1', timestamp: '14:32:15', botName: 'Scalper Bot Alpha', type: 'success', message: 'Trade executed: BUY R_100 at 1.2345 - Profit: +$12.50' },
        { id: '2', timestamp: '14:30:42', botName: 'Trend Follower Beta', type: 'info', message: 'Signal detected: Bullish trend on R_75' },
        { id: '3', timestamp: '14:28:33', botName: 'Scalper Bot Alpha', type: 'success', message: 'Trade closed: SELL R_100 at 1.2389 - Profit: +$8.75' },
        { id: '4', timestamp: '14:25:18', botName: 'Range Trader Gamma', type: 'warning', message: 'Bot paused: Daily loss limit reached (-$340.50)' },
        { id: '5', timestamp: '14:22:05', botName: 'Trend Follower Beta', type: 'error', message: 'Trade failed: Insufficient balance' },
    ]);

    const [selectedBot, setSelectedBot] = useState<string | null>(null);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Add new log entry
            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                botName: bots[Math.floor(Math.random() * bots.length)].name,
                type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as 'info' | 'success' | 'warning',
                message: 'Live update: Market analysis in progress...',
            };
            setLogs(prev => [newLog, ...prev].slice(0, 50));
        }, 10000);

        return () => clearInterval(interval);
    }, [bots]);

    const handleBotAction = (botId: string, action: 'start' | 'pause' | 'stop') => {
        setBots(prev => prev.map(bot => {
            if (bot.id === botId) {
                return {
                    ...bot,
                    status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'stopped'
                };
            }
            return bot;
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400';
            case 'paused': return 'text-yellow-400';
            case 'stopped': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-3 h-3 text-green-400" />;
            case 'warning': return <AlertCircle className="w-3 h-3 text-yellow-400" />;
            case 'error': return <XCircle className="w-3 h-3 text-red-400" />;
            default: return <Activity className="w-3 h-3 text-[#2F6BFF]" />;
        }
    };

    const totalProfit = bots.reduce((sum, bot) => sum + bot.profit, 0);
    const avgWinRate = bots.reduce((sum, bot) => sum + bot.winRate, 0) / bots.length;
    const activeBots = bots.filter(bot => bot.status === 'active').length;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
            {/* Page header with gradient background */}
            <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
                <div className="mb-2 sm:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                            <Activity size={16} className="text-[#2F6BFF]" />
                        </div>
                        <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Bot Management</h1>
                    </div>
                    <p className="text-micro text-gray-300 ml-8">Monitor and control your trading bots in real-time</p>
                </div>
            </div>

            {/* Summary Stats with enhanced styling */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                {/* Active Bots */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Play size={14} className="text-green-400" />
                            </div>
                            <span className="text-[10px] text-green-400 font-medium">Active</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{activeBots}/{bots.length}</div>
                        <div className="text-[10px] text-gray-400">Running Bots</div>
                    </div>
                </div>

                {/* Total Profit */}
                <div className={`relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border ${totalProfit >= 0 ? 'border-green-500/30 hover:border-green-500/60' : 'border-red-500/30 hover:border-red-500/60'} transition-all duration-300 hover-lift group`}>
                    <div className={`absolute top-0 right-0 w-16 h-16 ${totalProfit >= 0 ? 'bg-green-500/5' : 'bg-red-500/5'} rounded-full blur-xl group-hover:${totalProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} transition-all duration-300`}></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className={`p-0.5 bg-gradient-to-br ${totalProfit >= 0 ? 'from-green-500/20 to-green-500/5' : 'from-red-500/20 to-red-500/5'} rounded group-hover:scale-110 transition-transform duration-300`}>
                                {totalProfit >= 0 ? <TrendingUp size={14} className="text-green-400" /> : <TrendingDown size={14} className="text-red-400" />}
                            </div>
                            <span className={`text-[10px] ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>Profit</span>
                        </div>
                        <div className={`text-small-dashboard font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} font-tabular`}>
                            ${totalProfit.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-400">Total Earnings</div>
                    </div>
                </div>

                {/* Avg Win Rate */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <Activity size={14} className="text-[#2F6BFF]" />
                            </div>
                            <span className="text-[10px] text-[#2F6BFF] font-medium">Win Rate</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{avgWinRate.toFixed(1)}%</div>
                        <div className="text-[10px] text-gray-400">Average Success</div>
                    </div>
                </div>

                {/* Total Trades */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-2 border border-[#FFA62B]/30 hover:border-[#FFA62B]/60 transition-all duration-300 hover-lift group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFA62B]/5 rounded-full blur-xl group-hover:bg-[#FFA62B]/10 transition-all duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-0.5 bg-gradient-to-br from-[#FFA62B]/20 to-[#FFA62B]/5 rounded group-hover:scale-110 transition-transform duration-300">
                                <DollarSign size={14} className="text-[#FFA62B]" />
                            </div>
                            <span className="text-[10px] text-[#FFA62B] font-medium">Trades</span>
                        </div>
                        <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">{bots.reduce((sum, bot) => sum + bot.totalTrades, 0)}</div>
                        <div className="text-[10px] text-gray-400">Total Executed</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Bots List */}
                <div className="bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl overflow-hidden">
                    <div className="px-2 py-1 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent">
                        <h2 className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Active Bots</h2>
                    </div>
                    <div className="p-2 space-y-1.5 max-h-[420px] overflow-y-auto">
                        {bots.map((bot) => (
                            <div
                                key={bot.id}
                                className={`bg-gradient-to-r from-[#16124A] to-[#1E1854] rounded-md p-2 border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${selectedBot === bot.id ? 'border-[#2F6BFF] shadow-lg shadow-[#2F6BFF]/30' : 'border-[#2F6BFF]/20'
                                    }`}
                                onClick={() => setSelectedBot(bot.id)}
                            >
                                <div className="flex items-start justify-between mb-1.5">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-micro text-[#efdede] font-semibold truncate">{bot.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text-[10px] font-semibold ${getStatusColor(bot.status)}`}>
                                                ● {bot.status.toUpperCase()}
                                            </span>
                                            <span className="text-[10px] text-gray-400">• {bot.uptime}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 ml-2">
                                        {bot.status !== 'active' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleBotAction(bot.id, 'start'); }}
                                                className="w-6 h-6 bg-green-500/20 hover:bg-green-500/30 rounded flex items-center justify-center transition-colors"
                                                title="Start"
                                            >
                                                <Play size={12} className="text-green-400" />
                                            </button>
                                        )}
                                        {bot.status === 'active' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleBotAction(bot.id, 'pause'); }}
                                                className="w-6 h-6 bg-yellow-500/20 hover:bg-yellow-500/30 rounded flex items-center justify-center transition-colors"
                                                title="Pause"
                                            >
                                                <Pause size={12} className="text-yellow-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5">
                                    <div>
                                        <div className="text-[10px] text-gray-400">Trades</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{bot.totalTrades}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400">Win Rate</div>
                                        <div className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{bot.winRate}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400">Profit</div>
                                        <div className={`text-micro font-semibold ${bot.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${bot.profit.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-1.5 pt-1.5 border-t border-[#2F6BFF]/20">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-400">Last trade</span>
                                        <span className="text-gray-300">{bot.lastTrade}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Logs */}
                <div className="bg-gradient-to-br from-[#0B0633] to-[#16124A] rounded-lg border border-[#2F6BFF]/30 shadow-xl overflow-hidden">
                    <div className="px-2 py-1 border-b border-[#2F6BFF]/30 bg-gradient-to-r from-[#2F6BFF]/10 to-transparent flex items-center justify-between">
                        <h2 className="text-micro text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Live Logs</h2>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-green-400 font-medium">LIVE</span>
                        </div>
                    </div>
                    <div className="p-2 space-y-1 max-h-[420px] overflow-y-auto font-mono">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="bg-[#16124A]/50 rounded p-1.5 border border-[#2F6BFF]/10 hover:border-[#2F6BFF]/30 transition-colors"
                            >
                                <div className="flex items-start gap-1.5">
                                    {getLogIcon(log.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="text-[11px] text-gray-400">{log.timestamp}</span>
                                            <span className="text-[11px] text-[#2F6BFF] font-semibold truncate">{log.botName}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-300 break-words leading-relaxed">{log.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
