import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';

import {
  insertMealRecord,
  getDailyMealMemo,
  upsertDailyMealMemo,
} from '../database/mealRecords';

import { MealLabel } from '../types/MealLabel';
import { commonStyles } from '../styles/common';

type Props = {
  uuid: string;
  dutyDate: string;
  onMealRefresh: () => void;
};

type TimingType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const TIMING_OPTIONS = [
  { key: 'breakfast', label: '朝' },
  { key: 'lunch', label: '昼' },
  { key: 'dinner', label: '夜' },
  { key: 'snack', label: '間食' },
];

const MEAL_LABELS = [
  { key: 'rice', label: 'ごはん・丼' },
  { key: 'noodle', label: '麺類' },
  { key: 'light', label: '軽食・パン' },
  { key: 'healthy', label: '定食' },
  { key: 'supplement', label: '補給のみ' },
  { key: 'skip', label: '抜き' },
];

const MEMO_ROWS = [
  { key: 'breakfast', label: '朝食' },
  { key: 'lunch', label: '昼食' },
  { key: 'dinner', label: '夕食' },
  { key: 'snack', label: '間食' },
];

export default function MealInputButtons({
  uuid,
  dutyDate,
  onMealRefresh,
}: Props) {

  const [selectedTiming, setSelectedTiming] =
    useState<TimingType>('breakfast');

  const [openMemo, setOpenMemo] = useState(false);
  const [memoMap, setMemoMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ===== メモロード ===== */
  useEffect(() => {
    const loadMemo = async () => {
      const row = await getDailyMealMemo(uuid, dutyDate);

      if (row) {
        setMemoMap({
          breakfast: row.breakfast_memo ?? '',
          lunch: row.lunch_memo ?? '',
          dinner: row.dinner_memo ?? '',
          snack: row.snack_memo ?? '',
        });
      } else {
        setMemoMap({});
      }

      setSaved(false);
    };

    loadMemo();
  }, [uuid, dutyDate]);

  /* ===== 食事追加 ===== */
  const handleAddMeal = async (mealLabel: MealLabel) => {
    try {
      await insertMealRecord(uuid, dutyDate, selectedTiming, mealLabel);
      onMealRefresh();
    } catch {
      Alert.alert('エラー', '食事の記録に失敗しました');
    }
  };

  /* ===== メモ保存 ===== */
  const handleSaveMemo = async () => {
    try {
      setSaving(true);
      await upsertDailyMealMemo(uuid, dutyDate, memoMap);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 1500);

      onMealRefresh();

    } catch {
      Alert.alert('エラー', 'メモの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={commonStyles.container}>

      <View style={commonStyles.card}>

        <Text style={commonStyles.section}>食事を記録</Text>

        {/* ===== 時間帯 ===== */}
        <View style={styles.timingRow}>
          {TIMING_OPTIONS.map(item => (
            <Pressable
              key={item.key}
              style={[
                styles.timingButton,
                selectedTiming === item.key && styles.timingActive,
              ]}
              onPress={() => setSelectedTiming(item.key as TimingType)}
            >
              <Text
                style={
                  selectedTiming === item.key
                    ? styles.timingTextActive
                    : styles.timingText
                }
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ===== 食事ボタン ===== */}
        <View style={styles.grid}>
          {MEAL_LABELS.map(item => (
            <Pressable
              key={item.key}
              style={styles.button}
              onPress={() => handleAddMeal(item.key as MealLabel)}
            >
              <Text style={styles.text}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ===== メモ ===== */}
        <Pressable
           style={commonStyles.accordionToggle}
           onPress={() => setOpenMemo(v => !v)}
>
          <Text style={commonStyles.accordionText}>
            {openMemo ? '▲ 補足メモを閉じる' : '▼ 補足メモを追加'}
          </Text>
        </Pressable>

        {openMemo && (
          <View style={styles.memoBox}>
            {MEMO_ROWS.map(row => (
              <View key={row.key} style={styles.memoRow}>
                <Text style={styles.memoLabel}>{row.label}</Text>

                <TextInput
                  style={commonStyles.input}
                  value={memoMap[row.key] ?? ''}
                  onChangeText={text =>
                    setMemoMap({
                      ...memoMap,
                      [row.key]: text ?? '',
                    })
                  }
                  placeholder="補足メモ（任意）"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ))}

            <Pressable
              style={commonStyles.button}
              onPress={handleSaveMemo}
              disabled={saving}
            >
              <Text style={commonStyles.buttonText}>
                {saving ? '保存中...' : 'メモを保存'}
              </Text>
            </Pressable>

            {saved && (
              <Text style={commonStyles.savedMessage}>
                ✓ 保存しました
              </Text>
            )}
          </View>
        )}

      </View>
    </View>
  );
}

/* ===== 個別スタイル（残す部分） ===== */
const styles = StyleSheet.create({

  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  timingButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  timingActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },

  timingText: {
    fontSize: 13,
    color: '#444',
  },

  timingTextActive: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  button: {
    flexBasis: '48%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  text: {
    fontSize: 13,
    fontWeight: '500',
  },

  memoBox: {
    marginTop: 8,
  },

  memoRow: {
    marginBottom: 10,
  },

  memoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  savedText: {
    marginTop: 6,
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
  },

});