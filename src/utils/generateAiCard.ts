type AreaSlots = {
  morning: string[];
  day: string[];
  night: string[];
};

type Input = {
  sales: number;
  areaSlots: AreaSlots;
};

const getFirst = (arr: string[]) => {
  return arr.find(v => v) || '';
};

export const generateAiCard = ({ sales, areaSlots }: Input) => {

  const lines: string[] = [];

  const morning = getFirst(areaSlots.morning);
  const day = getFirst(areaSlots.day);
  const night = getFirst(areaSlots.night);

  const inputCount =
    [...areaSlots.morning, ...areaSlots.day, ...areaSlots.night]
      .filter(Boolean).length;

  // ===== 事実 =====

  if (night) lines.push(`🌙 ${night}`);

  if (!day) {
    lines.push('🌇 未入力');
  }

  if (sales >= 50000) {
    lines.push('売上高め');
  } else if (sales > 0 && sales < 20000) {
    lines.push('売上控えめ');
  }

  if (inputCount >= 3) {
    lines.push('エリア入力多め');
  }

  // ===== 一言 =====

  let summary = 'いつもの流れの日';

  if (night && !day) {
    summary = '夜寄りの構成';
  }

  if (inputCount >= 3) {
    summary = '全時間帯動いた日';
  }

  // ===== 空対策（重要） =====

  if (lines.length === 0) {
    return [
      '記録待ち',
      '→ これからの一日'
    ];
  }

  return [...lines.slice(0, 3), `→ ${summary}`];
};