import { useEffect, useState } from 'react';

function DashboardCard10() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);

  // Dummy top trades data
  const tradesData = [
    [
      { pair: 'EUR/USD', type: 'Buy', profit: 2890, time: '2 min ago', status: 'Won' },
      { pair: 'BTC/USD', type: 'Sell', profit: 2767, time: '5 min ago', status: 'Won' },
      { pair: 'GBP/JPY', type: 'Buy', profit: 2996, time: '8 min ago', status: 'Won' },
      { pair: 'XAU/USD', type: 'Buy', profit: 1220, time: '12 min ago', status: 'Won' },
      { pair: 'ETH/USD', type: 'Sell', profit: 1890, time: '15 min ago', status: 'Won' },
    ],
    [
      { pair: 'EUR/USD', type: 'Sell', profit: 3100, time: '1 min ago', status: 'Won' },
      { pair: 'BTC/USD', type: 'Buy', profit: 2950, time: '4 min ago', status: 'Won' },
      { pair: 'GBP/JPY', type: 'Sell', profit: 3200, time: '7 min ago', status: 'Won' },
      { pair: 'XAU/USD', type: 'Buy', profit: 1450, time: '10 min ago', status: 'Won' },
      { pair: 'ETH/USD', type: 'Buy', profit: 2100, time: '13 min ago', status: 'Won' },
    ],
    [
      { pair: 'EUR/USD', type: 'Buy', profit: 3300, time: 'Just now', status: 'Won' },
      { pair: 'BTC/USD', type: 'Sell', profit: 3150, time: '3 min ago', status: 'Won' },
      { pair: 'GBP/JPY', type: 'Buy', profit: 3400, time: '6 min ago', status: 'Won' },
      { pair: 'XAU/USD', type: 'Sell', profit: 1680, time: '9 min ago', status: 'Won' },
      { pair: 'ETH/USD', type: 'Buy', profit: 2300, time: '11 min ago', status: 'Won' },
    ],
  ];

  const [currentData, setCurrentData] = useState(tradesData[0]);
  const [dataIndex, setDataIndex] = useState(0);

  // Fake update every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [counter]);

  // Update data
  useEffect(() => {
    const nextIndex = (dataIndex + 1) % tradesData.length;
    setDataIndex(nextIndex);
    setCurrentData(tradesData[nextIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  return (
    <div className="col-span-full xl:col-span-6 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Top Trades</h2>
        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
          <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
        </div>
      </header>
      <div className="p-3">

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-gray-200 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Pair</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Type</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-left">Profit</div>
                </th>
                <th className="p-2 whitespace-nowrap">
                  <div className="font-semibold text-center">Time</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {currentData.map((trade, index) => (
                <tr key={index}>
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="font-medium text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">{trade.pair}</div>
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className={`text-left font-medium ${trade.type === 'Buy' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      {trade.type}
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="text-left font-medium text-[#22C55E]">R {trade.profit.toLocaleString('en-ZA')}</div>
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <div className="text-center text-gray-400">{trade.time}</div>
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

export default DashboardCard10;
