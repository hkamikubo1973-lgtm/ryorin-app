// src/utils/__test__/dutyTest.ts
import { getDutyForDate } from '../getDutyForDate';

const config = {
  baseDate: '2026-01-12',
  standardCycle: ['DUTY', 'AKEY', 'DUTY', 'AKEY', 'OFF'],
  overrides: {
    '2026-01-16': 'OFF', // 有休想定
  },
};

const testDates = [
  '2026-01-12', // base
  '2026-01-13',
  '2026-01-14',
  '2026-01-15',
  '2026-01-16', // override
  '2026-01-17',
  '2026-01-11', // 過去日
];

testDates.forEach((date) => {
  console.log(date, getDutyForDate(date, config));
});
