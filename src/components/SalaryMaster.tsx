import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { getSalaryConfig, saveSalaryConfig } from '../database/salaryConfig'
import { getMonthlyTotalSales } from '../database/database'

type Props = {
  uuid: string
}

const CLOSING_DAY_KEY = 'closingDay'

export default function SalaryMaster({ uuid }: Props) {

  const [threshold, setThreshold] = useState('')
  const [lowRate, setLowRate] = useState('')
  const [highRate, setHighRate] = useState('')
  const [adjustment, setAdjustment] = useState('')
  const [baseSalary, setBaseSalary] = useState('') // ★追加

  const [monthlySales, setMonthlySales] = useState(0)
  const [monthlySalary, setMonthlySalary] = useState(0)
  const [avgDaily, setAvgDaily] = useState(0)

  const [sampleSales, setSampleSales] = useState('400000')

  useEffect(() => {
    init()
  }, [])

  const init = async () => {

    const config = await getSalaryConfig(uuid)
    if (!config) return

    setThreshold(String(config.monthly_threshold ?? 0))
    setLowRate(String(config.low_rate ?? 0))
    setHighRate(String(config.high_rate ?? 0))
    setAdjustment(String(config.adjustment ?? 0))
    setBaseSalary(String(config.base_salary ?? 0)) // ★追加

    const savedClosing = await AsyncStorage.getItem(CLOSING_DAY_KEY)
    const closingDay = savedClosing ? Number(savedClosing) : 31

    const today = new Date().toISOString().slice(0, 10)

    const sales = await getMonthlyTotalSales(uuid, today, closingDay)

    setMonthlySales(sales)

    const salary = calculateMonthlySalary(sales, config)

    setMonthlySalary(salary)

    const days = config.target_days ?? 12
    setAvgDaily(days > 0 ? Math.floor(salary / days) : 0)
  }

  const handleSave = async () => {

    const newConfig = {
      monthly_threshold: Number(threshold),
      target_days: 12,
      low_rate: Number(lowRate),
      high_rate: Number(highRate),
      adjustment: Number(adjustment),
      base_salary: Number(baseSalary), // ★追加
    }

    await saveSalaryConfig(uuid, newConfig)

    alert('保存しました')

    const salary = calculateMonthlySalary(monthlySales, newConfig)

    setMonthlySalary(salary)

    const days = newConfig.target_days ?? 12
    setAvgDaily(days > 0 ? Math.floor(salary / days) : 0)
  }

  /* =====================
     計算ロジック（シンプル維持）
  ===================== */

  const calculateMonthlySalary = (sales: number, conf: any) => {

    const threshold = Number(conf.monthly_threshold) || 0
    const low = Number(conf.low_rate) || 0
    const high = Number(conf.high_rate) || 0
    const adj = Number(conf.adjustment) || 0
    const base = Number(conf.base_salary) || 0 // ★追加

    if (sales <= threshold) {
      return Math.floor(
        base +
        (sales * low) +
        adj
      )
    }

    const over = sales - threshold

    return Math.floor(
      base +
      (threshold * low) +
      (over * high) +
      adj
    )
  }

  /* =====================
     シミュ
  ===================== */

  const sampleSalary = calculateMonthlySalary(
    Number(sampleSales),
    {
      monthly_threshold: Number(threshold),
      low_rate: Number(lowRate),
      high_rate: Number(highRate),
      adjustment: Number(adjustment),
      base_salary: Number(baseSalary), // ★追加
    }
  )

  return (

    <View style={styles.card}>

      <Text style={styles.title}>給与マスター</Text>

      <Text>基本給</Text>
      <TextInput
        style={styles.input}
        value={baseSalary}
        onChangeText={setBaseSalary}
        keyboardType="numeric"
      />

      <Text>足切り売上</Text>
      <TextInput style={styles.input} value={threshold} onChangeText={setThreshold} keyboardType="numeric" />

      <Text>低歩合</Text>
      <TextInput style={styles.input} value={lowRate} onChangeText={setLowRate} keyboardType="numeric" />

      <Text>高歩合</Text>
      <TextInput style={styles.input} value={highRate} onChangeText={setHighRate} keyboardType="numeric" />

      <Text>調整給</Text>
      <TextInput style={styles.input} value={adjustment} onChangeText={setAdjustment} keyboardType="numeric" />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={{ color: '#fff' }}>保存</Text>
      </Pressable>

      {/* ===== 実績 ===== */}

      <View style={styles.simBox}>
        <Text style={styles.simTitle}>今月実績</Text>

        <Text style={styles.simText}>
          売上：{monthlySales.toLocaleString()} 円
        </Text>

        <Text style={styles.simText}>
          給与：{monthlySalary.toLocaleString()} 円
        </Text>

        <Text style={styles.simText}>
          平均日次：{avgDaily.toLocaleString()} 円
        </Text>
      </View>

      {/* ===== シミュ ===== */}

      <View style={styles.simBox}>
        <Text style={styles.simTitle}>給与シミュレーション</Text>

        <Text>想定売上</Text>
        <TextInput
          style={styles.input}
          value={sampleSales}
          onChangeText={setSampleSales}
          keyboardType="numeric"
        />

        <Text style={styles.simText}>
          想定給与：{sampleSalary.toLocaleString()} 円
        </Text>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 4,
  },
  simBox: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 12,
  },
  simTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  simText: {
    fontSize: 13,
    color: '#333',
  },
})