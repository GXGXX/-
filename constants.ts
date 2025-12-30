export const DEFAULT_ASSUMPTIONS = {
  retirementAge: 60,
  sleepHoursPerDay: 8,
  workDaysPerWeek: 5,
  workHoursPerDay: 8,
  childBirthAge: 30,
  childRaisingYears: 18,
  childHoursPerDay: 5,
  parentVisitDaysPerMonth: 1,
};

export const COLORS = {
  past: '#bdc3c7',
  sleep: '#a8d8ea',
  work: '#d7b29d',
  child: '#fcbad3',
  parents: '#aa96da',
  free: '#f5f5f5', // Using a slightly visible gray for 'empty'/free slots for better visibility
  retirement: '#f1c40f',
};

export const COLOR_LABELS = {
  past: '已过去',
  sleep: '睡眠',
  work: '工作',
  child: '陪伴孩子',
  parents: '陪伴父母',
  free: '剩余自由',
  retirement: '退休时刻',
};