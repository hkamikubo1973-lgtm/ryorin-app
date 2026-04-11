import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { getDailyRecords } from '../database/database';

export default function TodaySalesList({
  uuid,
  dutyDate,
  refreshKey,
}: {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
}) {

  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, [uuid, dutyDate, refreshKey]);

  const load = async () => {
    const data = await getDailyRecords(uuid, dutyDate);
    setRows(data ?? []);
  };

  if (!rows.length) {
    return <Text>売上記録はまだありません</Text>;
  }

  return (
    <View>
      {rows.map((r) => {

        const type =
          r.business_type === 'charter'
            ? '貸切'
            : r.business_type === 'other'
            ? 'その他'
            : '通常';

        return (
          <Text key={r.id}>
            {type}：{r.sales}円
          </Text>
        );
      })}
    </View>
  );
}