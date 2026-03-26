import { useEffect, useState } from 'react';

function DashboardCard13() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);

  // Dummy deposits/withdrawals data
  const transactionsData = [
    [
      { type: 'withdrawal', amount: -4988, text: 'Withdrawal to bank account', color: 'bg-[#EF4444]', icon: 'left' },
      { type: 'deposit', amount: 24988, text: 'Deposit from FNB Account', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'profit', amount: 9999, text: 'Trading Profit credited', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'deposit', amount: 12088, text: 'Deposit from Capitec', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'pending', amount: 9999, text: 'Withdrawal pending approval', color: 'bg-gray-200', icon: 'cancel', pending: true },
      { type: 'fee', amount: -498, text: 'Trading Fee deducted', color: 'bg-[#EF4444]', icon: 'left' },
    ],
    [
      { type: 'deposit', amount: 18500, text: 'Deposit from Standard Bank', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'profit', amount: 12450, text: 'Trading Profit credited', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'withdrawal', amount: -6200, text: 'Withdrawal to bank account', color: 'bg-[#EF4444]', icon: 'left' },
      { type: 'deposit', amount: 15000, text: 'Deposit from Nedbank', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'fee', amount: -550, text: 'Trading Fee deducted', color: 'bg-[#EF4444]', icon: 'left' },
      { type: 'profit', amount: 8750, text: 'Bot Trading Profit', color: 'bg-[#22C55E]', icon: 'right' },
    ],
    [
      { type: 'deposit', amount: 22000, text: 'Deposit from FNB Account', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'withdrawal', amount: -5500, text: 'Withdrawal to bank account', color: 'bg-[#EF4444]', icon: 'left' },
      { type: 'profit', amount: 11200, text: 'Trading Profit credited', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'deposit', amount: 9800, text: 'Deposit from Absa', color: 'bg-[#22C55E]', icon: 'right' },
      { type: 'pending', amount: 7500, text: 'Withdrawal pending approval', color: 'bg-gray-200', icon: 'cancel', pending: true },
      { type: 'fee', amount: -620, text: 'Trading Fee deducted', color: 'bg-[#EF4444]', icon: 'left' },
    ],
  ];

  const [currentData, setCurrentData] = useState(transactionsData[0]);
  const [dataIndex, setDataIndex] = useState(0);

  // Fake update every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 7000);
    return () => clearInterval(interval);
  }, [counter]);

  // Update data
  useEffect(() => {
    const nextIndex = (dataIndex + 1) % transactionsData.length;
    setDataIndex(nextIndex);
    setCurrentData(transactionsData[nextIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  const getIcon = (iconType: string) => {
    if (iconType === 'left') {
      return <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />;
    } else if (iconType === 'right') {
      return <path d="M18.3 11.3l-1.4 1.4 4.3 4.3H11v2h10.2l-4.3 4.3 1.4 1.4L25 18z" />;
    } else {
      return <path d="M21.477 22.89l-8.368-8.367a6 6 0 008.367 8.367zm1.414-1.413a6 6 0 00-8.367-8.367l8.367 8.367zM18 26a8 8 0 110-16 8 8 0 010 16z" />;
    }
  };

  return (
    <div className="col-span-full xl:col-span-6 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Deposits/Withdrawals</h2>
        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></div>
          <span className="text-[8px] text-green-400 uppercase font-bold">Live</span>
        </div>
      </header>
      <div className="p-3">

        {/* Card content */}
        {/* "Today" group */}
        <div>
          <header className="text-xs uppercase text-gray-200 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xs font-semibold p-2">Today</header>
          <ul className="my-1">
            {currentData.map((transaction, index) => (
              <li key={index} className="flex px-2">
                <div className={`w-9 h-9 rounded-full shrink-0 ${transaction.color} my-2 mr-3`}>
                  <svg className="w-9 h-9 fill-current ${transaction.icon === 'cancel' ? 'text-gray-200' : 'text-[#efdede]'}" viewBox="0 0 36 36">
                    {getIcon(transaction.icon)}
                  </svg>
                </div>
                <div className={`grow flex items-center ${index < currentData.length - 1 ? 'border-b border-gray-100 dark:border-[#16124A]/60' : ''} text-sm py-2`}>
                  <div className="grow flex justify-between">
                    <div className="self-center">
                      <a className="font-medium text-[#efdede] hover:text-[#efdede] dark:text-gray-100 dark:hover:text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]" href="#0">
                        {transaction.text.split(' ')[0]}
                      </a> {transaction.text.substring(transaction.text.indexOf(' ') + 1)}
                    </div>
                    <div className="shrink-0 self-start ml-2">
                      <span className={`font-medium ${transaction.pending
                        ? 'text-[#efdede] line-through'
                        : transaction.amount >= 0
                          ? 'text-green-600'
                          : 'text-white font-semibold'
                        }`}>
                        {transaction.amount >= 0 ? '+' : ''}R {Math.abs(transaction.amount).toLocaleString('en-ZA')}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default DashboardCard13;
