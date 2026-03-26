import { useEffect, useState } from 'react';
import LineChart from '../../charts/LineChart02';

// Import utilities
import { getCssVariable } from '../../utils/Utils';

function DashboardCard08() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);
  const [increment, setIncrement] = useState(0);
  const [range, setRange] = useState(26);

  // Dummy portfolio growth data
  const currentData = [73, 64, 73, 69, 104, 104, 164, 164, 120, 120, 120, 148, 142, 104, 122, 110, 104, 152, 166, 233, 268, 252, 284, 284, 333, 323, 340, 355, 370, 385];
  const previousData = [184, 86, 42, 378, 42, 243, 38, 120, 0, 0, 42, 0, 84, 0, 276, 0, 124, 42, 124, 88, 88, 215, 156, 88, 124, 64, 80, 95, 110, 125];
  const averageData = [122, 170, 192, 86, 102, 124, 115, 115, 56, 104, 0, 72, 208, 186, 223, 188, 114, 162, 200, 150, 118, 118, 76, 122, 230, 268, 285, 300, 315, 330];

  const [slicedCurrent, setSlicedCurrent] = useState(currentData.slice(0, range));
  const [slicedPrevious, setSlicedPrevious] = useState(previousData.slice(0, range));
  const [slicedAverage, setSlicedAverage] = useState(averageData.slice(0, range));

  // Generate fake dates
  const generateDates = () => {
    const now = new Date();
    const dates: string[] = [];
    currentData.forEach((_, i) => {
      const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
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
    if (increment + range < currentData.length) {
      setSlicedCurrent(([, ...rest]) => [...rest, currentData[increment + range]]);
      setSlicedPrevious(([, ...rest]) => [...rest, previousData[increment + range]]);
      setSlicedAverage(([, ...rest]) => [...rest, averageData[increment + range]]);
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
      // Indigo line
      {
        label: 'Current',
        data: slicedCurrent,
        borderColor: getCssVariable('--color-violet-500'),
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable('--color-violet-500'),
        pointHoverBackgroundColor: getCssVariable('--color-violet-500'),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
      // Blue line
      {
        label: 'Previous',
        data: slicedPrevious,
        borderColor: getCssVariable('--color-sky-500'),
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable('--color-sky-500'),
        pointHoverBackgroundColor: getCssVariable('--color-sky-500'),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
      // green line
      {
        label: 'Average',
        data: slicedAverage,
        borderColor: getCssVariable('--color-green-500'),
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable('--color-green-500'),
        pointHoverBackgroundColor: getCssVariable('--color-green-500'),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Portfolio Growth Over Time</h2>
        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
          <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
        </div>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <LineChart data={chartData} width={595} height={248} />
    </div>
  );
}

export default DashboardCard08;
