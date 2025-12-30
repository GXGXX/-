export interface UserData {
  birthDate: string;
  gender: 'male' | 'female';
  parentFatherBirthDate: string;
  parentMotherBirthDate: string;
}

export interface LifeAssumptions {
  retirementAge: number;
  sleepHoursPerDay: number;
  workDaysPerWeek: number;
  workHoursPerDay: number;
  childBirthAge: number;
  childRaisingYears: number;
  childHoursPerDay: number;
  parentVisitDaysPerMonth: number;
}

export interface LifeExpectancyData {
  age: number;
  source: string;
  year: string;
  country: string;
  gender: string;
}

export interface ParentsDetail {
  dadRemaining: number;
  momRemaining: number;
  usedRemaining: number;
  label: string; // e.g., "Mother" or "Longer living parent"
}

export interface GridStats {
  passedMonths: number;
  totalMonths: number;
  remainingMonths: number;
  sleepMonths: number;
  workMonths: number;
  childMonths: number;
  parentMonths: number;
  freeMonths: number;
  retirementMonthIndex: number;
  parentsDetail: ParentsDetail;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}