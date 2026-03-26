import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import RealtimeChart from '../../charts/RealtimeChart';
import EditMenu from '../../components/DropdownEditMenu';

// Import utilities
import { adjustColorOpacity } from '../../utils/Utils';

function DashboardCard01() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(35);

  // Dummy forex trading data - TWO datasets as percentages (0-100)
  const buyData = [
    15, 18, 22, 25, 28, 30, 27, 24, 28, 32,
    35, 38, 42, 45, 48, 50, 47, 44, 48, 52,
    55, 58, 62, 65, 68, 70, 67, 64, 68, 72,
    75, 78, 82, 85, 88, 90, 87, 84, 88, 92,
    85, 82, 78, 75, 72, 70, 73, 76, 80, 83,
    86, 89, 92, 88, 85, 82, 78, 75, 72,
  ];

  const sellData = [
    25, 22, 18, 15, 12, 10, 13, 16, 12, 8,
    12, 15, 18, 22, 25, 28, 25, 22, 18, 15,
    18, 21, 24, 28, 31, 34, 31, 28, 24, 21,
    24, 27, 30, 34, 37, 40, 37, 34, 30, 27,
    30, 33, 36, 40, 43, 46, 43, 40, 36, 33,
    36, 39, 42, 46, 49, 52, 49, 46, 42,
  ];

  const [slicedBuyData, setSlicedBuyData] = useState(buyData.slice(0, range));
  const [slicedSellData, setSlicedSellData] = useState(sellData.slice(0, range));

  // Generate fake dates
  const generateDates = () => {
    const now = new Date();
    const dates: Date[] = [];
    buyData.forEach((_, i) => {
      dates.push(new Date(now.getTime() - 2000 - i * 2000));
    });
    return dates;
  };

  const [slicedLabels, setSlicedLabels] = useState(generateDates().slice(0, range).reverse());

  // Calculate stats from current data (using buy data for main value)
  const currentValue = slicedBuyData[slicedBuyData.length - 1] || 15;
  const initialValue = buyData[0];
  const change = currentValue - initialValue;
  const changePercent = ((change / initialValue) * 100);

  // Fake update every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [counter]);

  // Loop through data array and update
  useEffect(() => {
    setIncrement(increment + 1);
    if (increment + range < buyData.length) {
      setSlicedBuyData(([, ...rest]) => [...rest, buyData[increment + range]]);
      setSlicedSellData(([, ...rest]) => [...rest, sellData[increment + range]]);
    } else {
      setIncrement(0);
      setRange(0);
    }
    setSlicedLabels(([, ...rest]) => [...rest, new Date()]);
    return () => setIncrement(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  const chartData = {
    labels: slicedLabels,
    datasets: [
      // Buy Orders (Blue line)
      {
        label: 'Buy Orders',
        data: slicedBuyData,
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          return chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity('#6366F1', 0) },
            { stop: 1, color: adjustColorOpacity('#6366F1', 0.2) }
          ]);
        },
        borderColor: '#6366F1',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#0F0A2B',
        pointBorderWidth: 0,
        pointHoverBackgroundColor: '#6366F1',
        pointHoverBorderColor: '#0F0A2B',
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.4,
      },
      // Sell Orders (Orange line)
      {
        label: 'Sell Orders',
        data: slicedSellData,
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          return chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity('#F59E0B', 0) },
            { stop: 1, color: adjustColorOpacity('#F59E0B', 0.2) }
          ]);
        },
        borderColor: '#F59E0B',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#0F0A2B',
        pointBorderWidth: 0,
        pointHoverBackgroundColor: '#F59E0B',
        pointHoverBorderColor: '#0F0A2B',
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-gradient-to-br from-[#1a1547]/80 via-[#16124A] to-[#1a1547]/80 shadow-lg rounded-xl border border-[#2F6BFF]/20 hover:border-[#2F6BFF]/40 transition-all duration-300">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Forex Trading</h2>
            {/* Live indicator */}
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
              <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
            </div>
          </div>
          {/* Menu button */}
          <EditMenu align="right" className="relative inline-flex">
            <li>
              <Link className="font-medium text-sm text-[#efdede] dark:text-gray-100 hover:text-[#efdede] dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 1
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-[#efdede] dark:text-gray-100 hover:text-[#efdede] dark:hover:text-gray-200 flex py-1 px-3" to="#0">
                Option 2
              </Link>
            </li>
            <li>
              <Link className="font-medium text-sm text-[#EF4444] hover:text-red-600 flex py-1 px-3" to="#0">
                Remove
              </Link>
            </li>
          </EditMenu>
        </header>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow">
        <RealtimeChart data={chartData} width={389} height={128} />
      </div>
    </div>
  );
}

export default DashboardCard01;
