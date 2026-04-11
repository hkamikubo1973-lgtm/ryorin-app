// src/components/DailyMemo.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

import { commonStyles } from '../styles/common';
import { insertLog } from '../database/logs';

type Props = {
  uuid: string;
  dutyDate: string;
};

type MemoData = {
  time1: string;
  text1: string;
  time2: string;
  text2: string;
  free: string;
};

export default function DailyMemo({ uuid, dutyDate }: Props) {

  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const [data, setData] = useState<MemoData>({
    time1: '',
    text1: '',
    time2: '',
    text2: '',
    free: '',
  });

  const hasSchedule =
    (typeof data?.time1 === 'string' && data.time1 !== '' && data.time1 !== '00:00') ||
    (typeof data?.time2 === 'string' && data.time2 !== '' && data.time2 !== '00:00');

  const hasMemoOnly =
    !hasSchedule &&
    (
    (typeof data?.text1 === 'string' && data.text1.trim() !== '') ||
    (typeof data?.text2 === 'string' && data.text2.trim() !== '') ||
    (typeof data?.free === 'string' && data.free.trim() !== '')
  );

  const storageKey = `memo_${uuid}_${dutyDate}`;

  /* ===================== 読み込み ===================== */
  useEffect(() => {
    loadMemo();
    setSaved(false);
  }, [dutyDate]);

  const loadMemo = async () => {
    const raw = await AsyncStorage.getItem(storageKey);

    if (!raw) {
      setData({
        time1: '',
        text1: '',
        time2: '',
        text2: '',
        free: '',
      });
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setData({
        time1: parsed.time1 ?? '',
        text1: parsed.text1 ?? '',
        time2: parsed.time2 ?? '',
        text2: parsed.text2 ?? '',
        free: parsed.free ?? '',
      });
    } catch {
      setData(prev => ({ ...prev, free: raw ?? '' }));
    }
  };

  /* ===================== 更新 ===================== */
  const update = (key: keyof MemoData, value: string) => {
    setData(prev => ({ ...prev, [key]: value ?? '' }));
  };

  /* ===================== 空判定 ===================== */
  const isEmpty = (v: any) =>
    typeof v !== 'string' || v.trim() === '';

  /* ===================== メモ有無判定 ===================== */
  const hasMemo =
    !isEmpty(data.text1) ||
    !isEmpty(data.text2) ||
    !isEmpty(data.free) ||
    (typeof data.time1 === 'string' && data.time1 !== '00:00' && data.time1 !== '') ||
    (typeof data.time2 === 'string' && data.time2 !== '00:00' && data.time2 !== '');

  /* ===================== 保存 ===================== */
  const saveMemo = async () => {

    const isAllEmpty =
      isEmpty(data.text1) &&
      isEmpty(data.text2) &&
      isEmpty(data.free) &&
      (data.time1 === '' || data.time1 === '00:00') &&
      (data.time2 === '' || data.time2 === '00:00');

    if (isAllEmpty) {
  await AsyncStorage.removeItem(storageKey);

       // ★ここ追加
       setData({
         time1: '',
         text1: '',
         time2: '',
         text2: '',
         free: '',
       });

     } else {
       await AsyncStorage.setItem(storageKey, JSON.stringify(data));
       await insertLog(uuid, 'save_memo', data);
     }

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  /* ===================== TimePicker ===================== */
  const TimePicker = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => {

    const h = typeof value === 'string' && value.includes(':')
     ? value.split(':')[0]
     : '00';

    const m = typeof value === 'string' && value.includes(':')
     ? value.split(':')[1]
     : '00';

    return (
      <View style={styles.timeRow}>
        <Picker
          selectedValue={h}
          style={styles.picker}
          onValueChange={(val) => onChange(`${val}:${m}`)}
        >
          {Array.from({ length: 24 }, (_, i) => {
            const v = String(i).padStart(2, '0');
            return <Picker.Item key={v} label={v} value={v} />;
          })}
        </Picker>

        <Text style={{ marginHorizontal: 4 }}>:</Text>

        <Picker
          selectedValue={m}
          style={styles.picker}
          onValueChange={(val) => onChange(`${h}:${val}`)}
        >
          {['00','05','10','15','20','25','30','35','40','45','50','55']
            .map((v) => (
              <Picker.Item key={v} label={v} value={v} />
            ))}
        </Picker>
      </View>
    );
  };

  /* ===================== UI ===================== */

  return (

    <View style={commonStyles.card}>

      {/* ===== トグル ===== */}
      <Pressable
       onPress={() => setOpen(v => !v)}
       style={[
         commonStyles.accordionToggle,
         styles.row,
         hasMemo && styles.toggleActive
      ]}
     >
       <Text style={commonStyles.accordionText}>
         {open
           ? '▲ 今日の予定・メモを閉じる'
           : '▼ 今日の予定・メモを表示'}
       </Text>

       {!open && hasSchedule && (
        <Text style={styles.dotRed}>●</Text>
       )}

       {!open && !hasSchedule && hasMemoOnly && (
        <Text style={styles.dotBlue}>●</Text>
       )}

       </Pressable>

      {open && (

        <>
          {/* ===== ①予定 ===== */}
          <Text style={commonStyles.section}>①予定</Text>

          <TimePicker
            value={data.time1}
            onChange={(v) => update('time1', v)}
          />

          <TextInput
            style={[
              commonStyles.input,
              focus === 'text1' && styles.inputFocused,
            ]}
            placeholder="予定内容"
            placeholderTextColor="#90A4AE"
            value={data.text1}
            onChangeText={(v) => update('text1', v)}
            onFocus={() => setFocus('text1')}
            onBlur={() => setFocus(null)}
          />

          {/* ===== ②予定 ===== */}
          <Text style={commonStyles.section}>②予定</Text>

          <TimePicker
            value={data.time2}
            onChange={(v) => update('time2', v)}
          />

          <TextInput
            style={[
              commonStyles.input,
              focus === 'text2' && styles.inputFocused,
            ]}
            placeholder="予定内容"
            placeholderTextColor="#90A4AE"
            value={data.text2}
            onChangeText={(v) => update('text2', v)}
            onFocus={() => setFocus('text2')}
            onBlur={() => setFocus(null)}
          />

          {/* ===== メモ ===== */}
          <Text style={commonStyles.section}>メモ</Text>

          <TextInput
            style={[
              commonStyles.input,
              styles.memo,
              focus === 'free' && styles.inputFocused,
            ]}
            multiline
            placeholder="メモ"
            placeholderTextColor="#90A4AE"
            value={data.free}
            onChangeText={(v) => update('free', v)}
            onFocus={() => setFocus('free')}
            onBlur={() => setFocus(null)}
          />

          {/* ===== 保存 ===== */}
          <Pressable
            style={[commonStyles.button, { marginTop: 12 }]}
            onPress={saveMemo}
          >
            <Text style={commonStyles.buttonText}>保存</Text>
          </Pressable>

          {saved && (
            <Text style={commonStyles.savedMessage}>
              ✓ 保存しました
            </Text>
          )}
        </>
      )}

    </View>
  );
}

/* ===================== styles ===================== */

const styles = StyleSheet.create({

  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    borderRadius: 10,
  },

  toggleActive: {
    backgroundColor: '#E3F2FD',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginTop: 4,
  },

  picker: {
    flex: 1,
    height: 60,
  },

  inputFocused: {
    borderColor: '#1976D2',
    borderWidth: 2,
  },

  memo: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  savedMessage: {
    textAlign: 'center',
    marginTop: 6,
    color: '#4CAF50',
  },

  row: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between', // ←これ重要
},

dot: {
  color: '#1976D2',
  fontSize: 12,
},

dotRed: {
  color: '#E57373',
  fontSize: 12,
},

dotBlue: {
  color: '#1976D2',
  fontSize: 12,
},
});