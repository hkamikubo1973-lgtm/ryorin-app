// src/components/ResetTodaySalesButton.tsx
import React from 'react';
import { Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getDb } from '../database/database';

type Props = {
  uuid: string;
  dutyDate: string;
  onReset: () => void;
};

export default function ResetTodaySalesButton({
  uuid,
  dutyDate,
  onReset,
}: Props) {
  const reset = () => {
    Alert.alert(
      '売上リセット',
      '本日の売上をすべて削除します。\nこの操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            const db = await getDb();
            await db.runAsync(
              `DELETE FROM daily_records WHERE uuid = ? AND duty_date = ?`,
              [uuid, dutyDate.slice(0, 10)]
            );
            onReset();
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={reset}>
      <Text style={styles.text}>本日の売上をリセット</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e44',
    borderRadius: 8,
    backgroundColor: '#fee',
    alignItems: 'center',
  },
  text: {
    color: '#c00',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
