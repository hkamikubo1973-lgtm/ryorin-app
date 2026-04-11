import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import { getDailyMealMemo } from '../database/mealRecords';
import { commonStyles } from '../styles/common';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
};

export default function DailyMealSummary({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {

  const [dailyMemo, setDailyMemo] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    load();
  }, [uuid, dutyDate, refreshKey]);

  const load = async () => {
    const row = await getDailyMealMemo(uuid, dutyDate);
    setDailyMemo(row);
  };

  const memoList = dailyMemo
    ? [
        { label: '朝', value: dailyMemo.breakfast_memo },
        { label: '昼', value: dailyMemo.lunch_memo },
        { label: '夜', value: dailyMemo.dinner_memo },
        { label: '間食', value: dailyMemo.snack_memo },
      ].filter(m => m.value)
    : [];

  if (memoList.length === 0) return null;

  return (
    <View style={commonStyles.container}>

      <View style={commonStyles.card}>

        <Pressable
          style={commonStyles.rowBetween}
          onPress={() => setOpen(v => !v)}
        >
          <Text style={commonStyles.section}>
            📝 今日のまとめ（{memoList.length}件）
          </Text>

          <Text style={commonStyles.textSub}>
            {open ? '▲' : '▼'}
          </Text>
        </Pressable>

        {open && (
          <View style={styles.body}>
            {memoList.map((m, i) => (
              <Text key={i} style={commonStyles.text}>
                {m.label}：{m.value}
              </Text>
            ))}
          </View>
        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  body: {
    marginTop: 6,
  },

});