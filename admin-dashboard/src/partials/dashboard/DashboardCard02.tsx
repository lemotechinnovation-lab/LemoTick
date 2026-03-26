import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import RealtimeChart from '../../charts/RealtimeChart';
import EditMenu from '../../components/DropdownEditMenu';

// Import utilities
import { adjustColorOpacity } from '../../utils/Utils';

function DashboardCard02() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(35);

  // Dummy crypto trading data - TWO datasets as percentages (0-100)
  const btcData = [
    45, 48, 52, 55, 58, 60, 57, 54, 58, 62,
    65, 68, 72, 75, 78, 80, 77, 74, 78, 82,
    85, 88, 92, 88, 85, 82, 78, 75, 72, 68,
    65, 62, 58, 55, 52, 50, 53, 56, 60, 63,
    66, 69, 72, 76, 79, 82, 79, 76, 72, 69,
    66, 63, 60, 56, 53, 50, 53, 56, 60,
  ];

  const ethData = [
    20, 23, 26, 30, 33, 36, 33, 30, 26, 23,
    26, 29, 32, 36, 39, 42, 39, 36, 32, 29,
    32, 35, 38, 42, 45, 48, 45, 42, 38, 35,
    38, 41, 44, 48, 51, 54, 51, 48, 44, 41,
    44, 47, 50, 54, 57, 60, 57, 54, 50, 47,
    50, 53, 56, 60, 63, 66, 63, 60, 56,
  ];

  const [slicedBtcData, setSlicedBtcData] = useState(btcData.slice(0, range));
  const [slicedEthData, setSlicedEthData] = useState(ethData.slice(0, range));

  // Generate fake dates
  const generateDates = () => {
    const now = new Date();
    const dates: Date[] = [];
    btcData.forEach((_, i) => {
      dates.push(new Date(now.getTime() - 2000 - i * 2000));
    });
    return dates;
  };

  const [slicedLabels, setSlicedLabels] = useState(generateDates().slice(0, range).reverse());

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
    if (increment + range < btcData.length) {
      setSlicedBtcData(([, ...rest]) => [...rest, btcData[increment + range]]);
      setSlicedEthData(([, ...rest]) => [...rest, ethData[increment + range]]);
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
      // BTC (Orange line)
      {
        label: 'Bitcoin',
        data: slicedBtcData,
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
      // ETH (Purple line)
      {
        label: 'Ethereum',
        data: slicedEthData,
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          return chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity('#8B5CF6', 0) },
            { stop: 1, color: adjustColorOpacity('#8B5CF6', 0.2) }
          ]);
        },
        borderColor: '#8B5CF6',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#0F0A2B',
        pointBorderWidth: 0,
        pointHoverBackgroundColor: '#8B5CF6',
        pointHoverBorderColor: '#0F0A2B',
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-gradient-to-br from-[#1a1547]/80 via-[#16124A] to-[#1a1547]/80 shadow-lg rounded-xl border border-[#F59E0B]/20 hover:border-[#F59E0B]/40 transition-all duration-300">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Crypto Trading</h2>
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

export default DashboardCard02;
