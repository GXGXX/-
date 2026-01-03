import React, { useState } from 'react';
import InputForm from './components/InputForm';
import LifeGrid from './components/LifeGrid';
import StatsPanel from './components/StatsPanel';
import TimeStats from './components/TimeStats';
import { UserData, LifeAssumptions, LifeExpectancyData, GridStats, ParentsDetail } from './types';

const App: React.FC = () => {
  const [dataReady, setDataReady] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [assumptions, setAssumptions] = useState<LifeAssumptions | null>(null);
  const [lifeData, setLifeData] = useState<LifeExpectancyData | null>(null);
  const [gridStats, setGridStats] = useState<GridStats | null>(null);

  const calculateStats = (
    uData: UserData, 
    assump: LifeAssumptions, 
    lData: LifeExpectancyData, 
    pLifeData: LifeExpectancyData
  ): GridStats => {
    const today = new Date();
    const dob = new Date(uData.birthDate);
    const lifeExpectancy = lData.age;
    
    // Time basic units
    const passedMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    const totalMonths = Math.floor(lifeExpectancy * 12);
    const remainingMonths = Math.max(0, totalMonths - passedMonths);

    // Sleep
    const sleepMonths = remainingMonths * (assump.sleepHoursPerDay / 24);

    // Work
    const currentAge = passedMonths / 12;
    const yearsToRetire = Math.max(0, assump.retirementAge - currentAge);
    const workMonths = (yearsToRetire * 52 * assump.workDaysPerWeek * assump.workHoursPerDay) / 720;
    
    // Retirement Index (chronological)
    const retirementMonthIndex = Math.min(totalMonths - 1, Math.floor(assump.retirementAge * 12));

    // Child
    const childBirthAge = assump.childBirthAge;
    let yearsOfChildLeft = 0;
    if (currentAge < childBirthAge) {
      yearsOfChildLeft = assump.childRaisingYears; 
    } else if (currentAge < (childBirthAge + assump.childRaisingYears)) {
      yearsOfChildLeft = (childBirthAge + assump.childRaisingYears) - currentAge;
    }

    let childMonths = 0;
    if (yearsOfChildLeft > 0) {
      childMonths = (yearsOfChildLeft * 365 * assump.childHoursPerDay) / 720;
    }

    // Parents Logic Refined
    const dadDob = uData.parentFatherBirthDate ? new Date(uData.parentFatherBirthDate) : null;
    const momDob = uData.parentMotherBirthDate ? new Date(uData.parentMotherBirthDate) : null;
    
    const parentLifeExp = pLifeData.age; // Assuming generic life expectancy for parents' country

    let dadRemaining = 0;
    let momRemaining = 0;

    if (dadDob) {
      const dadAge = (today.getFullYear() - dadDob.getFullYear()) + (today.getMonth() - dadDob.getMonth())/12;
      dadRemaining = Math.max(0, parentLifeExp - dadAge);
    }
    if (momDob) {
      const momAge = (today.getFullYear() - momDob.getFullYear()) + (today.getMonth() - momDob.getMonth())/12;
      momRemaining = Math.max(0, parentLifeExp - momAge);
    }

    const maxParentRemainingYears = Math.max(dadRemaining, momRemaining);
    // Limit by user's own remaining life (cannot visit parents if user is gone)
    const effectiveParentYears = Math.min(maxParentRemainingYears, remainingMonths / 12);
    
    const parentMonths = (effectiveParentYears * 12 * assump.parentVisitDaysPerMonth) / 30.44;

    let parentLabel = '父母';
    if (dadRemaining > 0 && momRemaining > 0) {
        if (dadRemaining > momRemaining + 5) parentLabel = '父亲';
        else if (momRemaining > dadRemaining + 5) parentLabel = '母亲';
        else parentLabel = '父母';
    } else if (dadRemaining > 0) {
        parentLabel = '父亲';
    } else if (momRemaining > 0) {
        parentLabel = '母亲';
    }

    const parentsDetail: ParentsDetail = {
        dadRemaining,
        momRemaining,
        usedRemaining: effectiveParentYears,
        label: parentLabel
    };

    // Free
    const allocated = sleepMonths + workMonths + childMonths + parentMonths;
    const freeMonths = Math.max(0, remainingMonths - allocated);

    return {
      passedMonths,
      totalMonths,
      remainingMonths,
      sleepMonths,
      workMonths,
      childMonths,
      parentMonths,
      freeMonths,
      retirementMonthIndex,
      parentsDetail
    };
  };

  const handleDataReady = (
    uData: UserData, 
    assump: LifeAssumptions, 
    lData: LifeExpectancyData, 
    pLifeData: LifeExpectancyData
  ) => {
    setUserData(uData);
    setAssumptions(assump);
    setLifeData(lData);
    const stats = calculateStats(uData, assump, lData, pLifeData);
    setGridStats(stats);
    setDataReady(true);
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Life Grid</h1>
        <p className="text-gray-500 mt-2">看见时间，看见人生</p>
      </header>

      <main className="container mx-auto px-4 max-w-7xl">
        {!dataReady && (
          <InputForm 
            onDataReady={handleDataReady} 
            initialUserData={userData} 
            initialAssumptions={assumptions} 
          />
        )}

        {dataReady && userData && assumptions && lifeData && gridStats && (
          <div className="animate-fade-in-up">
            
            <TimeStats 
                birthDate={userData.birthDate} 
                lifeExpectancyYears={lifeData.age} 
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              {/* Left: Stats Panel (Bottom on mobile, Left on Desktop) */}
              <div className="xl:col-span-4 order-2 xl:order-1">
                <StatsPanel 
                  stats={gridStats} 
                  assumptions={assumptions} 
                  lifeData={lifeData} 
                />
                <button 
                   onClick={() => setDataReady(false)}
                   className="mt-6 w-full text-gray-500 text-sm hover:text-gray-800 underline transition-colors"
                >
                  重新计算
                </button>
              </div>

              {/* Right: Grid (Top on mobile, Right on Desktop) */}
              <div className="xl:col-span-8 order-1 xl:order-2">
                <LifeGrid 
                  stats={gridStats} 
                  assumptions={assumptions} 
                  userData={userData} 
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;