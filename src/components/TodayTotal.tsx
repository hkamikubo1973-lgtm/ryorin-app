// src/components/TodayTotal.tsx

import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  getTodayTotalSales,
  getMonthlyTotalSales,
  getDailySalesSummaryByDutyDate,
  getTodayWeather,
  updateWeatherByDutyDate,
  resetDailySalesByDutyDate,
} from '../database/database'

import { getSalaryConfig, saveSalaryConfig } from '../database/salaryConfig'
import { calculateExpectedSalary } from '../utils/salaryCalculator'

import { ActionCard } from './ActionCard'
import { getTodayActionCard } from '../utils/getTodayActionCard'

import { commonStyles } from '../styles/common'

/* =====================
   定数
===================== */

const TARGET_OPTIONS = Array.from(
  { length: 17 },
  (_, i) => 200000 + i * 50000
)

const CLOSING_OPTIONS = [5, 10, 15, 20, 25, 31]

const TARGET_KEY = 'monthlyTarget'
const CLOSING_DAY_KEY = 'closingDay'

const WEATHER_LIST = ['晴', '曇', '雨', '雪', '荒天'] as const
type WeatherType = typeof WEATHER_LIST[number]

type Props = {
  uuid: string
  dutyDate: string
  refreshKey: number
  onRefresh: () => void
}

export default function TodayTotal({
  uuid,
  dutyDate,
  refreshKey,
  onRefresh,
}: Props) {

  const [todayTotal, setTodayTotal] = useState(0)
  const [monthTotal, setMonthTotal] = useState(0)

  const [monthlyTarget, setMonthlyTarget] = useState<number>(450000)
  const [closingDay, setClosingDay] = useState<number>(31)

  const [targetOpen, setTargetOpen] = useState(false)
  const [closingOpen, setClosingOpen] = useState(false)

  const [summary, setSummary] = useState<any>(null)
  const [weather, setWeather] = useState<WeatherType | null>(null)
  const [actionCard, setActionCard] = useState<any>(null)

  const [open, setOpen] = useState(false)

  // ★給与
  const [salaryConfig, setSalaryConfig] = useState<any>(null)
  const [expectedSalary, setExpectedSalary] = useState<number>(0)

  /* =====================
     曜日取得
  ===================== */

  const getWeekday = (dateStr: string) => {
    const d = new Date(dateStr)
    const weekdays = ['日','月','火','水','木','金','土']
    return weekdays[d.getDay()]
  }

  /* =====================
     初期ロード
  ===================== */

  const load = async () => {

    try {

      const savedTarget = await AsyncStorage.getItem(TARGET_KEY)
      const savedClosing = await AsyncStorage.getItem(CLOSING_DAY_KEY)

      const target = savedTarget ? Number(savedTarget) : 450000
      const closing = savedClosing ? Number(savedClosing) : 31

      setMonthlyTarget(target)
      setClosingDay(closing)

      const today = await getTodayTotalSales(uuid, dutyDate)
      const month = await getMonthlyTotalSales(uuid, dutyDate, closing)
      const sum = await getDailySalesSummaryByDutyDate(uuid, dutyDate)
      const w = await getTodayWeather(uuid, dutyDate)

      setTodayTotal(today)
      setMonthTotal(month)
      setSummary(sum)
      setWeather(w)

      const card = await getTodayActionCard({ uuid, dutyDate } as any)
      setActionCard(card)

      // ★給与設定取得
      let config = await getSalaryConfig(uuid)

      if (!config) {
        await saveSalaryConfig(uuid, {
          monthly_threshold: 360000,
          target_days: 12,
          low_rate: 0.5,
          high_rate: 0.6
        })
        config = await getSalaryConfig(uuid)
      }

      setSalaryConfig(config)

    } catch (e) {
      console.log('LOAD ERROR:', e)
    }
  }

  useEffect(() => {
    load()
  }, [uuid, dutyDate, refreshKey])

  /* =====================
     ★給与計算（正規設計）
  ===================== */

  useEffect(() => {

    if (salaryConfig) {
      const result = calculateExpectedSalary(todayTotal, salaryConfig)
      setExpectedSalary(result)
    } else {
      setExpectedSalary(0)
    }

  }, [salaryConfig, todayTotal])

  const remaining = monthlyTarget - monthTotal

  /* =====================
     目標変更
  ===================== */

  const handleTargetChange = async (value: number) => {

    await AsyncStorage.setItem(TARGET_KEY, String(value))

    setMonthlyTarget(value)
    setTargetOpen(false)

    const month = await getMonthlyTotalSales(uuid, dutyDate, closingDay)
    setMonthTotal(month)
  }

  /* =====================
     締日変更
  ===================== */

  const handleClosingChange = async (day: number) => {

    await AsyncStorage.setItem(CLOSING_DAY_KEY, String(day))

    setClosingDay(day)
    setClosingOpen(false)

    const month = await getMonthlyTotalSales(uuid, dutyDate, day)
    setMonthTotal(month)
  }

  /* =====================
     天気保存
  ===================== */

  const handleWeatherSelect = async (w: WeatherType) => {

    await updateWeatherByDutyDate(uuid, dutyDate, w)
    setWeather(w)
    onRefresh()
  }

  /* =====================
     売上リセット
  ===================== */

  const handleReset = () => {

    Alert.alert(
      '売上リセット',
      '本日の売上をすべて削除します。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {

            await resetDailySalesByDutyDate(uuid, dutyDate)
            onRefresh()

          },
        },
      ]
    )
  }

  return (

    <View style={commonStyles.container}>

      {actionCard?.message && (
        <ActionCard card={actionCard} />
      )}

      {/* ===== 今月目標 ===== */}

      <View style={commonStyles.card}>

        <Text style={commonStyles.section}>今月の売上目標</Text>

        <Pressable
          style={styles.selectorRow}
          onPress={() => setTargetOpen(v => !v)}
        >
          <Text style={styles.selectorLabel}>目標額：</Text>
          <Text style={styles.selectorValue}>
            {monthlyTarget.toLocaleString()} 円 ▼
          </Text>
        </Pressable>

        {targetOpen && (
          <View style={styles.optionBox}>
            {TARGET_OPTIONS.map(v => (
              <Pressable
                key={v}
                onPress={() => handleTargetChange(v)}
                style={styles.optionItem}
              >
                <Text
                  style={[
                    styles.optionText,
                    v === monthlyTarget && styles.optionSelected,
                  ]}
                >
                  {v.toLocaleString()} 円
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          style={styles.selectorRow}
          onPress={() => setClosingOpen(v => !v)}
        >
          <Text style={styles.selectorLabel}>締日：</Text>
          <Text style={styles.selectorValue}>
            {closingDay === 31 ? '月末' : `${closingDay}日`} ▼
          </Text>
        </Pressable>

        {closingOpen && (
          <View style={styles.optionBox}>
            {CLOSING_OPTIONS.map(day => (
              <Pressable
                key={day}
                onPress={() => handleClosingChange(day)}
                style={styles.optionItem}
              >
                <Text
                  style={[
                    styles.optionText,
                    closingDay === day && styles.optionSelected,
                  ]}
                >
                  {day === 31 ? '月末' : `${day}日`}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text
          style={[
            styles.remaining,
            remaining <= 0 && styles.remainingOk,
          ]}
        >
          {remaining > 0
            ? `あと ${remaining.toLocaleString()} 円`
            : '達成 🎉'}
        </Text>

        <Text style={styles.sub}>
          今月累計：{monthTotal.toLocaleString()} 円
        </Text>

      </View>

      {/* ===== 本日の売上 ===== */}

      <View style={commonStyles.card}>

        <Text style={commonStyles.section}>本日の売上</Text>

        <Text style={styles.sub}>
          出庫基準日：{dutyDate}（{getWeekday(dutyDate)}）
        </Text>

        <Text style={styles.amount}>
          {todayTotal.toLocaleString()} 円
        </Text>

        <View style={styles.weatherRow}>
          {WEATHER_LIST.map(w => (
            <Pressable
              key={w}
              onPress={() => handleWeatherSelect(w)}
              style={[
                styles.weatherButton,
                weather === w && styles.weatherSelected,
              ]}
            >
              <Text>{w}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={commonStyles.accordionToggle}
          onPress={() => setOpen(v => !v)}
        >
          <Text style={commonStyles.accordionText}>
            {open ? '▲ 詳細・売上リセットを閉じる' : '▼ 詳細・売上リセット'}
          </Text>
        </Pressable>

        {open && summary && (

          <View style={styles.detail}>

            <Text>通常：{summary.normal?.toLocaleString()} 円</Text>
            <Text>貸切：{summary.charter?.toLocaleString()} 円</Text>
            <Text>その他：{summary.other?.toLocaleString()} 円</Text>

            {/* ★給与表示 */}
            {salaryConfig && (
              <View style={styles.salaryBox}>
                <Text style={styles.salaryText}>
                  手取り見込（概算） ¥{expectedSalary.toFixed(0)}
                </Text>
              </View>
            )}

            <Pressable style={styles.reset} onPress={handleReset}>
              <Text style={styles.resetText}>
                本日の売上をリセット
              </Text>
            </Pressable>

          </View>

        )}

      </View>

    </View>
  )
}

/* =====================
   styles
===================== */

const styles = StyleSheet.create({
  selectorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  selectorLabel: { fontSize: 12, color: '#666' },
  selectorValue: { fontSize: 18, fontWeight: '800', color: '#1976D2' },
  optionBox: { marginTop: 4 },
  optionItem: { paddingVertical: 4 },
  optionText: { fontSize: 12, color: '#555' },
  optionSelected: { color: '#1976D2', fontWeight: '600' },
  sub: { fontSize: 12, color: '#666' },
  amount: { fontSize: 22, fontWeight: 'bold', marginVertical: 4 },
  remaining: { fontSize: 14, color: '#1976D2', fontWeight: '600' },
  remainingOk: { color: '#2E7D32' },
  detail: { marginTop: 6 },
  weatherRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  weatherButton: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    marginRight: 6, marginBottom: 6,
  },
  weatherSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  salaryBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  salaryText: {
    fontSize: 13,
    color: '#666',
  },
  reset: {
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E57373',
    backgroundColor: '#FDECEA',
  },
  resetText: {
    color: '#C62828',
    fontWeight: '600',
    textAlign: 'center',
  },
})