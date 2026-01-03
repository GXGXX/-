import React, { useState, useEffect } from 'react';

interface Props {
  birthDate: string;
  lifeExpectancyYears: number;
}

const TimeStats: React.FC<Props> = ({ birthDate, lifeExpectancyYears }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); // Update every second is enough now
    return () => clearInterval(timer);
  }, []);

  const birth = new Date(birthDate);
  const death = new Date(birth.getTime());
  // Calculate death date roughly by adding years.
  death.setFullYear(death.getFullYear() + Math.floor(lifeExpectancyYears));
  // Add remaining fraction of a year
  const remainder = lifeExpectancyYears % 1;
  if (remainder > 0) {
      death.setTime(death.getTime() + (remainder * 365.2425 * 24 * 60 * 60 * 1000));
  }
  
  const msPassed = now.getTime() - birth.getTime();
  const msRemaining = death.getTime() - now.getTime();

  const MS_IN_MIN = 60 * 1000;
  const MS_IN_HOUR = 60 * 60 * 1000;
  const MS_IN_DAY = 24 * 60 * 60 * 1000;
  const MS_IN_YEAR = 365.2425 * MS_IN_DAY;
  const MS_IN_MONTH = MS_IN_YEAR / 12;

  const StatItem = ({ value, unit }: { value: number, unit: string }) => (
      <div className="flex items-baseline justify-start gap-1 min-w-0 overflow-hidden">
          <span className="text-lg md:text-2xl font-light text-gray-800 tabular-nums tracking-tight truncate block max-w-full">
              {value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span className="text-sm text-gray-400 font-normal whitespace-nowrap">{unit}</span>
      </div>
  );

  const Card = ({ title, ms }: { title: string, ms: number }) => {
      const val = Math.max(0, ms);
      return (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg border border-gray-100 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 mb-4 sm:mb-6">{title}</h3>
            <div className="space-y-4">
                {/* Row 1: Years, Months, Days - usually fit on one line or 3 cols */}
                <div className="grid grid-cols-3 gap-2 border-b border-gray-50 pb-4">
                    <StatItem value={val / MS_IN_YEAR} unit="年" />
                    <StatItem value={val / MS_IN_MONTH} unit="月" />
                    <StatItem value={val / MS_IN_DAY} unit="日" />
                </div>
                {/* Row 2: Hours, Minutes - Stack on mobile, side-by-side on tablet+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <StatItem value={val / MS_IN_HOUR} unit="时" />
                    <StatItem value={val / MS_IN_MIN} unit="分" />
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6">
        <Card title="已过去的时间" ms={msPassed} />
        <Card title="剩下的时间" ms={msRemaining} />
    </div>
  );
};

export default TimeStats;