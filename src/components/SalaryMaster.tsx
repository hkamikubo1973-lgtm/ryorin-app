import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import { getSalaryConfig, saveSalaryConfig } from '../database/salaryConfig'

type Props = {
  uuid: string
}

export default function SalaryMaster({ uuid }: Props) {
  const [threshold, setThreshold] = useState('')
  const [lowRate, setLowRate] = useState('')
  const [highRate, setHighRate] = useState('')
  const [adjustment, setAdjustment] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const config = await getSalaryConfig(uuid)
    if (config) {
      setThreshold(String(config.monthly_threshold ?? 0))
      setLowRate(String(config.low_rate ?? 0))
      setHighRate(String(config.high_rate ?? 0))
      setAdjustment(String(config.adjustment ?? 0))
    }
  }

  const handleSave = async () => {
    await saveSalaryConfig(uuid, {
      monthly_threshold: Number(threshold),
      target_days: 12,
      low_rate: Number(lowRate),
      high_rate: Number(highRate),
      adjustment: Number(adjustment),
    })
    alert('保存しました')
  }

  /* =====================
     ★ 給与シミュレーション
  ===================== */

  const avgDaily =
    Math.floor(
      (Number(threshold) || 0) * (Number(lowRate) || 0)
      + (Number(adjustment) || 0)
    )

  const monthlySample = avgDaily * 12

  /* =====================
     UI
  ===================== */

  return (
    <View style={styles.card}>
      <Text style={styles.title}>給与マスター</Text>

      <Text>足切り売上</Text>
      <TextInput
        style={styles.input}
        value={threshold}
        onChangeText={setThreshold}
        keyboardType="numeric"
      />

      <Text>低歩合</Text>
      <TextInput
        style={styles.input}
        value={lowRate}
        onChangeText={setLowRate}
        keyboardType="numeric"
      />

      <Text>高歩合</Text>
      <TextInput
        style={styles.input}
        value={highRate}
        onChangeText={setHighRate}
        keyboardType="numeric"
      />

      <Text>調整給</Text>
      <TextInput
        style={styles.input}
        value={adjustment}
        onChangeText={setAdjustment}
        keyboardType="numeric"
      />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={{ color: '#fff' }}>保存</Text>
      </Pressable>

      {/* ★ここが今回の完成ポイント */}
      <View style={styles.simBox}>
        <Text style={styles.simTitle}>給与シミュレーション（目安）</Text>

        <Text style={styles.simText}>
          平均日次：{avgDaily.toLocaleString()} 円
        </Text>

        <Text style={styles.simText}>
          想定月収：{monthlySample.toLocaleString()} 円（12日）
        </Text>
      </View>

    </View>
  )
}

/* =====================
   styles
===================== */

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

  /* ★追加 */
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