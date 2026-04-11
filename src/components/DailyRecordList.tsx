import { View, Text, Pressable, Alert } from 'react-native';
import { DailyRecord } from '../database/database';

type Props = {
  records: DailyRecord[];
  onDelete: (id: number) => void;
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

export default function DailyRecordList({
  records,
  onDelete,
}: Props) {
  if (records.length === 0) {
    return (
      <Text style={{ color: '#666', marginTop: 4 }}>
        まだ記録はありません
      </Text>
    );
  }

  return (
    <View>
      {records.map((r) => (
        <Pressable
          key={r.id}
          onLongPress={() => {
            Alert.alert(
              '削除確認',
              `以下の記録を削除しますか？

乗務日：${r.duty_date}
売上：${r.sales.toLocaleString()} 円
種別：${businessTypeLabel(r.business_type)}`,
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: () => onDelete(r.id),
                },
              ]
            );
          }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 4,
            borderBottomWidth: 1,
            borderColor: '#eee',
          }}
        >
          {/* 上段：日付・種別 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 13, color: '#666' }}>
              乗務日：{r.duty_date}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color:
                  r.business_type === 'charter'
                    ? '#d32f2f'
                    : r.business_type === 'other'
                    ? '#6a1b9a'
                    : '#1976d2',
              }}
            >
              {businessTypeLabel(r.business_type)}
            </Text>
          </View>

          {/* 金額 */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginTop: 2,
            }}
          >
            {r.sales.toLocaleString()} 円
          </Text>

          {/* 補足 */}
          <Text style={{ fontSize: 11, color: '#999' }}>
            ※ 長押しで削除
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
