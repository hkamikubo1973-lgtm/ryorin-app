import { DutyType } from '../types/DutyType';

export const DUTY_LABEL: Record<DutyType, string> = {
  work: '乗務',
  ake: '明け',
  off: '公休',
  paid: '有休',
  absence: '欠勤',
  late: '遅刻',
  leaveEarly: '早退',
};