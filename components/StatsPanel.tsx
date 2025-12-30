import React from 'react';
import { GridStats, LifeAssumptions, LifeExpectancyData } from '../types';
import { COLORS } from '../constants';

interface Props {
  stats: GridStats;
  assumptions: LifeAssumptions;
  lifeData: LifeExpectancyData;
}

interface StatItemProps {
  color: string;
  title: string;
  children: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ color, title, children }) => (
  <div className="flex gap-3 mb-4 items-start">
    <div className="w-4 h-4 rounded-sm mt-1 shrink-0" style={{ backgroundColor: color }}></div>
    <div>
      <h4 className="font-bold text-gray-700">{title}</h4>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  </div>
);

const StatsPanel: React.FC<Props> = ({ stats, assumptions, lifeData }) => {
  const { parentsDetail } = stats;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full overflow-y-auto">
      <h3 className="text-xl font-bold mb-2 text-gray-800">统计分析</h3>
      <p className="text-xs text-gray-400 mb-6 border-b pb-2">
        数据来源: {lifeData.source} ({lifeData.year})，人均预期寿命 {lifeData.age} 岁。
      </p>

      <StatItem color={COLORS.past} title="已过去">
        你已经走过的生命。
      </StatItem>

      <StatItem color={COLORS.sleep} title="睡眠">
        如果你平均每天休息 <strong>{assumptions.sleepHoursPerDay}</strong> 小时，这是你余下生命里睡眠占用的时间。
      </StatItem>

      <StatItem color={COLORS.work} title="工作">
        如果你 <strong>{assumptions.retirementAge}</strong> 岁退休，退休前每周工作 <strong>{assumptions.workDaysPerWeek}</strong> 天，
        平均每天工作 <strong>{assumptions.workHoursPerDay}</strong> 小时，这是你余下生命里工作占用的时间。
      </StatItem>

      <StatItem color={COLORS.child} title="孩子">
        如果你 <strong>{assumptions.childBirthAge}</strong> 岁生孩子，孩子 18 岁出门上大学，
        这 18 年里你平均每天能花 <strong>{assumptions.childHoursPerDay}</strong> 个小时陪伴孩子，这里是你余下生命里所用去的时间。
      </StatItem>

      <StatItem color={COLORS.parents} title="父母">
        <p className="mb-1">
            如果你每个月能看望父母 <strong>{assumptions.parentVisitDaysPerMonth}</strong> 天。
        </p>
        {parentsDetail ? (
             <div className="bg-purple-50 p-2 rounded text-xs text-purple-800 mt-1">
                <p>基于平均寿命估算：</p>
                <ul className="list-disc list-inside opacity-80 mt-1 space-y-0.5">
                    {parentsDetail.dadRemaining > 0 && <li>父亲剩余约 {parentsDetail.dadRemaining.toFixed(1)} 年</li>}
                    {parentsDetail.momRemaining > 0 && <li>母亲剩余约 {parentsDetail.momRemaining.toFixed(1)} 年</li>}
                </ul>
                <p className="mt-1 font-medium border-t border-purple-100 pt-1">
                    系统按<strong>{parentsDetail.label}</strong>的陪伴时间 ({parentsDetail.usedRemaining.toFixed(1)}年) 计算。
                </p>
             </div>
        ) : (
            "在他们 80 岁前（基于平均寿命），这是你的余生里还能陪伴他们的时光。"
        )}
      </StatItem>

      <StatItem color={COLORS.retirement} title="退休">
         <strong>{assumptions.retirementAge}</strong> 岁，你退休了。(格子上高亮显示)
      </StatItem>

      <StatItem color={COLORS.free} title="剩余">
        除了以上之外，你剩下的所有日子。
      </StatItem>
    </div>
  );
};

export default StatsPanel;