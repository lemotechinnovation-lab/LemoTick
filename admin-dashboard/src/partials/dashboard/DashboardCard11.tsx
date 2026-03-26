import { useEffect, useState } from 'react';
import BarChart from '../../charts/BarChart03';

// Import utilities
import { getCssVariable } from '../../utils/Utils';

function DashboardCard11() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);

  // Dummy reasons data
  const reasonsData = [
    { volatility: 131, timing: 100, stopLoss: 81, news: 65, other: 72 },
    { volatility: 135, timing: 105, stopLoss: 78, news: 68, other: 70 },
    { volatility: 140, timing: 110, stopLoss: 75, news: 70, other: 68 },
    { volatility: 138, timing: 108, stopLoss: 77, news: 72, other: 69 },
  ];

  const [currentData, setCurrentData] = useState(reasonsData[0]);
  const [dataIndex, setDataIndex] = useState(0);

  // Calculate total
  const total = Object.values(currentData).reduce((a, b) => a + b, 0);
  const prevTotal = 449;
  const changePercent = ((total - prevTotal) / prevTotal) * 100;

  // Fake update every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [counter]);

  // Update data
  useEffect(() => {
    const nextIndex = (dataIndex + 1) % reasonsData.length;
    setDataIndex(nextIndex);
    setCurrentData(reasonsData[nextIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  const chartData = {
    labels: ['Reasons'],
    datasets: [
      {
        label: 'Market volatility',
        data: [currentData.volatility],
        backgroundColor: getCssVariable('--color-violet-500'),
        hoverBackgroundColor: getCssVariable('--color-violet-600'),
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: 'Wrong entry timing',
        data: [currentData.timing],
        backgroundColor: getCssVariable('--color-violet-700'),
        hoverBackgroundColor: getCssVariable('--color-violet-800'),
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: 'Stop loss hit',
        data: [currentData.stopLoss],
        backgroundColor: getCssVariable('--color-sky-500'),
        hoverBackgroundColor: getCssVariable('--color-sky-600'),
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: 'News impact',
        data: [currentData.news],
        backgroundColor: getCssVariable('--color-green-500'),
        hoverBackgroundColor: getCssVariable('--color-green-600'),
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: 'Other',
        data: [currentData.other],
        backgroundColor: getCssVariable('--color-gray-200'),
        hoverBackgroundColor: getCssVariable('--color-gray-300'),
        barPercentage: 1,
        categoryPercentage: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Reasons for Losses</h2>
        {/* Live indicator */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
          <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
        </div>
      </header>
      <div className="px-5 py-3">
        <div className="flex items-start">
          <div className="text-3xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] font-semibold mr-2">{total}</div>
          <div className={`text-sm font-medium px-1.5 rounded-full ${changePercent >= 0 ? 'text-red-700 bg-[#EF4444]/20' : 'text-green-700 bg-[#22C55E]/20'}`}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(0)}%
          </div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow">
        {/* Change the height attribute to adjust the chart height */}
        <BarChart data={chartData} width={595} height={48} />
      </div>
    </div>
  );
}

export default DashboardCard11;
