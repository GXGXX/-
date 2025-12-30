import React, { useState, useEffect } from 'react';

interface Props {
  birthDate: string;
  lifeExpectancyYears: number;
}

const TimeStats: React.FC<Props> = ({ birthDate, lifeExpectancyYears }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(timer);
  }, []);

  const birth = new Date(birthDate);
  const death = new Date(birth.getTime());
  // Calculate death date roughly by adding years.
  // Using a simplified model where lifeExpectancyYears is purely additive to birth year
  death.setFullYear(death.getFullYear() + Math.floor(lifeExpectancyYears));
  // Add remaining fraction of a year
  const remainder = lifeExpectancyYears % 1;
  if (remainder > 0) {
      death.setTime(death.getTime() + (remainder * 365.2425 * 24 * 60 * 60 * 1000));
  }
  
  const msPassed = now.getTime() - birth.getTime();
  const msRemaining = death.getTime() - now.getTime();

  const MS_IN_SEC = 1000;
  const MS_IN_MIN = 60 * 1000;
  const MS_IN_HOUR = 60 * 60 * 1000;
  const MS_IN_DAY = 24 * 60 * 60 * 1000;
  const MS_IN_YEAR = 365.2425 * MS_IN_DAY;
  const MS_IN_MONTH = MS_IN_YEAR / 12;

  const StatItem = ({ value, unit }: { value: number, unit: string }) => (
      <div className="flex items-baseline justify-center sm:justify-start gap-1">
          <span className="text-xl sm:text-2xl font-light text-gray-800 tabular-nums tracking-tight">
              {value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span className="text-sm text-gray-400 font-normal">{unit}</span>
      </div>
  );

  const Card = ({ title, ms }: { title: string, ms: number }) => {
      const val = Math.max(0, ms);
      return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>
            <div className="space-y-4">
                {/* Row 1: Years, Months, Days */}
                <div className="grid grid-cols-3 gap-2 border-b border-gray-50 pb-4">
                    <StatItem value={val / MS_IN_YEAR} unit="年" />
                    <StatItem value={val / MS_IN_MONTH} unit="月" />
                    <StatItem value={val / MS_IN_DAY} unit="日" />
                </div>
                {/* Row 2: Hours, Minutes, Seconds */}
                <div className="grid grid-cols-3 gap-2">
                    <StatItem value={val / MS_IN_HOUR} unit="时" />
                    <StatItem value={val / MS_IN_MIN} unit="分" />
                    <StatItem value={val / MS_IN_SEC} unit="秒" />
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Card title="已过去的时间" ms={msPassed} />
        <Card title="剩下的时间" ms={msRemaining} />
    </div>
  );
};

export default TimeStats;