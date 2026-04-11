import { View, Text } from 'react-native';
import { MonthlyBusinessTotal } from '../database/database';

type Props = {
  totals: MonthlyBusinessTotal[];
};

const label = (type: 'normal' | 'charter' | 'other') => {
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

const color = (type: 'normal' | 'charter' | 'other') => {
  switch (type) {
    case 'normal':
      return '#1976d2';
    case 'charter':
      return '#d32f2f';
    case 'other':
      return '#6a1b9a';
    default:
      return '#000';
  }
};

export default function MonthlyBusinessTotalList({
  totals,
}: Props) {
  if (totals.length === 0) {
    return (
      <Text style={{ color: '#666' }}>
        種別別の集計はまだありません
      </Text>
    );
  }

  return (
    <View>
      {totals.map((t, idx) => (
        <View
          key={`${t.month}-${t.business_type}-${idx}`}
          style={{
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderColor: '#eee',
          }}
        >
          <Text style={{ fontSize: 13, color: '#666' }}>
            月：{t.month}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: color(t.business_type),
            }}
          >
            {label(t.business_type)}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            {(t.total_sales ?? 0).toLocaleString()} 円
          </Text>
        </View>
      ))}
    </View>
  );
}
