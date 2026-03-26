import { useEffect, useState } from 'react';

function DashboardCard07() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);

  // Dummy trading pairs data
  const tradingPairsData = [
    [
      { pair: 'EUR/USD', trades: '2.4K', volume: 387700, profit: 26700, winRate: 74.7 },
      { pair: 'BTC/USD', trades: '2.2K', volume: 342600, profit: 24900, winRate: 72.4 },
      { pair: 'GBP/JPY', trades: '2.0K', volume: 244400, profit: 22400, winRate: 70.2 },
      { pair: 'XAU/USD', trades: '1.9K', volume: 223600, profit: 22000, winRate: 68.2 },
      { pair: 'ETH/USD', trades: '1.7K', volume: 203400, profit: 20400, winRate: 65.9 },
    ],
    [
      { pair: 'EUR/USD', trades: '2.5K', volume: 392000, profit: 27200, winRate: 75.1 },
      { pair: 'BTC/USD', trades: '2.3K', volume: 348000, profit: 25400, winRate: 73.0 },
      { pair: 'GBP/JPY', trades: '2.1K', volume: 250000, profit: 23000, winRate: 71.0 },
      { pair: 'XAU/USD', trades: '2.0K', volume: 228000, profit: 22500, winRate: 69.0 },
      { pair: 'ETH/USD', trades: '1.8K', volume: 208000, profit: 21000, winRate: 66.5 },
    ],
    [
      { pair: 'EUR/USD', trades: '2.6K', volume: 396500, profit: 27700, winRate: 75.5 },
      { pair: 'BTC/USD', trades: '2.4K', volume: 353500, profit: 25900, winRate: 73.6 },
      { pair: 'GBP/JPY', trades: '2.2K', volume: 255600, profit: 23600, winRate: 71.8 },
      { pair: 'XAU/USD', trades: '2.1K', volume: 232500, profit: 23000, winRate: 69.8 },
      { pair: 'ETH/USD', trades: '1.9K', volume: 212600, profit: 21600, winRate: 67.1 },
    ],
  ];

  const [currentData, setCurrentData] = useState(tradingPairsData[0]);
  const [dataIndex, setDataIndex] = useState(0);

  // Fake update every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [counter]);

  // Update data
  useEffect(() => {
    const nextIndex = (dataIndex + 1) % tradingPairsData.length;
    setDataIndex(nextIndex);
    setCurrentData(tradingPairsData[nextIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  return (
    <div className="col-span-full xl:col-span-8 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Top Trading Pairs</h2>
        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
          <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
        </div>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-100">
            {/* Table header */}
            <thead className="text-xs uppercase text-gray-200 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xs">
              <tr>
                <th className="p-2">
                  <div className="font-semibold text-left">Pair</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Trades</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Volume</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Profit</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Win Rate</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
              {currentData.map((row, index) => (
                <tr key={index}>
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{row.pair}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-center">{row.trades}</div>
                  </td>
                  <td className="p-2">
                    <div className="text-center text-sky-500">R {row.volume.toLocaleString('en-ZA')}</div>
                  </td>
                  <td className="p-2">
                    <div className="text-center text-[#22C55E]">R {row.profit.toLocaleString('en-ZA')}</div>
                  </td>
                  <td className="p-2">
                    <div className="text-center text-sky-500">{row.winRate}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard07;
