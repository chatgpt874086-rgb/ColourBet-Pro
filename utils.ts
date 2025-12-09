import { GameMode, GamePeriod } from "./types";

export const generateUID = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper to get period ID from a date object and mode
const getPeriodIdFromDate = (date: Date, mode: GameMode): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const totalSeconds = totalMinutes * 60 + date.getSeconds();
  
  let index;
  if (mode === 'FAST') {
      index = Math.floor(totalSeconds / 30);
  } else if (mode === 'PRO') {
      index = Math.floor(totalSeconds / 180);
  } else {
      index = totalMinutes;
  }
  
  return `${year}${month}${day}${mode === 'FAST' ? 'F' : mode === 'PRO' ? 'P' : 'S'}${index.toString().padStart(4, '0')}`;
};

export const generatePeriodId = (mode: GameMode): string => {
  return getPeriodIdFromDate(new Date(), mode);
};

export const calculateResultColors = (number: number): string[] => {
  if (number === 0) return ['red', 'violet'];
  if (number === 5) return ['green', 'violet'];
  if ([1, 3, 7, 9].includes(number)) return ['green'];
  return ['red'];
};

export const calculateResultSize = (number: number): 'big' | 'small' => {
    return number >= 5 ? 'big' : 'small';
};

export const getResultColorClass = (colors: string[] | null) => {
    if (!colors) return 'bg-slate-700';
    if (colors.length === 2) return 'bg-gradient-to-r from-red-500 to-violet-500'; // 0
    if (colors.includes('violet') && colors.includes('green')) return 'bg-gradient-to-r from-green-500 to-violet-500'; // 5
    if (colors.includes('green')) return 'bg-emerald-500';
    if (colors.includes('red')) return 'bg-rose-500';
    return 'bg-slate-700';
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

export const maskMobile = (mobile: string) => {
    if(!mobile) return '******';
    return mobile.slice(0, 2) + '******' + mobile.slice(8);
};

// Generate fake history for the day up to current time
export const generateMockHistory = (mode: GameMode): GamePeriod[] => {
    const history: GamePeriod[] = [];
    const now = new Date();
    // Generate last 20 periods
    for(let i = 1; i <= 20; i++) {
        const pastDate = new Date(now.getTime() - (i * (mode === 'FAST' ? 30000 : mode === 'STD' ? 60000 : 180000)));
        const num = Math.floor(Math.random() * 10);
        history.push({
            periodId: getPeriodIdFromDate(pastDate, mode),
            resultNumber: num,
            resultColor: calculateResultColors(num),
            resultSize: calculateResultSize(num)
        });
    }
    return history;
};