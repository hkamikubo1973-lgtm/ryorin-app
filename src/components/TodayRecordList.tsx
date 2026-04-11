// src/components/TodayRecordList.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import {
  getDailyRecordsByDate,
  BusinessType,
} from '../database/database';

import { commonStyles } from '../styles/common';

type Props = {
  uuid: string;
  dutyDate: string;
  refreshKey: number;
};

type Summary = {
  normal: number;
  charter: number;
  other: number;
};

export default function TodayRecordList({
  uuid,
  dutyDate,
  refreshKey,
}: Props) {

  const [summary, setSummary] = useState<Summary>({
    normal: 0,
    charter: 0,
    other: 0,
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const records = await getDailyRecordsByDate(uuid, dutyDate);

      const s: Summary = {
        normal: 0,
        charter: 0,
        other: 0,
      };

      records.forEach(r => {
        if (r.business_type) {
          s[r.business_type as BusinessType] += r.sales;
        }
      });

      setSummary(s);
    };

    load();
  }, [uuid, dutyDate, refreshKey]);

  const total =
    summary.normal + summary.charter + summary.other;

  // 売上ゼロ日は非表示
  if (total === 0) return null;

  return (
    <View style={commonStyles.container}>

      <View style={commonStyles.card}>

        {/* タイトル */}
        <Pressable onPress={() => setOpen(v => !v)}>
          <Text style={commonStyles.section}>
            売上内訳 {open ? '▲' : '▼'}
          </Text>
        </Pressable>

        {/* 中身 */}
        {open && (
          <View style={styles.body}>

            <Row label="通常" value={summary.normal} />
            <Row label="貸切" value={summary.charter} />
            <Row label="その他" value={summary.other} />

            <Text style={commonStyles.textSub}>
              ▶ 詳細・売上リセット
            </Text>

          </View>
        )}

      </View>

    </View>
  );
}

/* ===== 小部品 ===== */
function Row({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  if (value === 0) return null;

  return (
    <View style={commonStyles.rowBetween}>
      <Text style={commonStyles.text}>{label}</Text>
      <Text style={styles.value}>
        {value.toLocaleString()} 円
      </Text>
    </View>
  );
}

/* ===================== styles ===================== */

const styles = StyleSheet.create({

  body: {
    marginTop: 6,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
  },

});