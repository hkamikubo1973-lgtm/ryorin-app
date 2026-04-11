import { View, Text } from 'react-native';
import { DailyTotal } from '../database/database';

type Props = {
  totals: DailyTotal[];
};

export default function DailyTotalList({ totals }: Props) {
  if (totals.length === 0) {
    return (
      <Text style={{ marginTop: 12 }}>
        日別合計はまだありません
      </Text>
    );
  }

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        日別合計
      </Text>

      {totals.map((t) => (
        <View
          key={t.duty_date}
          style={{
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderColor: '#ccc',
          }}
        >
          <Text>乗務日：{t.duty_date}</Text>
          <Text>
            合計売上：
            {(t.total_sales ?? 0).toLocaleString()} 円
          </Text>
        </View>
      ))}
    </View>
  );
}
