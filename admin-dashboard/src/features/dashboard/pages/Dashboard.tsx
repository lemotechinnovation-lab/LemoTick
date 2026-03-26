import { Activity, Bot, LayoutDashboard, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

import Datepicker from '../../../components/Datepicker';
import FilterButton from '../../../components/DropdownFilter';

// Import dashboard cards
import DashboardCard01 from '../../../partials/dashboard/DashboardCard01';
import DashboardCard02 from '../../../partials/dashboard/DashboardCard02';
import DashboardCard03 from '../../../partials/dashboard/DashboardCard03';
import DashboardCard04 from '../../../partials/dashboard/DashboardCard04';
import DashboardCard05 from '../../../partials/dashboard/DashboardCard05';
import DashboardCard06 from '../../../partials/dashboard/DashboardCard06';
import DashboardCard07 from '../../../partials/dashboard/DashboardCard07';
import DashboardCard08 from '../../../partials/dashboard/DashboardCard08';
import DashboardCard09 from '../../../partials/dashboard/DashboardCard09';
import DashboardCard10 from '../../../partials/dashboard/DashboardCard10';
import DashboardCard11 from '../../../partials/dashboard/DashboardCard11';
import DashboardCard12 from '../../../partials/dashboard/DashboardCard12';
import DashboardCard13 from '../../../partials/dashboard/DashboardCard13';

function Dashboard() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);

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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  // Sparkline component - Line Chart for Balance with smooth curves
  const LineSparkline = ({ data, color = '#2F6BFF' }: { data: number[], color?: string }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - ((value - min) / range) * 100
    }));

    // Create smooth curve using bezier curves
    const createSmoothPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return '';

      let path = `M ${points[0].x},${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];

        // Calculate control points for smooth curve (tension = 0.4)
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
      <svg className="w-full h-6" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          fill="none"
          stroke={color}
          strokeWidth="2"
          d={createSmoothPath(points)}
          vectorEffect="non-scaling-stroke"
          opacity="0.8"
        />
      </svg>
    );
  };

  // Area Chart for Profit/Loss (green above zero, red below) with smooth curves
  const AreaSparkline = ({ data, color = '#10B981' }: { data: number[], color?: string }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - ((value - min) / range) * 100
    }));

    // Create smooth curve path
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

    const pathData = createSmoothPath(points);
    const areaPath = `${pathData} L 100,100 L 0,100 Z`;

    return (
      <svg className="w-full h-6" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          fill={`${color}20`}
          stroke={color}
          strokeWidth="2"
          d={areaPath}
          vectorEffect="non-scaling-stroke"
          opacity="0.8"
        />
      </svg>
    );
  };

  // Candlestick Chart for Profit/Loss with smooth curves
  const CandlestickChart = ({ data }: { data: number[] }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - ((value - min) / range) * 100
    }));

    // Create smooth curve path
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

    // Determine color based on trend
    const isPositive = data[data.length - 1] >= data[0];
    const color = isPositive ? '#10B981' : '#EF4444';

    return (
      <svg className="w-full h-6" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          fill="none"
          stroke={color}
          strokeWidth="2"
          d={createSmoothPath(points)}
          vectorEffect="non-scaling-stroke"
          opacity="0.8"
        />
      </svg>
    );
  };

  // Bar Chart for Active Trades with rounded bars
  const BarSparkline = ({ data, color = '#F59E0B' }: { data: number[], color?: string }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data) || 1;

    return (
      <svg className="w-full h-6" viewBox="0 0 100 100" preserveAspectRatio="none">
        {data.map((value, index) => {
          const barWidth = 100 / data.length - 3;
          const barHeight = (value / max) * 100;
          const x = (index * 100) / data.length + 1.5;
          const y = 100 - barHeight;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              opacity="0.7"
              rx="1"
            />
          );
        })}
      </svg>
    );
  };

  // Donut Chart for Active Bots with enhanced styling
  const DonutChart = ({ value, max = 10, color = '#8B5CF6' }: { value: number, max?: number, color?: string }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <svg className="w-16 h-16 mx-auto" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#2F6BFF"
          strokeWidth="10"
          opacity="0.15"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          opacity="0.9"
        />
        {/* Center text */}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="24"
          fontWeight="bold"
        >
          {value}
        </text>
      </svg>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Stats cards with real-time data
  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(userStats.totalBalance),
      change: `${userStats.profitChange >= 0 ? '+' : ''}${userStats.profitChange.toFixed(1)}%`,
      trend: userStats.profitChange >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: 'blue',
      history: balanceHistory,
      sparklineColor: '#2F6BFF',
      chartType: 'line',
    },
    {
      title: 'Total Profit/Loss',
      value: formatCurrency(userStats.totalProfit),
      change: `${userStats.profitChange >= 0 ? '+' : ''}${userStats.profitChange.toFixed(1)}%`,
      trend: userStats.totalProfit >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'green',
      history: profitHistory,
      sparklineColor: userStats.totalProfit >= 0 ? '#10B981' : '#EF4444',
      chartType: 'candlestick',
    },
    {
      title: 'Active Trades',
      value: userStats.activeTrades.toString(),
      change: userStats.tradesChange > 0 ? `+${userStats.tradesChange}` : '0',
      trend: 'up',
      icon: Activity,
      color: 'orange',
      history: tradesHistory,
      sparklineColor: '#F59E0B',
      chartType: 'donut',
      currentValue: userStats.activeTrades,
    },
    {
      title: 'Active Bots',
      value: userStats.activeBots.toString(),
      change: userStats.botsChange > 0 ? `+${userStats.botsChange}` : '0',
      trend: 'up',
      icon: Bot,
      color: 'purple',
      history: botsHistory,
      sparklineColor: '#8B5CF6',
      chartType: 'donut',
      currentValue: userStats.activeBots,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 w-full max-w-9xl mx-auto">
      {/* Dashboard header */}
      <div className="relative mb-4 p-3 rounded-lg bg-gradient-to-br from-[#2F6BFF]/10 via-[#16124A] to-[#FFA62B]/10 border border-[#2F6BFF]/20">
        <div className="sm:flex sm:justify-between sm:items-center">
          <div className="mb-2 sm:mb-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-[#2F6BFF]/20 rounded-lg">
                <LayoutDashboard size={16} className="text-[#2F6BFF]" />
              </div>
              <h1 className="text-body-dashboard font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)]">Dashboard</h1>
              {/* Connection status indicator */}
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] text-gray-400">Live</span>
              </div>
            </div>
            <p className="text-micro text-gray-300 ml-8">Welcome back! Here's your trading overview today.</p>
          </div>

          <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
            <FilterButton align="right" />
            <Datepicker align="right" />
            <button className="btn bg-gradient-to-r from-[#2F6BFF] to-[#2557c9] hover:from-[#2557c9] hover:to-[#2F6BFF] text-white px-4 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 shadow-brand hover-lift">
              <svg className="fill-current shrink-0 xs:hidden" width="14" height="14" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
              <span className="max-xs:sr-only text-micro font-semibold">Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-gradient-to-br from-[#16124A] to-[#0B0633] rounded-lg p-3 border border-[#2F6BFF]/30 hover:border-[#2F6BFF]/60 transition-all duration-300 hover-lift group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#2F6BFF]/5 rounded-full blur-xl group-hover:bg-[#2F6BFF]/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 bg-gradient-to-br from-[#2F6BFF]/20 to-[#2F6BFF]/5 rounded group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={18} className="text-[#2F6BFF]" />
                </div>
                <span className={`text-[10px] font-semibold ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-small-dashboard font-bold text-[#efdede] font-tabular drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] mb-0.5">{stat.value}</div>
              <div className="text-[10px] text-gray-400 mb-2">{stat.title}</div>
              {/* Chart based on type */}
              <div className="mt-2">
                {stat.chartType === 'line' && <LineSparkline data={stat.history} color={stat.sparklineColor} />}
                {stat.chartType === 'candlestick' && <CandlestickChart data={stat.history} />}
                {stat.chartType === 'bar' && <BarSparkline data={stat.history} color={stat.sparklineColor} />}
                {stat.chartType === 'donut' && <DonutChart value={stat.currentValue || 0} max={10} color={stat.sparklineColor} />}
              </div>
            </div>
          </div>
        ))}
      </div>



      {/* Dashboard Cards */}
      <div className="grid grid-cols-12 gap-6">
        {/* Line chart (Forex Trading) */}
        <DashboardCard01 />
        {/* Line chart (Crypto Trading) */}
        <DashboardCard02 />
        {/* Line chart (Stocks Trading) */}
        <DashboardCard03 />
        {/* Bar chart (Manual vs Bot Trading) */}
        <DashboardCard04 />
        {/* Line chart (Portfolio Value Real Time) */}
        <DashboardCard05 />
        {/* Doughnut chart (Trading Distribution) */}
        <DashboardCard06 />
        {/* Table (Top Trading Pairs) */}
        <DashboardCard07 />
        {/* Line chart (Portfolio Growth Over Time) */}
        <DashboardCard08 />
        {/* Stacked bar chart (Profit VS Loss) */}
        <DashboardCard09 />
        {/* Card (Top Traders) */}
        <DashboardCard10 />
        {/* Card (Reasons for Losses) */}
        <DashboardCard11 />
        {/* Card (Recent Trading Activity) */}
        <DashboardCard12 />
        {/* Card (Deposits/Withdrawals) */}
        <DashboardCard13 />
      </div>
    </div>
  );
}

export default Dashboard;
