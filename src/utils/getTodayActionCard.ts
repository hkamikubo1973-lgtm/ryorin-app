// src/utils/getTodayActionCard.ts

import { getTodayInputStatus } from './getTodayInputStatus';
import { getActionCardType } from './getActionCard';
import { pickActionCardMessage } from './pickActionCardMessage';
import { DutyConfig } from '../types/dutyModel';
import { getTodayDuty } from './getTodayDuty';
import { getTodayWeather, WeatherType } from '../database/database';

export interface TodayActionCard {
  type: string;
  message: string | null;
}

export const getTodayActionCard = async (
  dutyConfig: DutyConfig
): Promise<TodayActionCard> => {
  // ① 乗務日確定
  const duty = getTodayDuty(dutyConfig);

  // ② 入力状況取得
  const status = await getTodayInputStatus();

  // ③ カード種別
  const type = getActionCardType({
    duty,
    hasSalesRecord: status.hasSalesRecord,
    hasMealRecord: status.hasMealRecord,
    hasHealthRecord: status.hasHealthRecord,
  });

  // ④ 保険メッセージ
  let message = pickActionCardMessage(type);

  // ===== Phase2：事実（天気）連動 =====
  if (status.hasSalesRecord) {
    try {
      // ★ ここで duty.date → duty_date を使う
      const weather: WeatherType | null = await getTodayWeather(
        dutyConfig.uuid,
        duty.date   // ← getTodayDuty が返す正しい duty_date
      );

      if (weather === '雨') {
        message = '雨の日です。視界と足元にお気をつけください。';
      } else if (weather === '雪') {
        message = '雪の影響が出やすい日です。慎重な運転をお願いします。';
      } else if (weather === '荒天') {
        message = '天候が荒れています。無理のない運行を心がけてください。';
      }
    } catch (e) {
      console.warn('[ActionCard] weather fetch failed', e);
      // 失敗しても message は保険のまま
    }
  }

  return { type, message };
};
