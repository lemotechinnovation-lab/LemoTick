import { useEffect, useState } from 'react';
import BarChart from '../../charts/BarChart01';

// Import utilities

function DashboardCard04() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(6);

  // Dummy manual trading data
  const manualData = [
    800, 1600, 900, 1300, 1950, 1700, 1400, 1800, 1200, 1600,
    2100, 1900, 1500, 1700, 1300, 1900, 2200, 2000, 1600, 1800,
  ];

  // Dummy bot trading data
  const botData = [
    4900, 2600, 5350, 4800, 5200, 4800, 5100, 5400, 5600, 5300,
    5500, 5700, 5900, 6100, 5800, 6000, 6200, 6400, 6600, 6800,
  ];

  const [slicedManualData, setSlicedManualData] = useState(manualData.slice(0, range));
  const [slicedBotData, setSlicedBotData] = useState(botData.slice(0, range));

  // Generate fake dates
  const generateDates = () => {
    const now = new Date();
    const dates: string[] = [];
    manualData.forEach((_, i) => {
      const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000); // 30 days apart
      dates.push(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }));
    });
    return dates;
  };

  const [slicedLabels, setSlicedLabels] = useState(generateDates().slice(0, range).reverse());

  // Fake update every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [counter]);

  // Loop through data array and update
  useEffect(() => {
    setIncrement(increment + 1);
    if (increment + range < manualData.length) {
      setSlicedManualData(([, ...rest]) => [...rest, manualData[increment + range]]);
      setSlicedBotData(([, ...rest]) => [...rest, botData[increment + range]]);
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
        label: 'Manual',
        data: slicedManualData,
        backgroundColor: '#2F6BFF',
        hoverBackgroundColor: '#2557c9',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      // Blue bars
      {
        label: 'Bot',
        data: slicedBotData,
        backgroundColor: '#FFA62B',
        hoverBackgroundColor: '#e6941f',
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Manual VS Bot Trading</h2>
        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
          <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
        </div>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <BarChart data={chartData} width={595} height={248} />
    </div>
  );
}

export default DashboardCard04;
