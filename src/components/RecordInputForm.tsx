// src/components/RecordInputForm.tsx

import React, { useState, useEffect } from 'react';
import { commonStyles } from '../styles/common';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  insertDailyRecord,
  BusinessType,
} from '../database/database';

import { insertLog } from '../database/logs';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  uuid: string;
  dutyDate: string;
  onSaved: () => void;
};

const BUSINESS_TYPES = [
  { key: 'normal', label: '通常' },
  { key: 'charter', label: '貸切' },
  { key: 'other', label: 'その他' },
] as const;

/* =========================
   🔽 保存キー
========================= */
const getAreaKey = (uuid: string, dutyDate: string) =>
  `area_${uuid}_${dutyDate}`;

export default function RecordInputForm({
  uuid,
  dutyDate,
  onSaved,
}: Props) {

  const [amountText, setAmountText] = useState('');
  const [businessType, setBusinessType] =
    useState<BusinessType>('normal');
  const [saving, setSaving] = useState(false);

  /* =========================
     エリア
  ========================= */

  const [areaSlots, setAreaSlots] = useState({
    morning: ['', '', ''],
    day: ['', '', ''],
    night: ['', '', ''],
  });

  const [selectedArea, setSelectedArea] = useState({
    morning: 0,
    day: 0,
    night: 0,
  });

  const [areaOpen, setAreaOpen] = useState(false);

  /* =========================
     🔽 保存（共通）
  ========================= */

  const saveAreaToLocal = async (
    slots: any,
    selected: any
  ) => {
    try {
      const key = getAreaKey(uuid, dutyDate);

      await AsyncStorage.setItem(
        key,
        JSON.stringify({
          areaSlots: slots,
          selectedArea: selected,
        })
      );
    } catch (e) {
      console.log('area保存エラー', e);
    }
  };

  /* =========================
     🔽 復元
  ========================= */

  useEffect(() => {
    loadArea();
  }, [dutyDate]);

  const loadArea = async () => {
    try {
      const key = getAreaKey(uuid, dutyDate);
      const data = await AsyncStorage.getItem(key);

      if (!data) return;

      const parsed = JSON.parse(data);

      if (parsed.areaSlots) {
        setAreaSlots(parsed.areaSlots);
      }

      if (parsed.selectedArea) {
        setSelectedArea(parsed.selectedArea);
      }

    } catch (e) {
      console.log('area復元エラー', e);
    }
  };

  /* =========================
     🔽 更新
  ========================= */

  const updateArea = (
    time: 'morning' | 'day' | 'night',
    index: number,
    text: string
  ) => {

    if (text.length > 6) return;

    const newSlots = { ...areaSlots };
    newSlots[time][index] = text;

    setAreaSlots(newSlots);

    let newSelected = selectedArea;

    // 自由入力なら優先
    if (index === 2 && text.length > 0) {
      newSelected = {
        ...selectedArea,
        [time]: 2,
      };
      setSelectedArea(newSelected);
    }

    saveAreaToLocal(newSlots, newSelected);
  };

  const selectArea = (
    time: 'morning' | 'day' | 'night',
    index: number
  ) => {

    const next = {
      ...selectedArea,
      [time]: index,
    };

    setSelectedArea(next);

    saveAreaToLocal(areaSlots, next);
  };

  /* ========================= */

  const formatArea = (text: string) => {
    if (!text) return '-';
    return text.length > 4 ? text.slice(0, 4) + '…' : text;
  };

  const getDisplay = (
    time: 'morning' | 'day' | 'night'
  ) => {
    const index = selectedArea[time];
    return areaSlots[time][index] || '-';
  };

  /* ========================= */

  const amount = Number(amountText);

  const canSave =
    !saving &&
    amountText.length > 0 &&
    amount > 0;

  const handleSave = async () => {

    if (!canSave) return;

    try {

      setSaving(true);

      await insertDailyRecord(
        uuid,
        dutyDate,
        amount,
        businessType
      );

      await insertLog(uuid, 'save_sales', {
        amount,
        businessType,
      });

      await insertLog(uuid, 'area_snapshot', {
        dutyDate,
        areaSlots,
        selectedArea,
      });

      setAmountText('');
      setBusinessType('normal');

      Keyboard.dismiss();
      onSaved();

    } catch (err) {

      console.log('保存エラー', err);

      Alert.alert(
        'エラー',
        '保存に失敗しました'
      );

    } finally {
      setSaving(false);
    }
  };

  /* ========================= */

  return (

    <View style={commonStyles.card}>

      {/* 表示 */}
      <View style={styles.areaDisplay}>
        <Text style={styles.areaText}>
          🌅 {formatArea(getDisplay('morning'))}
        </Text>
        <Text style={styles.areaText}>
          🌇 {formatArea(getDisplay('day'))}
        </Text>
        <Text style={styles.areaText}>
          🌙 {formatArea(getDisplay('night'))}
        </Text>
      </View>

      {/* トグル */}
      <TouchableOpacity
        style={commonStyles.accordionToggle}
        onPress={() => setAreaOpen(!areaOpen)}
      >
        <Text style={commonStyles.accordionText}>
          {areaOpen ? '▲ 営業エリア選択を閉じる' : '▼ 営業エリア選択'}
        </Text>
      </TouchableOpacity>

      {areaOpen && (

        <>
          {(['morning','day','night'] as const).map(time => (

            <View key={time} style={{ marginTop: 10 }}>

              <Text style={styles.sectionTitle}>
                {time === 'morning' && '🌅 朝'}
                {time === 'day' && '🌇 日中'}
                {time === 'night' && '🌙 夜'}
              </Text>

              <View style={styles.row}>
                {areaSlots[time].map((val, i) => (

                  <View key={i} style={{ flex: 1, marginRight: 4 }}>

                    <View
                      style={[
                        styles.areaInputWrap,
                        selectedArea[time] === i && styles.active,
                      ]}
                    >
                      <TextInput
                        value={val}
                        placeholder={i === 2 ? '自由' : '登録'}
                        onChangeText={(text) =>
                          updateArea(time, i, text)
                        }
                        style={styles.areaInput}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => selectArea(time, i)}
                      style={styles.selectBtn}
                    >
                      <Text style={styles.selectText}>
                        選択
                      </Text>
                    </TouchableOpacity>

                  </View>

                ))}
              </View>

            </View>

          ))}
        </>

      )}

      {/* 売上 */}
      <Text style={styles.label}>
        売上金額（円）
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amountText}
        onChangeText={(text) =>
          setAmountText(text.replace(/[^0-9]/g, ''))
        }
        placeholder="例：50000"
      />

      {/* 種別 */}
      <View style={styles.typeRow}>
        {BUSINESS_TYPES.map(t => (

          <TouchableOpacity
            key={t.key}
            style={[
              styles.typeButton,
              businessType === t.key && styles.typeActive,
            ]}
            onPress={() => setBusinessType(t.key)}
          >
            <Text style={
              businessType === t.key
                ? styles.typeTextActive
                : styles.typeText
            }>
              {t.label}
            </Text>
          </TouchableOpacity>

        ))}
      </View>

      {/* 保存 */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          canSave ? styles.saveActive : styles.saveDisabled,
        ]}
        disabled={!canSave}
        onPress={handleSave}
      >
        <Text style={styles.saveText}>
          {saving ? '保存中…' : '保存'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  areaDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },

  row: {
    flexDirection: 'row',
  },

  areaInputWrap: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  areaInput: {
    fontSize: 13,
    padding: 0,
  },

  active: {
    borderColor: '#4a90e2',
    backgroundColor: '#e6f0ff',
  },

  selectBtn: {
    marginTop: 2,
    backgroundColor: '#eee',
    borderRadius: 4,
    alignItems: 'center',
    paddingVertical: 2,
  },

  selectText: {
    fontSize: 11,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
  },

  typeRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  typeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },

  typeActive: {
    backgroundColor: '#e6f0ff',
  },

  typeText: {
    fontSize: 14,
  },

  typeTextActive: {
    fontSize: 14,
    fontWeight: '600',
  },

  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  saveActive: {
    backgroundColor: '#4a90e2',
  },

  saveDisabled: {
    backgroundColor: '#ccc',
  },

  saveText: {
    color: '#fff',
    fontWeight: '600',
  },

  areaText: {
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },

});