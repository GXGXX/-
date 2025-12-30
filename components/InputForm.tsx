import React, { useState } from 'react';
import { UserData, LifeAssumptions, LifeExpectancyData } from '../types';
import { DEFAULT_ASSUMPTIONS } from '../constants';
import { fetchLifeExpectancy } from '../services/geminiService';

interface Props {
  onDataReady: (
    userData: UserData, 
    assumptions: LifeAssumptions, 
    lifeData: LifeExpectancyData,
    parentLifeData: LifeExpectancyData
  ) => void;
  initialUserData?: UserData | null;
  initialAssumptions?: LifeAssumptions | null;
}

const DateSelector = ({ value, onChange, className = "" }: { value: string, onChange: (val: string) => void, className?: string }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    const [yStr, mStr, dStr] = value ? value.split('-') : ['', '', ''];
    const y = yStr ? parseInt(yStr) : '';
    const m = mStr ? parseInt(mStr) : '';
    const d = dStr ? parseInt(dStr) : '';

    const getDays = (year: number | '', month: number | '') => {
        if (!year || !month) return 31;
        return new Date(year, month, 0).getDate();
    };
    const daysInMonth = getDays(y, m);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const onSelect = (type: 'y'|'m'|'d', val: number) => {
        let nextY = y || currentYear;
        let nextM = m || 1;
        let nextD = d || 1;
        
        if (type === 'y') nextY = val;
        if (type === 'm') nextM = val;
        if (type === 'd') nextD = val;

        const maxDays = new Date(nextY, nextM, 0).getDate();
        const clampedD = Math.min(nextD, maxDays);

        const formatted = `${nextY}-${String(nextM).padStart(2, '0')}-${String(clampedD).padStart(2, '0')}`;
        onChange(formatted);
    };

    const ArrowIcon = () => (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
             <span className="material-symbols-outlined text-xl select-none">keyboard_arrow_down</span>
        </div>
    );

    const containerClass = "relative bg-gray-700 border border-gray-600 rounded-lg hover:border-gray-500 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all group";
    const selectClass = "w-full bg-transparent text-white py-3 pl-3 pr-10 outline-none appearance-none cursor-pointer text-sm font-medium z-10 relative rounded-lg";

    return (
        <div className={`flex gap-3 ${className}`}>
            <div className={`${containerClass} flex-[1.4]`}>
                <select 
                    value={y || ''} 
                    onChange={e => onSelect('y', Number(e.target.value))}
                    className={selectClass}
                >
                    <option value="" disabled className="text-gray-400">年份</option>
                    {years.map(yr => <option key={yr} value={yr} className="bg-gray-700">{yr}年</option>)}
                </select>
                <ArrowIcon />
            </div>
            <div className={`${containerClass} flex-1`}>
                <select 
                     value={m || ''} 
                     onChange={e => onSelect('m', Number(e.target.value))}
                     className={selectClass}
                >
                    <option value="" disabled className="text-gray-400">月份</option>
                    {months.map(mo => <option key={mo} value={mo} className="bg-gray-700">{mo}月</option>)}
                </select>
                 <ArrowIcon />
            </div>
            <div className={`${containerClass} flex-1`}>
                <select 
                     value={d || ''} 
                     onChange={e => onSelect('d', Number(e.target.value))}
                     className={selectClass}
                >
                    <option value="" disabled className="text-gray-400">日期</option>
                    {days.map(dy => <option key={dy} value={dy} className="bg-gray-700">{dy}日</option>)}
                </select>
                 <ArrowIcon />
            </div>
        </div>
    );
}

const InputForm: React.FC<Props> = ({ onDataReady, initialUserData, initialAssumptions }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserData>(initialUserData || {
    birthDate: '',
    gender: 'male',
    parentFatherBirthDate: '',
    parentMotherBirthDate: '',
  });

  const [assumptions, setAssumptions] = useState<LifeAssumptions>(initialAssumptions || DEFAULT_ASSUMPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (field: keyof UserData, val: string) => {
    setUserData(prev => ({ ...prev, [field]: val }));
  };

  const handleAssumptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssumptions({ ...assumptions, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.birthDate) {
      setError("请输入您的出生日期");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const userLifeData = await fetchLifeExpectancy(userData.gender);
      const parentLifeData = await fetchLifeExpectancy('general population');

      onDataReady(userData, assumptions, userLifeData, parentLifeData);
    } catch (err) {
      setError("获取数据失败，请检查网络连接。");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition placeholder-gray-400 text-sm appearance-none";
  const labelClass = "block text-gray-700 text-sm mb-1 font-bold tracking-wide";

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg mx-auto border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">人生格子</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">基础信息</h3>
          <div>
            <label className={labelClass}>出生日期</label>
            <DateSelector 
                value={userData.birthDate} 
                onChange={(val) => handleDateChange('birthDate', val)} 
            />
          </div>
          <div>
            <label className={labelClass}>性别</label>
            <div className="relative">
              <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleUserChange}
                  className={inputClass}
              >
                  <option value="male" className="bg-gray-700">男</option>
                  <option value="female" className="bg-gray-700">女</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <span className="material-symbols-outlined text-xl">keyboard_arrow_down</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 pt-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">父母信息</h3>
          <div className="grid grid-cols-1 gap-4">
             <div>
                <label className={labelClass}>父亲生日</label>
                <DateSelector 
                    value={userData.parentFatherBirthDate} 
                    onChange={(val) => handleDateChange('parentFatherBirthDate', val)} 
                />
             </div>
             <div>
                <label className={labelClass}>母亲生日</label>
                <DateSelector 
                    value={userData.parentMotherBirthDate} 
                    onChange={(val) => handleDateChange('parentMotherBirthDate', val)} 
                />
             </div>
          </div>
        </div>

        <div className="pt-2">
           <button 
             type="button" 
             onClick={() => setShowAdvanced(!showAdvanced)}
             className="text-blue-600 text-sm hover:text-blue-700 flex items-center font-bold transition-colors"
           >
             <span className="material-symbols-outlined text-lg mr-1 transform transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}>
               expand_more
             </span>
             {showAdvanced ? '收起生活假设' : '调整生活假设'}
           </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 bg-gray-50 p-5 rounded-xl animate-fade-in text-sm border border-gray-200 shadow-inner">
             <div className="grid grid-cols-2 gap-4">
               {[
                 { label: "退休年龄 (岁)", name: "retirementAge" },
                 { label: "睡眠 (小时/天)", name: "sleepHoursPerDay" },
                 { label: "工作 (天/周)", name: "workDaysPerWeek" },
                 { label: "工作 (小时/天)", name: "workHoursPerDay" },
                 { label: "生子年龄 (岁)", name: "childBirthAge" },
                 { label: "陪伴父母 (天/月)", name: "parentVisitDaysPerMonth" },
               ].map((field) => (
                   <div key={field.name}>
                     <label className="block text-gray-500 text-xs font-semibold mb-1.5">{field.label}</label>
                     <input 
                        type="number" 
                        name={field.name} 
                        value={(assumptions as any)[field.name]} 
                        onChange={handleAssumptionChange} 
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition text-gray-700 font-medium" 
                     />
                   </div>
               ))}
             </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
        </p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-800 text-white p-4 rounded-xl font-bold text-lg hover:bg-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-md active:scale-[0.98]"
        >
          {loading ? (
             <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          ) : '生成人生格子'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;