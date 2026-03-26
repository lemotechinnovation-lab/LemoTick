import { useEffect, useState } from 'react';
import DoughnutChart from '../../charts/DoughnutChart';

// Import utilities
import { getCssVariable } from '../../utils/Utils';

function DashboardCard06() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [dataIndex, setDataIndex] = useState(0);

  // Dummy trading distribution data (Forex, Crypto, Stocks percentages)
  const distributionData = [
    [45, 30, 25],
    [46, 29, 25],
    [47, 28, 25],
    [48, 27, 25],
    [47, 28, 25],
    [46, 30, 24],
    [45, 31, 24],
    [44, 32, 24],
    [43, 33, 24],
    [42, 34, 24],
  ];

  const [currentDistribution, setCurrentDistribution] = useState(distributionData[0]);

  // Fake update every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [counter]);

  // Update distribution data
  useEffect(() => {
    const nextIndex = (dataIndex + 1) % distributionData.length;
    setDataIndex(nextIndex);
    setCurrentDistribution(distributionData[nextIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  const chartData = {
    labels: ['Forex', 'Crypto', 'Stocks'],
    datasets: [
      {
        label: 'Trading Distribution',
        data: currentDistribution,
        backgroundColor: [
          getCssVariable('--color-violet-500'),
          getCssVariable('--color-sky-500'),
          getCssVariable('--color-violet-800'),
        ],
        hoverBackgroundColor: [
          getCssVariable('--color-violet-600'),
          getCssVariable('--color-sky-600'),
          getCssVariable('--color-violet-900'),
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Trading Distribution</h2>
        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
          <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
        </div>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <DoughnutChart data={chartData} width={389} height={260} />
    </div>
  );
}

export default DashboardCard06;
