import ModernAreaChart from '@/components/charts/ModernAreaChart';
import ModernBarChart from '@/components/charts/ModernBarChart';
import ModernDonutChart from '@/components/charts/ModernDonutChart';
import { ProgressBar, StatusBadge, TableCell, TableRow } from '@/components/dashboard/DashboardComponents';
import { LiveBadge, PageHeader } from '@/components/ui/PageHeader';
import { PageContainer, PageSection } from '@/components/ui/PageLayoutEnhanced';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  BarChart3,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  // Fake real-time data
  const [counter, setCounter] = useState(0);

  // Alert state
  const [showAlert, setShowAlert] = useState(true);

  // Dummy data arrays for stats
  const balanceData = [52231, 52450, 52680, 52900, 53120, 53350, 53580, 53800, 54020, 54250];
  const profitData = [12450, 12670, 12890, 13110, 13330, 13550, 13770, 13990, 14210, 14430];
  const tradesData = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const botsData = [3, 3, 4, 4, 5, 5, 6, 6, 7, 7];

  const [dataIndex, setDataIndex] = useState(0);

  // Track history for sparklines (last 10 points)
  const [balanceHistory, setBalanceHistory] = useState<number[]>([52231]);
  const [profitHistory, setProfitHistory] = useState<number[]>([12450]);
  const [tradesHistory, setTradesHistory] = useState<number[]>([8]);
  const [botsHistory, setBotsHistory] = useState<number[]>([3]);

  // User-specific trading stats
  const [userStats, setUserStats] = useState({
    totalBalance: balanceData[0],
    totalProfit: profitData[0],
    profitChange: 8.5,
    activeTrades: tradesData[0],
    tradesChange: 2,
    activeBots: botsData[0],
    botsChange: 1,
    winRate: 68.5,
    totalTrades: 142,
  });

  // Fake update every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [counter]);

  // Update stats with fake data
  useEffect(() => {
    const nextIndex = (dataIndex + 1) % balanceData.length;
    setDataIndex(nextIndex);

    const prevBalance = balanceData[dataIndex];
    const newBalance = balanceData[nextIndex];
    const balanceChange = ((newBalance - prevBalance) / prevBalance) * 100;

    const prevProfit = profitData[dataIndex];
    const newProfit = profitData[nextIndex];
    const profitChange = ((newProfit - prevProfit) / prevProfit) * 100;

    // Update histories (keep last 10 points)
    setBalanceHistory(prev => [...prev, newBalance].slice(-10));
    setProfitHistory(prev => [...prev, newProfit].slice(-10));
    setTradesHistory(prev => [...prev, tradesData[nextIndex]].slice(-10));
    setBotsHistory(prev => [...prev, botsData[nextIndex]].slice(-10));

    setUserStats({
      totalBalance: newBalance,
      totalProfit: newProfit,
      profitChange: profitChange,
      activeTrades: tradesData[nextIndex],
      tradesChange: tradesData[nextIndex] - tradesData[dataIndex],
      activeBots: botsData[nextIndex],
      botsChange: botsData[nextIndex] - botsData[dataIndex],
      winRate: 68.5 + Math.random() * 2,
      totalTrades: 142 + nextIndex,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  // Sparkline component - Line Chart
  const LineSparkline = ({ data, color = '#2F6BFF' }: { data: number[], color?: string }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - ((value - min) / range) * 100
    }));

    const createSmoothPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return '';
      let path = `M ${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const tension = 0.4;
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        const cp1x = current.x + dx * tension;
        const cp1y = current.y + dy * tension;
        const cp2x = next.x - dx * tension;
        const cp2y = next.y - dy * tension;
        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
      }
      return path;
    };

    return (
      <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#gradient-${color})`}
          stroke={color}
          strokeWidth="2"
          d={`${createSmoothPath(points)} L 100,100 L 0,100 Z`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Recent trades data
  const recentTrades = [
    { pair: 'EUR/USD', type: 'Buy', profit: 245.50, status: 'closed', time: '2 min ago' },
    { pair: 'BTC/USD', type: 'Sell', profit: -120.00, status: 'closed', time: '5 min ago' },
    { pair: 'GBP/USD', type: 'Buy', profit: 180.25, status: 'closed', time: '12 min ago' },
    { pair: 'ETH/USD', type: 'Buy', profit: 320.00, status: 'open', time: '15 min ago' },
    { pair: 'USD/JPY', type: 'Sell', profit: 95.75, status: 'open', time: '18 min ago' },
  ];

  // Quick actions
  const quickActions = [
    { title: 'New Trade', icon: TrendingUp, link: '/trade', color: 'from-[#2F6BFF] to-[#3B82F6]', iconColor: 'text-[#2F6BFF]', borderColor: 'border-[#2F6BFF]/30', shadowColor: 'shadow-[#2F6BFF]/20' },
    { title: 'My Robots', icon: Bot, link: '/my-robots', color: 'from-[#8B5CF6] to-[#A78BFA]', iconColor: 'text-[#8B5CF6]', borderColor: 'border-[#8B5CF6]/30', shadowColor: 'shadow-[#8B5CF6]/20' },
    { title: 'Portfolio', icon: BarChart3, link: '/portfolio', color: 'from-[#10B981] to-[#34D399]', iconColor: 'text-[#10B981]', borderColor: 'border-[#10B981]/30', shadowColor: 'shadow-[#10B981]/20' },
    { title: 'Transactions', icon: DollarSign, link: '/transactions', color: 'from-[#F59E0B] to-[#FBBF24]', iconColor: 'text-[#F59E0B]', borderColor: 'border-[#F59E0B]/30', shadowColor: 'shadow-[#F59E0B]/20' },
  ];

  return (
    <PageContainer maxWidth="xl" className="fade-in-up relative overflow-hidden">
      {/* Page Header */}
      <PageHeader
        title="DASHBOARD"
        description="Welcome back! Here's your trading overview today."
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-3">
            <LiveBadge />
            <button className="px-4 py-2 bg-card/40 hover:bg-card/60 text-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today
            </button>
          </div>
        }
      />

      {/* Stats Grid - Enhanced with Glassmorphism */}
      <PageSection spacing="normal">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Account Balance */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/20 to-[#4A7FFF]/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-brand-blue group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${userStats.profitChange >= 0 ? 'bg-green-500/20 text-green-400 border border-green-400/30' : 'bg-red-500/20 text-red-400 border border-red-400/30'}`}>
                {userStats.profitChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {userStats.profitChange >= 0 ? '+' : ''}{userStats.profitChange.toFixed(1)}%
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Account Balance</p>
              <p className="text-2xl font-bold text-white mb-1">{formatCurrency(userStats.totalBalance)}</p>
              <p className="text-xs text-gray-500">Updated just now</p>
            </div>
          </div>

          {/* Total Profit */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-lg border border-green-400/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${userStats.profitChange >= 0 ? 'bg-green-500/20 text-green-400 border border-green-400/30' : 'bg-red-500/20 text-red-400 border border-red-400/30'}`}>
                {userStats.profitChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {userStats.profitChange >= 0 ? '+' : ''}{userStats.profitChange.toFixed(1)}%
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Total Profit</p>
              <p className="text-2xl font-bold text-green-400 mb-1">{formatCurrency(userStats.totalProfit)}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>

          {/* Win Rate */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-purple-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-400/30">
                {userStats.totalTrades} trades
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Win Rate</p>
              <p className="text-2xl font-bold text-purple-400 mb-1">{userStats.winRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Above average</p>
            </div>
          </div>

          {/* Active Bots */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-accent-orange/30 shadow-xl shadow-accent-orange/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-accent-orange/20 to-[#FFB84D]/20 flex items-center justify-center shadow-lg border border-accent-orange/30 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 text-accent-orange group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-400/30">
                {userStats.botsChange > 0 ? `+${userStats.botsChange}` : 'Running'}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Active Bots</p>
              <p className="text-2xl font-bold text-accent-orange mb-1">{userStats.activeBots}</p>
              <p className="text-xs text-gray-500">All operational</p>
            </div>
          </div>
        </div>
      </PageSection>

      {/* Account Status & Compliance - Enhanced */}
      <PageSection spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Account Status */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-lg border border-green-400/30 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <StatusBadge status="active" pulse={true} />
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Account Status</p>
              <p className="text-2xl font-bold text-green-400 mb-1">Active</p>
              <p className="text-xs text-gray-500">Tier II - R50,000</p>
            </div>
          </div>

          {/* Drawdown Monitor */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-yellow-400/30 shadow-xl shadow-yellow-500/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center shadow-lg border border-yellow-400/30 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-yellow-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-400/30">
                Safe zone
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Drawdown Monitor</p>
              <p className="text-2xl font-bold text-yellow-400 mb-1">3.2%</p>
              <p className="text-xs text-gray-500 mb-3">of 5% maximum</p>
              <ProgressBar
                label="Current Drawdown"
                current={3.2}
                max={5}
                unit="%"
                colorScheme="yellow"
                warning={true}
              />
            </div>
          </div>

          {/* Profit Target */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-lg border border-green-400/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-400/30">
                <TrendingUp className="w-3 h-3" />
                On track
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Profit Target</p>
              <p className="text-2xl font-bold text-green-400 mb-1">8.5%</p>
              <p className="text-xs text-gray-500 mb-3">of 10% target</p>
              <ProgressBar
                label="Progress to Target"
                current={8.5}
                max={10}
                unit="%"
                colorScheme="green"
              />
            </div>
          </div>
        </div>
      </PageSection>

      {/* Advanced Trading Metrics - Enhanced */}
      <PageSection spacing="normal">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white mb-1">Advanced Trading Metrics</h2>
          <p className="text-sm text-gray-400">Key performance indicators for professional traders</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sharpe Ratio */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6]/20 to-[#A78BFA]/20 flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-[#8B5CF6] group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-0.5 font-semibold uppercase tracking-wide">Sharpe Ratio</div>
                <div className="text-lg font-bold text-white">2.15</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700/50 relative z-10">
              <span className="text-xs text-gray-400">Rating</span>
              <span className="text-xs font-semibold text-green-400">Excellent</span>
            </div>
          </div>

          {/* Max Drawdown */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-red-500/20 shadow-xl shadow-red-500/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#EF4444]/20 to-[#F87171]/20 flex items-center justify-center shadow-lg border border-red-500/30 group-hover:scale-110 transition-transform">
                <ArrowDownRight className="w-5 h-5 text-[#EF4444] group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-0.5 font-semibold uppercase tracking-wide">Max Drawdown</div>
                <div className="text-lg font-bold text-white">8.5%</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700/50 relative z-10">
              <span className="text-xs text-gray-400">Status</span>
              <span className="text-xs font-semibold text-green-400">Safe</span>
            </div>
          </div>

          {/* Profit Factor */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#2F6BFF]/20 to-[#4A90E2]/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-[#2F6BFF] group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-0.5 font-semibold uppercase tracking-wide">Profit Factor</div>
                <div className="text-lg font-bold text-white">2.65</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700/50 relative z-10">
              <span className="text-xs text-gray-400">Target</span>
              <span className="text-xs font-semibold text-gray-400">&gt;2.0</span>
            </div>
          </div>

          {/* Total Trades */}
          <div className="glass-card-elevated p-5 rounded-2xl smooth-hover border border-cyan-500/20 shadow-xl shadow-cyan-500/10 backdrop-blur-xl relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#06B6D4]/20 to-[#22D3EE]/20 flex items-center justify-center shadow-lg border border-cyan-500/30 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-[#06B6D4] group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-0.5 font-semibold uppercase tracking-wide">Total Trades</div>
                <div className="text-lg font-bold text-white">{userStats.totalTrades}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700/50 relative z-10">
              <span className="text-xs text-gray-400">Active</span>
              <span className="text-xs font-semibold text-primary">{userStats.activeTrades}</span>
            </div>
          </div>
        </div>
      </PageSection>

      {/* Quick Actions - Enhanced */}
      <PageSection spacing="normal">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white mb-1">Quick Actions</h2>
          <p className="text-sm text-gray-400">Common tasks and shortcuts</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.link)}
              className={`glass-card-elevated p-5 rounded-2xl smooth-hover border ${action.borderColor} shadow-xl ${action.shadowColor} backdrop-blur-xl relative overflow-hidden group animate-fade-in-up`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg border ${action.borderColor} group-hover:scale-110 transition-transform mb-3 mx-auto`}>
                <action.icon className={`w-6 h-6 ${action.iconColor} group-hover:animate-pulse`} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <p className={`text-sm font-bold text-center transition-colors ${action.iconColor} group-hover:text-white`}>{action.title}</p>
            </button>
          ))}
        </div>
      </PageSection>

      {/* Recent Trades - Enhanced Table */}
      <PageSection spacing="normal">
        <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Recent Trades</h2>
              <p className="text-sm text-gray-400">Your latest trading activity</p>
            </div>
            <Link to="/trade" className="text-brand-blue hover:text-accent-orange text-sm font-semibold transition-colors flex items-center gap-1 group/link">
              <span>View All</span>
              <span className="group-hover/link:translate-x-1 inline-block transition-transform">→</span>
            </Link>
          </div>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gradient-to-r from-primary/5 to-transparent">
                  <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide">Pair</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide">Type</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide">Profit/Loss</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-white font-bold">{trade.pair}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${trade.type === 'Buy'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                        {trade.type}
                      </span>
                    </TableCell>
                    <TableCell align="right" className={`font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profit >= 0 ? '+' : ''}{formatCurrency(trade.profit)}
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge
                        status={trade.status === 'open' ? 'active' : 'inactive'}
                        label={trade.status}
                      />
                    </TableCell>
                    <TableCell className="text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {trade.time}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageSection>

      {/* Performance Overview - Enhanced */}
      <PageSection spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trading Activity */}
          <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-brand-blue group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors">Trading Activity</h3>
            </div>
            <div className="space-y-3 sm:space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-400">Total Trades</span>
                <span className="text-sm sm:text-base text-white font-bold">{userStats.totalTrades}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-400">Active Trades</span>
                <span className="text-sm sm:text-base text-white font-bold">{userStats.activeTrades}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-400">Win Rate</span>
                <span className="text-sm sm:text-base text-green-400 font-bold">{userStats.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-400">Active Bots</span>
                <span className="text-sm sm:text-base text-white font-bold">{userStats.activeBots}</span>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-lg border border-green-400/30 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5 text-green-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">Account Summary</h3>
            </div>
            <div className="space-y-3 sm:space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-400">Account Balance</span>
                <span className="text-sm sm:text-base text-white font-bold truncate ml-2">{formatCurrency(userStats.totalBalance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-400">Total Profit</span>
                <span className="text-sm sm:text-base text-green-400 font-bold truncate ml-2">{formatCurrency(userStats.totalProfit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-400">Today's Change</span>
                <span className={`text-sm sm:text-base font-bold ${userStats.profitChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userStats.profitChange >= 0 ? '+' : ''}{userStats.profitChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-400">Account Type</span>
                <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full text-xs sm:text-sm text-primary font-semibold shrink-0">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      {/* Performance Charts - Enhanced */}
      <PageSection spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trading Volume Chart */}
          <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-brand-blue group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors">Trading Volume (Last 7 Days)</h3>
            </div>
            <div className="relative z-10">
              <ModernBarChart
                data={[
                  { label: 'Mon', value: 24, color: '#2F6BFF' },
                  { label: 'Tue', value: 31, color: '#2F6BFF' },
                  { label: 'Wed', value: 28, color: '#2F6BFF' },
                  { label: 'Thu', value: 35, color: '#2F6BFF' },
                  { label: 'Fri', value: 42, color: '#10B981' },
                  { label: 'Sat', value: 38, color: '#10B981' },
                  { label: 'Sun', value: 45, color: '#10B981' },
                ]}
                height={240}
                showValues={true}
                animate={true}
              />
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-purple-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Asset Allocation</h3>
            </div>
            <div className="relative z-10">
              <ModernDonutChart
                data={[
                  { label: 'Forex', value: 45, color: '#2F6BFF' },
                  { label: 'Crypto', value: 30, color: '#10B981' },
                  { label: 'Indices', value: 15, color: '#F59E0B' },
                  { label: 'Commodities', value: 10, color: '#8B5CF6' },
                ]}
                size={220}
                thickness={35}
                showLegend={true}
                animate={true}
                centerText="Total"
                centerValue="100%"
              />
            </div>
          </div>
        </div>
      </PageSection>

      {/* Performance Trends - Enhanced */}
      <PageSection spacing="normal">
        <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-brand-blue group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors">Account Balance Trend (30 Days)</h3>
              <p className="text-sm text-gray-400">Your account performance over the last month</p>
            </div>
          </div>
          <div className="relative z-10">
            <ModernAreaChart
              data={[
                50000, 50500, 51200, 50800, 51500, 52100, 51800, 52500,
                53200, 52800, 53500, 54200, 53800, 54500, 55200, 54800,
                55500, 56200, 55800, 56500, 57200, 56800, 57500, 58200,
                57800, 58500, 59200, 58800, 59500, 60200
              ]}
              color="#2F6BFF"
              gradientFrom="#2F6BFF"
              gradientTo="#FFA62B"
              height={280}
              showGrid={true}
              animate={true}
            />
          </div>
        </div>
      </PageSection>

      {/* Trade Distribution & Statistics - Enhanced */}
      <PageSection spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trade Distribution */}
          <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-brand-blue group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors">Trade Distribution</h3>
                <p className="text-sm text-gray-400">Pie chart visualization</p>
              </div>
            </div>
            <div className="relative z-10">
              <ModernDonutChart
                data={[
                  { label: 'Winning Trades', value: 97, color: '#10B981' },
                  { label: 'Losing Trades', value: 45, color: '#EF4444' },
                ]}
                size={200}
                thickness={30}
                showLegend={true}
                animate={true}
                centerText="Total"
                centerValue="142"
              />
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-400/30 shadow-lg shadow-green-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-white">Winning Trades</span>
                  </div>
                  <span className="text-sm font-semibold text-white">97 (68.3%)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-400/30 shadow-lg shadow-red-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-white">Losing Trades</span>
                  </div>
                  <span className="text-sm font-semibold text-white">45 (31.7%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Statistics */}
          <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-purple-500/20 shadow-xl shadow-purple-500/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-purple-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Trade Statistics</h3>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 transition-all">
                <span className="text-sm text-white">Average Win</span>
                <span className="text-sm font-semibold text-green-400">R 850,00</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 transition-all">
                <span className="text-sm text-white">Average Loss</span>
                <span className="text-sm font-semibold text-red-400">R 320,00</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 transition-all">
                <span className="text-sm text-white">Best Trade</span>
                <span className="text-sm font-semibold text-green-400">R 2 450,00</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 transition-all">
                <span className="text-sm text-white">Worst Trade</span>
                <span className="text-sm font-semibold text-red-400">R -890,00</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/30 shadow-lg hover:shadow-xl hover:shadow-brand-blue/20 transition-all">
                <span className="text-sm text-white">Avg Trade Duration</span>
                <span className="text-sm font-semibold text-white">4.2 hours</span>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      {/* Best & Worst Trades - Enhanced */}
      <PageSection spacing="normal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top 5 Best Trades */}
          <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-green-400/30 shadow-xl shadow-green-500/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-lg border border-green-400/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-green-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">Top 5 Best Trades</h3>
            </div>
            <div className="space-y-2 relative z-10">
              {[
                { pair: 'BTC/USD', type: 'Buy', profit: 2450, date: '2024-03-15', duration: '6h 30m' },
                { pair: 'EUR/USD', type: 'Sell', profit: 1850, date: '2024-03-14', duration: '4h 15m' },
                { pair: 'ETH/USD', type: 'Buy', profit: 1620, date: '2024-03-13', duration: '5h 45m' },
                { pair: 'GBP/USD', type: 'Buy', profit: 1450, date: '2024-03-12', duration: '3h 20m' },
                { pair: 'XAU/USD', type: 'Sell', profit: 1280, date: '2024-03-11', duration: '7h 10m' },
              ].map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-all border border-green-400/30 shadow-lg hover:shadow-xl hover:shadow-green-500/20 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0 border border-green-400/30">
                      <span className="text-xs font-bold text-green-400">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{trade.pair}</div>
                      <div className="text-xs text-gray-400 font-medium">{trade.date} • {trade.duration}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-green-400">R {trade.profit.toLocaleString()},00</div>
                    <StatusBadge
                      status={trade.type === 'Buy' ? 'success' : 'error'}
                      label={trade.type}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Worst Trades */}
          <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-red-500/20 shadow-xl shadow-red-500/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center shadow-lg border border-red-500/30 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-5 h-5 text-red-400 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">Top 5 Worst Trades</h3>
            </div>
            <div className="space-y-2 relative z-10">
              {[
                { pair: 'USD/JPY', type: 'Sell', profit: -890, date: '2024-03-10', duration: '2h 45m' },
                { pair: 'AUD/USD', type: 'Buy', profit: -720, date: '2024-03-09', duration: '3h 30m' },
                { pair: 'EUR/GBP', type: 'Sell', profit: -650, date: '2024-03-08', duration: '1h 55m' },
                { pair: 'USD/CAD', type: 'Buy', profit: -580, date: '2024-03-07', duration: '4h 20m' },
                { pair: 'NZD/USD', type: 'Sell', profit: -520, date: '2024-03-06', duration: '2h 15m' },
              ].map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-400/30 shadow-lg hover:shadow-xl hover:shadow-red-500/20 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0 border border-red-400/30">
                      <span className="text-xs font-bold text-red-400">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{trade.pair}</div>
                      <div className="text-xs text-gray-400 font-medium">{trade.date} • {trade.duration}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-red-400">R {trade.profit.toLocaleString()},00</div>
                    <StatusBadge
                      status={trade.type === 'Buy' ? 'success' : 'error'}
                      label={trade.type}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSection>

      {/* Live Activity Logs - Enhanced */}
      <PageSection spacing="normal">
        <div className="glass-card-elevated p-6 rounded-2xl smooth-hover border border-brand-blue/20 shadow-xl shadow-brand-blue/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/20 to-accent-orange/20 flex items-center justify-center shadow-lg border border-brand-blue/30 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-brand-blue group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-blue transition-colors">Live Activity Logs</h3>
                <p className="text-sm text-gray-400">Real-time bot activity and trade execution</p>
              </div>
            </div>
            <StatusBadge status="active" label="LIVE" pulse={true} />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent relative z-10">
            {[
              { time: '19:49:53', bot: 'Trend Follower Beta', message: 'Live update: Market analysis in progress...', type: 'info' },
              { time: '19:49:43', bot: 'Trend Follower Beta', message: 'Live update: Market analysis in progress...', type: 'info' },
              { time: '14:32:15', bot: 'Scalper Bot Alpha', message: 'Trade executed: BUY R_100 at 1.2345 - Profit: +R12.50', type: 'success' },
              { time: '14:30:42', bot: 'Trend Follower Beta', message: 'Signal detected: Bullish trend on R_75', type: 'info' },
              { time: '14:28:33', bot: 'Scalper Bot Alpha', message: 'Trade closed: SELL R_100 at 1.2389 - Profit: +R8.75', type: 'success' },
              { time: '14:25:18', bot: 'Range Trader Gamma', message: 'Bot paused: Daily loss limit reached (-R340.50)', type: 'warning' },
              { time: '14:22:05', bot: 'Trend Follower Beta', message: 'Trade failed: Insufficient balance', type: 'error' },
            ].map((log, index) => {
              const typeStyles = {
                info: 'bg-gradient-to-r from-primary/10 to-transparent border-brand-blue/30 shadow-brand-blue/20',
                success: 'bg-gradient-to-r from-green-500/10 to-transparent border-green-400/30 shadow-green-500/20',
                warning: 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-400/30 shadow-yellow-500/20',
                error: 'bg-gradient-to-r from-red-500/10 to-transparent border-red-400/30 shadow-red-500/20',
              };
              const iconColors = {
                info: 'text-primary',
                success: 'text-green-400',
                warning: 'text-yellow-400',
                error: 'text-red-400',
              };
              const statusMap = {
                info: 'pending' as const,
                success: 'success' as const,
                warning: 'warning' as const,
                error: 'error' as const,
              };
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-xl ${typeStyles[log.type as keyof typeof typeStyles]} hover:bg-opacity-80 transition-all border shadow-lg animate-fade-in-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <Clock className={`w-4 h-4 ${iconColors[log.type as keyof typeof iconColors]}`} />
                    <span className="text-xs font-mono text-gray-400 font-medium">{log.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white mb-1">{log.bot}</div>
                    <div className="text-xs text-gray-300 font-medium">{log.message}</div>
                  </div>
                  <StatusBadge status={statusMap[log.type as keyof typeof statusMap]} />
                </div>
              );
            })}
          </div>
        </div>
      </PageSection>
    </PageContainer>
  );
}

export default Dashboard;
