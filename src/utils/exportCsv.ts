import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDb } from '../database/database';

type CsvRow = {
  duty_date: string;
  sales: number;
  business_type: 'normal' | 'charter' | 'other';
  created_at: string;
};

type Period = 'all' | 'thisMonth' | 'lastMonth';

const escapeCsv = (value: any) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const businessTypeLabel = (
  type: 'normal' | 'charter' | 'other'
) => {
  switch (type) {
    case 'normal':
      return '通常';
    case 'charter':
      return '貸切';
    case 'other':
      return 'その他';
    default:
      return '';
  }
};

const getDateCondition = (period: Period) => {
  const now = new Date();

  if (period === 'thisMonth') {
    const ym = now.toISOString().slice(0, 7);
    return `WHERE substr(duty_date,1,7) = '${ym}'`;
  }

  if (period === 'lastMonth') {
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const ym = last.toISOString().slice(0, 7);
    return `WHERE substr(duty_date,1,7) = '${ym}'`;
  }

  return '';
};

export const exportRecordsCsv = async (
  period: Period = 'all'
) => {
  const db = await getDb();

  const where = getDateCondition(period);

  const rows = await db.getAllAsync<CsvRow>(`
    SELECT
      duty_date,
      sales,
      business_type,
      created_at
    FROM daily_records
    ${where}
    ORDER BY duty_date ASC, created_at ASC
  `);

  if (rows.length === 0) {
    throw new Error('no data');
  }

  const header = [
    'duty_date',
    'sales',
    'business_type',
    'created_at',
  ];

  const csvLines: string[] = [];
  csvLines.push(header.join(','));

  rows.forEach((r) => {
    csvLines.push(
      [
        escapeCsv(r.duty_date),
        escapeCsv(r.sales),
        escapeCsv(businessTypeLabel(r.business_type)),
        escapeCsv(r.created_at),
      ].join(',')
    );
  });

  const csv = csvLines.join('\n');

  const suffix =
    period === 'thisMonth'
      ? '_this_month'
      : period === 'lastMonth'
      ? '_last_month'
      : '_all';

  const fileUri =
    FileSystem.documentDirectory +
    `daily_records${suffix}.csv`;

  await FileSystem.writeAsStringAsync(fileUri, csv);

  await Sharing.shareAsync(fileUri);
};
