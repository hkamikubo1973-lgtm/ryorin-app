// src/utils/normalizeDutyDate.ts

export const normalizeDutyDate = (dateStr: string) => {
  if (!dateStr) return '';

  // YYYY-MM-DD 形式を保証
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
