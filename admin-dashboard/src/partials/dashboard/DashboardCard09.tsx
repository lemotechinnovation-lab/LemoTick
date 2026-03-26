import { useEffect, useState } from 'react';
import BarChart from '../../charts/BarChart02';
import Tooltip from '../../components/Tooltip';

// Import utilities
import { getCssVariable } from '../../utils/Utils';

function DashboardCard09() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(6);

  // Dummy profit/loss data
  const profitData = [6200, 9200, 6600, 8800, 5200, 9200, 7500, 8900, 9500, 10200];
  const lossData = [-4000, -2600, -5350, -4000, -7500, -2000, -3500, -2800, -2200, -1800];

  const [slicedProfit, setSlicedProfit] = useState(profitData.slice(0, range));
  const [slicedLoss, setSlicedLoss] = useState(lossData.slice(0, range));

  // Generate fake dates
  const generateDates = () => {
    const now = new Date();
    const dates: string[] = [];
    profitData.forEach((_, i) => {
      const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
      dates.push(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }));
    });
    return dates;
  };

  const [slicedLabels, setSlicedLabels] = useState(generateDates().slice(0, range).reverse());

  // Calculate net profit
  const netProfit = slicedProfit.reduce((a, b) => a + b, 0) + slicedLoss.reduce((a, b) => a + b, 0);
  const prevNetProfit = 10000;
  const changePercent = ((netProfit - prevNetProfit) / prevNetProfit) * 100;

  // Fake update every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [counter]);

  // Loop through data array and update
  useEffect(() => {
    setIncrement(increment + 1);
    if (increment + range < profitData.length) {
      setSlicedProfit(([, ...rest]) => [...rest, profitData[increment + range]]);
      setSlicedLoss(([, ...rest]) => [...rest, lossData[increment + range]]);
      const newDate = new Date(Date.now() - (increment + range) * 30 * 24 * 60 * 60 * 1000);
      setSlicedLabels(([, ...rest]) => [...rest, newDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })]);
    } else {
      setIncrement(0);
      setRange(0);
    }
    return () => setIncrement(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  const chartData = {
    labels: slicedLabels,
    datasets: [
      // Light blue bars
      {
        label: 'Profit',
        data: slicedProfit,
        backgroundColor: getCssVariable('--color-violet-500'),
        hoverBackgroundColor: getCssVariable('--color-violet-600'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      // Blue bars
      {
        label: 'Loss',
        data: slicedLoss,
        backgroundColor: getCssVariable('--color-violet-200'),
        hoverBackgroundColor: getCssVariable('--color-violet-300'),
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Profit VS Loss</h2>
        <Tooltip className="ml-2" size="lg">
          <div className="text-xs text-center whitespace-nowrap">Monthly comparison of profitable vs losing trades</div>
        </Tooltip>
        {/* Live indicator */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
          <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
        </div>
      </header>
      <div className="px-5 py-3">
        <div className="flex items-start">
          <div className="text-3xl font-bold text-[#efdede] drop-shadow-[0_0_6px_rgba(160,167,181,0.3)] font-semibold mr-2">
            {netProfit >= 0 ? '+' : ''}R {netProfit.toLocaleString('en-ZA')}
          </div>
          <div className={`text-sm font-medium px-1.5 rounded-full ${changePercent >= 0 ? 'text-green-700 bg-[#22C55E]/20' : 'text-red-700 bg-[#EF4444]/20'}`}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(0)}%
          </div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow">
        {/* Change the height attribute to adjust the chart height */}
        <BarChart data={chartData} width={595} height={248} />
      </div>
    </div>
  );
}

export default DashboardCard09;
