import React, { useState, useEffect, useRef } from 'react';
import { GridStats, LifeAssumptions, UserData } from '../types';
import { COLORS, COLOR_LABELS } from '../constants';

interface Props {
  stats: GridStats;
  assumptions: LifeAssumptions;
  userData: UserData;
}

const LifeGrid: React.FC<Props> = ({ stats, assumptions, userData }) => {
  const { totalMonths, passedMonths, retirementMonthIndex, sleepMonths, workMonths, childMonths, parentMonths } = stats;
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (tooltip) {
      timeout = setTimeout(() => {
        setTooltip(null);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [tooltip]);

  const getGridCategoryKey = (index: number): keyof typeof COLORS => {
    if (index < passedMonths) return 'past';

    let relativeIndex = index - passedMonths;

    if (relativeIndex < sleepMonths) return 'sleep';
    relativeIndex -= sleepMonths;

    if (relativeIndex < workMonths) return 'work';
    relativeIndex -= workMonths;

    if (relativeIndex < childMonths) return 'child';
    relativeIndex -= childMonths;

    if (relativeIndex < parentMonths) return 'parents';
    
    return 'free';
  };

  const getGridColor = (index: number): string => {
    return COLORS[getGridCategoryKey(index)];
  };

  const handleCellClick = (e: React.MouseEvent, index: number) => {
    const categoryKey = getGridCategoryKey(index);
    let label = COLOR_LABELS[categoryKey];
    
    // Customize text slightly based on category
    let text = `这是${label}的时间`;
    if (categoryKey === 'past') text = "这是已过去的时间";
    if (index === retirementMonthIndex) text = "退休时刻！";

    if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const cellRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        
        // Calculate position relative to the container
        // Center of cell relative to container left
        const x = cellRect.left - containerRect.left + cellRect.width / 2;
        // Top of cell relative to container top
        const y = cellRect.top - containerRect.top;

        setTooltip({ x, y, text });
    }
  };

  const grids = Array.from({ length: Math.ceil(totalMonths) }, (_, i) => {
    const isRetirement = i === retirementMonthIndex;
    return (
      <div
        key={i}
        onClick={(e) => handleCellClick(e, i)}
        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-[1px] relative hover:opacity-80 transition-opacity cursor-pointer`}
        style={{ backgroundColor: getGridColor(i) }}
      >
        {isRetirement && (
          <div className="absolute inset-0 border-2 border-yellow-400 rounded-sm z-10 shadow-[0_0_5px_rgba(241,196,15,0.8)] pointer-events-none"></div>
        )}
      </div>
    );
  });

  return (
    <div ref={containerRef} className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">你的 {Math.floor(totalMonths / 12)} 年人生</h3>
        <div className="text-sm text-gray-500">1 格 = 1 个月</div>
      </div>
      
      <div className="flex flex-wrap gap-[2px] sm:gap-1 content-start justify-start">
        {grids}
      </div>
      
      <div className="mt-6 text-center text-gray-500 text-sm italic">
        "人生不过900个月。"
      </div>

      {/* Tooltip - Absolute positioning relative to container */}
      {tooltip && (
        <div 
          className="absolute z-50 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-opacity"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y - 8, // slight offset up
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {tooltip.text}
          {/* Arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800"></div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -80%); }
          to { opacity: 1; transform: translate(-50%, -100%); }
        }
      `}</style>
    </div>
  );
};

export default LifeGrid;