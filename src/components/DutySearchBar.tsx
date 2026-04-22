import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';

import { DutyType } from '../types/DutyType';
import { commonStyles } from '../styles/common';
import { insertLog } from '../database/logs';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DUTY_LABEL } from '../constants/dutyLabel';
import { DUTY_COLOR } from '../constants/dutyColor';
import { DUTY_ORDER } from '../constants/dutyOrder';
import { resolveDuty } from '../utils/resolveDuty';

const getNewDate = (dateStr: string, diff: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + diff);

  return d.toISOString().slice(0, 10);
};

type Props = {
  uuid: string;
  dutyDate: string;
  dutyType: DutyType | null;
  jumpText: string | null;
  baseDate: string | null;
  pattern: DutyType[] | null;
  onChange: (
    newDate: string,
    jumpType?: 'prev' | 'next' | 'long-prev' | 'long-next'
  ) => void;
  onSavePattern: (
    baseDate: string,
    pattern: DutyType[]
  ) => Promise<void>;
  onSetOverride: (type: DutyType) => Promise<void>;
  onResetOverride: () => Promise<void>;
};

export default function DutySearchBar({
  uuid,
  dutyDate,
  dutyType,
  jumpText,
  baseDate,
  pattern,
  onChange,
  onSavePattern,
  onSetOverride,
  onResetOverride
}: Props) {

  const [openCycle, setOpenCycle] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const finalDuty = resolveDuty(dutyType, null);
  const [localBaseDate, setLocalBaseDate] = useState(baseDate ?? '');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localPattern, setLocalPattern] = useState<DutyType[]>(
    pattern ?? ['work', 'ake', 'off']
  );
  
  useEffect(() => {

     if (!pattern) {
       // 🔥 初回（未設定）の救済
       setLocalPattern(['work', 'ake', 'off']);
     } else {
       setLocalPattern(pattern);
     }

  }, [pattern]);

  useEffect(() => setLocalBaseDate(baseDate ?? ''), [baseDate]);

  const nextDuty = (type: DutyType): DutyType => {
    const baseCycle = DUTY_ORDER.filter(t =>
      ['work','ake','off'].includes(t)
    );

    const idx = baseCycle.indexOf(type);
    return baseCycle[(idx + 1) % baseCycle.length];
  };

  const cycleInfo = React.useMemo(() => {
    if (!baseDate || !pattern || pattern.length === 0) return null;

    const base = new Date(baseDate);
    const current = new Date(dutyDate);

    const diff = Math.floor(
      (current.getTime() - base.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const length = pattern.length;

    const index =
      ((diff % length) + length) % length;

    return {
      day: index + 1,
      total: length,
      label: pattern[index],
      index,
    };

  }, [baseDate, dutyDate, pattern]);

  const changeDateBy = (days: number, jumpType?: string) => {
    const [y, m, d] = dutyDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    date.setDate(date.getDate() + days);

    const newDate =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');

    onChange(newDate, jumpType as any);
  };

  
  const handleSave = async () => {
    if (!localPattern) return;

    if (!localBaseDate) {
      Alert.alert('基準日を選択してください');
      return;
    }

    try {
      setSaving(true);

      console.log('保存開始', localBaseDate, localPattern);

      await onSavePattern(localBaseDate, localPattern);

      console.log('保存成功');

      setEditMode(false);
      Alert.alert('保存しました');

    } catch (e) {
      console.log('保存エラー', e);
      Alert.alert('保存失敗');
    } finally {
      setSaving(false);
    }
  };

  return (

    <View style={commonStyles.card}>

      {/* ===== ヘッダー ===== */}
      <View style={commonStyles.rowBetween}>
        <Text style={commonStyles.sectionTitle}>乗務日検索</Text>
        <Text style={commonStyles.text}>{jumpText ?? ''}</Text>
        <Text style={commonStyles.textSub}>※長押しで±30日</Text>
      </View>

      {/* ===== 日付移動 ===== */}
      <View style={[commonStyles.rowBetween, { marginTop: 12 }]}>

        <Pressable
  style={commonStyles.buttonOutline}
      onPress={() => {
      const newDate = getNewDate(dutyDate, -1);

      changeDateBy(-1);

      insertLog(uuid, 'move_date', {
        diff: -1,
        from: dutyDate,
        to: newDate
      });
    }}
  onLongPress={() => changeDateBy(-30, 'long-prev')}
>
  <Text style={commonStyles.buttonOutlineText}>◀ 前日</Text>
</Pressable>

        <View style={styles.center}>
         <Text style={styles.date}>{dutyDate}</Text>

        <Text
          style={[
            commonStyles.text,
            finalDuty && {
              color: DUTY_COLOR[finalDuty],
              fontWeight: 'bold'
            }
          ]}
        >
          {finalDuty && DUTY_LABEL[finalDuty]}
        </Text>
       </View>

        <Pressable
  style={commonStyles.buttonOutline}
      onPress={() => {
      const newDate = getNewDate(dutyDate, 1);

      changeDateBy(1);

      insertLog(uuid, 'move_date', {
        diff: 1,
        from: dutyDate,
        to: newDate
      });
    }}
  onLongPress={() => changeDateBy(30, 'long-next')}
>
  <Text style={commonStyles.buttonOutlineText}>翌日 ▶</Text>
</Pressable>

      </View>

      {/* ===== アコーディオン ===== */}
      <Pressable
        style={commonStyles.accordionToggle}
        onPress={() => setOpenCycle(v => !v)}
      >
        <Text style={commonStyles.accordionText}>
          {openCycle
            ? '▲ 乗務サイクル設定・勤務修正を閉じる'
            : '▼ 乗務サイクル設定・勤務修正'}
        </Text>
      </Pressable>

      {openCycle && (

        <View style={[commonStyles.card, { marginTop: 12 }]}>

          {/* ===== 勤務修正 ===== */}
          <Text style={commonStyles.section}>勤務修正</Text>

          <View style={styles.overrideRow}>
            {DUTY_ORDER.map((type) => (
              <Pressable
                key={type}
                style={commonStyles.chip}
                onPress={() => onSetOverride(type)}
              >
                <Text style={commonStyles.chipText}>
                  {DUTY_LABEL[type]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={commonStyles.buttonDanger}
            onPress={onResetOverride}
          >
            <Text style={commonStyles.buttonDangerText}>
              修正解除
            </Text>
          </Pressable>

          {/* ===== サイクル ===== */}
          <Text style={commonStyles.section}>サイクル設定</Text>

     {editMode && localPattern && (
       <View style={styles.patternAdjustRow}>

        <Pressable
           style={commonStyles.buttonOutlineSmall}
           onPress={() => {
             if (localPattern.length <= 1) return;
             setLocalPattern(localPattern.slice(0, -1));
           }}
         >
           <Text style={commonStyles.buttonOutlineText}>−1日</Text>
         </Pressable>

         <Text style={commonStyles.textSub}>
           {localPattern.length}日サイクル
         </Text>

         <Pressable
           style={commonStyles.buttonOutlineSmall}
           onPress={() => {
             setLocalPattern([...localPattern, 'work']);
           }}
         >
           <Text style={commonStyles.buttonOutlineText}>＋1日</Text>
         </Pressable>

       </View>
     )}
          <Text style={commonStyles.textSub}>
            基準日（サイクル初日）
          </Text>

          {!editMode ? (
            <Text style={commonStyles.text}>
              {localBaseDate || '未設定'}
            </Text>
          ) : (
            <View>
              <TouchableOpacity
                style={commonStyles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ fontSize: 16 }}>
                  {localBaseDate || '日付を選択'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    localBaseDate
                      ? new Date(localBaseDate)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);

                    if (date) {
                      const formatted = date.toISOString().slice(0, 10);
                      setLocalBaseDate(formatted);
                    }
                  }}
                />
              )}
            </View>
          )}

          {cycleInfo && (
            <Text style={commonStyles.textSub}>
              サイクル {cycleInfo.day} / {cycleInfo.total} 日目（{DUTY_LABEL[cycleInfo.label]}）
            </Text>
          )}

         {/* ===== 表示切替 ===== */}
{pattern && (

  pattern.length <= 20 ? (

    // ===== バー表示（そのまま）=====
    <>
      <View style={styles.barRow}>
        {Array.from({ length: 20 }, (_, i) => {
          const isUsed = i < pattern.length;
          const isActive = i === cycleInfo?.index;

          return (
            <View
              key={i}
              style={[
                styles.bar,
                isUsed && styles.barFilled,
                !isUsed && styles.barEmpty,
                isActive && styles.barActive,
              ]}
            />
          );
        }).slice(0, 10)}
      </View>

      <View style={styles.barRow}>
        {Array.from({ length: 20 }, (_, i) => {
          const isUsed = i < pattern.length;
          const isActive = i === cycleInfo?.index;

          return (
            <View
              key={i}
              style={[
                styles.bar,
                isUsed && styles.barFilled,
                !isUsed && styles.barEmpty,
                isActive && styles.barActive,
              ]}
            />
          );
        }).slice(10, 20)}
      </View>
    </>

  ) : (

    // ===== 長期（テキスト表示）=====
    <View style={styles.cycleInfoBox}>
      <Text style={styles.cycleText}>
        {pattern.length}日サイクル
      </Text>
      <Text style={styles.cycleSub}>
        {cycleInfo ? cycleInfo.index + 1 : '-'}日目
      </Text>
    </View>

  )

)}

          {/* ===== パターン ===== */}
          <Text style={commonStyles.section}>パターン</Text>

          <View style={styles.patternWrap}>
       {localPattern?.map((p, i) => (

         <Pressable
           key={i}
           style={commonStyles.chip}
           onPress={() => {
             if (!editMode) return;

             const next = nextDuty(p);

             const updated = [...localPattern];
             updated[i] = next;

             setLocalPattern(updated);
           }}
         >
           <Text style={commonStyles.chipText}>
             {DUTY_LABEL[p]}
           </Text>
         </Pressable>

       ))}
     </View>

          {/* ===== 保存 ===== */}
          {!editMode ? (

  <Pressable
    style={commonStyles.buttonOutline}
    onPress={()=>setEditMode(true)}
  >
    <Text style={commonStyles.buttonOutlineText}>
      パターン編集
    </Text>
  </Pressable>

) : (

  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>

    <Pressable
      style={[
        commonStyles.buttonHalf,
        commonStyles.buttonHalfOutline
      ]}
      onPress={()=>{
        setLocalPattern(pattern);
        setLocalBaseDate(baseDate ?? '');
        setEditMode(false);
      }}
    >
      <Text style={[
        commonStyles.buttonHalfText,
        commonStyles.buttonHalfTextOutline
      ]}>
        キャンセル
      </Text>
    </Pressable>

    <Pressable
      style={[
        commonStyles.buttonHalf,
        commonStyles.buttonHalfPrimary
      ]}
      onPress={handleSave}
      disabled={saving}
    >
      <Text style={[
        commonStyles.buttonHalfText,
        commonStyles.buttonHalfTextPrimary
      ]}>
        {saving ? '保存中...' : '保存'}
      </Text>
    </Pressable>

  </View>

)}

        </View>

      )}

    </View>
  );
}

const styles = StyleSheet.create({

  center: {
    alignItems: 'center',
  },

  date: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  accordionToggle: {
    marginTop: 12,
  },

  overrideRow: {
    flexDirection:'row',
    flexWrap:'wrap',
    gap:8,
    marginBottom:8,
  },

  barRow: {
  flexDirection: 'row',
  marginTop: 6,
},

bar: {
  flex: 1,
  height: 12,
  borderRadius: 3,
  marginHorizontal: 2,
},

barFilled: {
  backgroundColor: '#90CAF9',
},

barActive: {
  backgroundColor: '#1976D2',
},

barEmpty: {
  backgroundColor: 'transparent',
},

  patternWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },

  patternAdjustRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 8,
  marginBottom: 8,
},

cycleInfoBox: {
  paddingVertical: 6,
},

cycleText: {
  fontSize: 14,
  fontWeight: '600',
},

cycleSub: {
  fontSize: 12,
  color: '#666',
},

dateInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  paddingHorizontal: 12,
  paddingVertical: 10,
  backgroundColor: '#fff',
},
});