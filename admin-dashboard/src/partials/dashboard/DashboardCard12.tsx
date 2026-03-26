import { useEffect, useState } from 'react';

function DashboardCard12() {
  // Fake real-time data
  const [counter, setCounter] = useState(0);

  // Dummy activity data
  const activitiesData = [
    {
      today: [
        { type: 'bot', icon: 'comment', color: 'bg-[#2F6BFF]', text: 'Bot Scalper Pro opened EUR/USD trade', link: 'View' },
        { type: 'loss', icon: 'minus', color: 'bg-[#EF4444]', text: 'Trade BTC/USD closed with loss by Stop Loss', link: 'View' },
        { type: 'profit', icon: 'arrows', color: 'bg-[#22C55E]', text: 'Trend Follower bot reached profit target', link: 'View' },
      ],
      yesterday: [
        { type: 'trades', icon: 'shuffle', color: 'bg-sky-500', text: '240+ trades executed by Trading Bots', link: 'View' },
        { type: 'milestone', icon: 'comment', color: 'bg-[#2F6BFF]', text: 'Portfolio reached new high of R 45,280', link: 'View' },
      ],
    },
    {
      today: [
        { type: 'bot', icon: 'comment', color: 'bg-[#2F6BFF]', text: 'Bot Momentum Trader opened GBP/JPY trade', link: 'View' },
        { type: 'profit', icon: 'arrows', color: 'bg-[#22C55E]', text: 'Trade XAU/USD closed with profit', link: 'View' },
        { type: 'bot', icon: 'comment', color: 'bg-[#2F6BFF]', text: 'Scalper Pro opened ETH/USD trade', link: 'View' },
      ],
      yesterday: [
        { type: 'trades', icon: 'shuffle', color: 'bg-sky-500', text: '265+ trades executed by Trading Bots', link: 'View' },
        { type: 'milestone', icon: 'comment', color: 'bg-[#2F6BFF]', text: 'Portfolio reached new high of R 46,120', link: 'View' },
      ],
    },
    {
      today: [
        { type: 'profit', icon: 'arrows', color: 'bg-[#22C55E]', text: 'Trade EUR/USD closed with profit', link: 'View' },
        { type: 'bot', icon: 'comment', color: 'bg-[#2F6BFF]', text: 'Bot Range Trader opened USD/JPY trade', link: 'View' },
        { type: 'profit', icon: 'arrows', color: 'bg-[#22C55E]', text: 'Breakout bot reached profit target', link: 'View' },
      ],
      yesterday: [
        { type: 'trades', icon: 'shuffle', color: 'bg-sky-500', text: '280+ trades executed by Trading Bots', link: 'View' },
        { type: 'milestone', icon: 'comment', color: 'bg-[#2F6BFF]', text: 'Portfolio reached new high of R 47,050', link: 'View' },
      ],
    },
  ];

  const [currentData, setCurrentData] = useState(activitiesData[0]);
  const [dataIndex, setDataIndex] = useState(0);

  // Fake update every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, [counter]);

  // Update data
  useEffect(() => {
    const nextIndex = (dataIndex + 1) % activitiesData.length;
    setDataIndex(nextIndex);
    setCurrentData(activitiesData[nextIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counter]);

  const getIcon = (iconType: string) => {
    if (iconType === 'comment') {
      return <path d="M18 10c-4.4 0-8 3.1-8 7s3.6 7 8 7h.6l5.4 2v-4.4c1.2-1.2 2-2.8 2-4.6 0-3.9-3.6-7-8-7zm4 10.8v2.3L18.9 22H18c-3.3 0-6-2.2-6-5s2.7-5 6-5 6 2.2 6 5c0 2.2-2 3.8-2 3.8z" />;
    } else if (iconType === 'minus') {
      return <path d="M25 24H11a1 1 0 01-1-1v-5h2v4h12v-4h2v5a1 1 0 01-1 1zM14 13h8v2h-8z" />;
    } else if (iconType === 'arrows') {
      return <path d="M15 13v-3l-5 4 5 4v-3h8a1 1 0 000-2h-8zM21 21h-8a1 1 0 000 2h8v3l5-4-5-4v3z" />;
    } else {
      return <path d="M23 11v2.085c-2.841.401-4.41 2.462-5.8 4.315-1.449 1.932-2.7 3.6-5.2 3.6h-1v2h1c3.5 0 5.253-2.338 6.8-4.4 1.449-1.932 2.7-3.6 5.2-3.6h3l-4-4zM15.406 16.455c.066-.087.125-.162.194-.254.314-.419.656-.872 1.033-1.33C15.475 13.802 14.038 13 12 13h-1v2h1c1.471 0 2.505.586 3.406 1.455zM24 21c-1.471 0-2.505-.586-3.406-1.455-.066.087-.125.162-.194.254-.316.422-.656.873-1.028 1.328.959.878 2.108 1.573 3.628 1.788V25l4-4h-3z" />;
    }
  };

  return (
    <div className="col-span-full xl:col-span-6 bg-[#16124A] shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-[#16124A]/60 flex items-center gap-2">
        <h2 className="font-semibold text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]">Recent Trading Activity</h2>
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
            {currentData.today.map((activity, index) => (
              <li key={index} className="flex px-2">
                <div className={`w-9 h-9 rounded-full shrink-0 ${activity.color} my-2 mr-3`}>
                  <svg className="w-9 h-9 fill-current text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]" viewBox="0 0 36 36">
                    {getIcon(activity.icon)}
                  </svg>
                </div>
                <div className={`grow flex items-center ${index < currentData.today.length - 1 ? 'border-b border-gray-100 dark:border-[#16124A]/60' : ''} text-sm py-2`}>
                  <div className="grow flex justify-between">
                    <div className="self-center">{activity.text}</div>
                    <div className="shrink-0 self-end ml-2">
                      <a className="font-medium text-[#2F6BFF] hover:text-violet-600 dark:hover:text-violet-400" href="#0">{activity.link}<span className="hidden sm:inline"> -&gt;</span></a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* "Yesterday" group */}
        <div>
          <header className="text-xs uppercase text-gray-200 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xs font-semibold p-2">Yesterday</header>
          <ul className="my-1">
            {currentData.yesterday.map((activity, index) => (
              <li key={index} className="flex px-2">
                <div className={`w-9 h-9 rounded-full shrink-0 ${activity.color} my-2 mr-3`}>
                  <svg className="w-9 h-9 fill-current text-[#efdede] drop-shadow-[0_0_4px_rgba(160,167,181,0.25)]" viewBox="0 0 36 36">
                    {getIcon(activity.icon)}
                  </svg>
                </div>
                <div className={`grow flex items-center ${index < currentData.yesterday.length - 1 ? 'border-b border-gray-100 dark:border-[#16124A]/60' : ''} text-sm py-2`}>
                  <div className="grow flex justify-between">
                    <div className="self-center">{activity.text}</div>
                    <div className="shrink-0 self-end ml-2">
                      <a className="font-medium text-[#2F6BFF] hover:text-violet-600 dark:hover:text-violet-400" href="#0">{activity.link}<span className="hidden sm:inline"> -&gt;</span></a>
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

export default DashboardCard12;
