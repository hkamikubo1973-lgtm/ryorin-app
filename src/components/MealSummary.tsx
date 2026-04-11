import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMealSummaryByDate } from '../database/database';
import { commonStyles } from '../styles/common';

type Props = {
  date: string;
  refreshKey?: number; // 再描画トリガー用
};

export default function MealSummary({ date, refreshKey }: Props) {
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const summary = await getMealSummaryByDate(date);
      setTotal(summary.total);
      setCounts(summary.counts);
    };
    load();
  }, [date, refreshKey]);

  return (
    <View style={commonStyles.card}>
      <Text style={styles.title}>今日の食事</Text>

      <Text style={styles.total}>合計：{total} 件</Text>

      {Object.keys(counts).length === 0 && (
        <Text style={styles.empty}>まだ記録はありません</Text>
      )}

      {Object.entries(counts).map(([key, count]) => (
        <Text key={key} style={styles.item}>
          ・{key}：{count}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
 
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  total: {
    marginTop: 4,
    fontSize: 14,
  },
  item: {
    fontSize: 14,
    marginTop: 2,
  },
  empty: {
    marginTop: 6,
    fontSize: 13,
    color: '#777',
  },
});
