import { View, Text } from 'react-native';
import { MonthlyTotal } from '../database/database';

type Props = {
  totals: MonthlyTotal[];
};

export default function MonthlyTotalList({ totals }: Props) {
  if (totals.length === 0) {
    return (
      <Text style={{ marginTop: 12 }}>
        月次合計はまだありません
      </Text>
    );
  }

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        月次合計
      </Text>

      {totals.map((m) => (
        <View
          key={m.month}
          style={{
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderColor: '#ccc',
          }}
        >
          <Text>月：{m.month}</Text>
          <Text>
            合計売上：
            {m.total_sales.toLocaleString()} 円
          </Text>
        </View>
      ))}
    </View>
  );
}
