import { View, Button, Alert } from 'react-native';
import { exportRecordsCsv } from '../utils/exportCsv';

export default function ExportCsvButton() {
  const handle = async (period: 'all' | 'thisMonth' | 'lastMonth') => {
    try {
      await exportRecordsCsv(period);
    } catch {
      Alert.alert('CSV出力', '出力するデータがありません');
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Button
        title="CSV出力（全期間）"
        onPress={() => handle('all')}
      />
      <Button
        title="CSV出力（今月）"
        onPress={() => handle('thisMonth')}
      />
      <Button
        title="CSV出力（先月）"
        onPress={() => handle('lastMonth')}
      />
    </View>
  );
}
