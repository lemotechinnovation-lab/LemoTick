import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import RealtimeChart from '../../charts/RealtimeChart';
import EditMenu from '../../components/DropdownEditMenu';

// Import utilities
import { adjustColorOpacity } from '../../utils/Utils';

function DashboardCard03() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(35);

  // Dummy stocks trading data - TWO datasets as percentages (0-100)
  const techData = [
    30, 33, 36, 40, 43, 46, 43, 40, 36, 33,
    36, 39, 42, 46, 49, 52, 49, 46, 42, 39,
    42, 45, 48, 52, 55, 58, 55, 52, 48, 45,
    48, 51, 54, 58, 61, 64, 61, 58, 54, 51,
    54, 57, 60, 64, 67, 70, 67, 64, 60, 57,
    60, 63, 66, 70, 73, 76, 73, 70, 66,
  ];

  const energyData = [
    50, 47, 44, 40, 37, 34, 37, 40, 44, 47,
    44, 41, 38, 34, 31, 28, 31, 34, 38, 41,
    38, 35, 32, 28, 25, 22, 25, 28, 32, 35,
    32, 29, 26, 22, 19, 16, 19, 22, 26, 29,
    26, 23, 20, 16, 13, 10, 13, 16, 20, 23,
    20, 17, 14, 10, 7, 4, 7, 10, 14,
  ];

  const [slicedTechData, setSlicedTechData] = useState(techData.slice(0, range));
  const [slicedEnergyData, setSlicedEnergyData] = useState(energyData.slice(0, range));

  // Generate fake dates
  const generateDates = () => {
    const now = new Date();
    const dates: Date[] = [];
    techData.forEach((_, i) => {
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
    if (increment + range < techData.length) {
      setSlicedTechData(([, ...rest]) => [...rest, techData[increment + range]]);
      setSlicedEnergyData(([, ...rest]) => [...rest, energyData[increment + range]]);
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
      // Tech Stocks (Green line)
      {
        label: 'Tech Stocks',
        data: slicedTechData,
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          return chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity('#10B981', 0) },
            { stop: 1, color: adjustColorOpacity('#10B981', 0.2) }
          ]);
        },
        borderColor: '#10B981',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#0F0A2B',
        pointBorderWidth: 0,
        pointHoverBackgroundColor: '#10B981',
        pointHoverBorderColor: '#0F0A2B',
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.4,
      },
      // Energy Stocks (Red line)
      {
        label: 'Energy Stocks',
        data: slicedEnergyData,
        fill: true,
        backgroundColor: function (context: any) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          return chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity('#EF4444', 0) },
            { stop: 1, color: adjustColorOpacity('#EF4444', 0.2) }
          ]);
        },
        borderColor: '#EF4444',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#0F0A2B',
        pointBorderWidth: 0,
        pointHoverBackgroundColor: '#EF4444',
        pointHoverBorderColor: '#0F0A2B',
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-gradient-to-br from-[#1a1547]/80 via-[#16124A] to-[#1a1547]/80 shadow-lg rounded-xl border border-[#10B981]/20 hover:border-[#10B981]/40 transition-all duration-300">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Stocks Trading</h2>
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

export default DashboardCard03;
