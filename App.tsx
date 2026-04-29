/**
 * ============================================
 * ⚠ Phase2 安定固定領域（Technical Master Ver.T2）
 * ============================================
 */

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { ensureDailyMealMemoTable } from './src/database/mealRecords';
import { getDutyType } from './src/utils/getDutyType';
import { DutyType } from './src/types/DutyType';
import { getCycleSettings, saveCycleSettings } from './src/database/cycleSettings';
import { setDutyOverride, clearDutyOverride } from './src/database/dutyOverride';
import { initDatabase } from './src/database/database';
import { StatusBar } from 'expo-status-bar';

import DutySearchBar from './src/components/DutySearchBar';
import DailyMemo from './src/components/DailyMemo';
import TodayTotal from './src/components/TodayTotal';
import RecordInputForm from './src/components/RecordInputForm';
import MealInputButtons from './src/components/MealInputButtons';
import DailyMealSummary from './src/components/DailyMealSummary';
import TodayTimeline from './src/components/TodayTimeline';
import TodayRecordList from './src/components/TodayRecordList';
import LogsScreen from './src/components/LogsScreen';
import SalaryMaster from './src/components/SalaryMaster'

/* ===============================
   🔽 バナー
=============================== */
const HeaderBanner = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.banner,
        {
          paddingTop: insets.top, // ←これだけでOK
        }
      ]}
    >
      <Text style={styles.bannerText}>RYORIN</Text>
    </View>
  );
};

function App() {

  const DEBUG = true;

  const [booting, setBooting] = useState(true);

  const [uuid, setUuid] = useState<string>('');
  const [dutyDate, setDutyDate] = useState<string>('');
  const [dutyType, setDutyType] = useState<DutyType | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const [jumpText, setJumpText] = useState<string | null>(null);
  const [baseDate, setBaseDate] = useState<string | null>(null);
  const [pattern, setPattern] = useState<DutyType[] | null>(null);
  const [screen, setScreen] = useState<'main' | 'salary'>('main');

  /* ===============================
     初期化
  =============================== */
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        await ensureDailyMealMemoTable();

        let stored = await AsyncStorage.getItem('uuid');

        if (!stored) {
          stored = Crypto.randomUUID();
          await AsyncStorage.setItem('uuid', stored);
        }

        setUuid(stored);

        const today = new Date().toISOString().slice(0, 10);
        setDutyDate(today);

        const settings = await getCycleSettings(stored);

        if (settings) {
          setBaseDate(settings.base_date);
          setPattern(JSON.parse(settings.pattern_json));
        }

      } catch (e) {
        console.log('initエラー', e);
      } finally {
        setBooting(false);
      }
    };

    init();
  }, []);

  /* ===============================
     dutyType取得
  =============================== */
  useEffect(() => {
    const loadDutyType = async () => {
      if (!uuid || !dutyDate) return;
      const type = await getDutyType(uuid, dutyDate);
      setDutyType(type);
    };

    loadDutyType();
  }, [uuid, dutyDate]);

  const refreshAll = () => setRefreshKey(v => v + 1);

  const showJump = (text: string) => {
    setJumpText(text);
    setTimeout(() => setJumpText(null), 800);
  };

  /* ===============================
     勤務修正
  =============================== */
  const handleOverride = async (type: DutyType) => {
    await setDutyOverride(uuid, dutyDate, type);
    const newType = await getDutyType(uuid, dutyDate);
    setDutyType(newType);
    refreshAll();
  };

  const handleResetOverride = async () => {
    await clearDutyOverride(uuid, dutyDate);
    const newType = await getDutyType(uuid, dutyDate);
    setDutyType(newType);
    refreshAll();
  };

  /* ===============================
     起動ガード
  =============================== */
  if (booting || !uuid || !dutyDate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>起動中...</Text>
      </SafeAreaView>
    );
  }

  /* ===============================
     UI
  =============================== */
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ★ translucent削除（これ重要） */}
      <StatusBar style="dark" />

      {/* ★ SafeArea内に入れる */}
      <HeaderBanner />

    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 6 }}>
      <Text
        onPress={() => setScreen('main')}
        style={{
          marginRight: 20,
          color: screen === 'main' ? '#1976D2' : '#999',
          fontWeight: 'bold'
        }}
      >
        メイン
      </Text>

      <Text
        onPress={() => setScreen('salary')}
        style={{
          color: screen === 'salary' ? '#1976D2' : '#999',
          fontWeight: 'bold'
        }}
      >
        給与
      </Text>
        </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        <ScrollView
      contentContainerStyle={{ paddingBottom: 16 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >

  {screen === 'main' ? (
    <>

      <DutySearchBar
        uuid={uuid}
        dutyDate={dutyDate}
        dutyType={dutyType}
        jumpText={jumpText}
        baseDate={baseDate}
        pattern={pattern}
        onChange={(newDate, jumpType) => {
          setDutyDate(newDate);
          refreshAll();
          if (jumpType === 'long-next') showJump('＋30');
          if (jumpType === 'long-prev') showJump('－30');
        }}
        onSavePattern={async (newBaseDate, newPattern) => {
          await saveCycleSettings(uuid, newBaseDate, newPattern, 'cycle');
          setPattern(newPattern);
          setBaseDate(newBaseDate);
        }}
        onSetOverride={handleOverride}
        onResetOverride={handleResetOverride}
      />

      <DailyMemo uuid={uuid} dutyDate={dutyDate} />

      <TodayTotal
        uuid={uuid}
        dutyDate={dutyDate}
        refreshKey={refreshKey}
        onRefresh={refreshAll}
      />

      <RecordInputForm
        uuid={uuid}
        dutyDate={dutyDate}
        onSaved={refreshAll}
      />

      <MealInputButtons
        uuid={uuid}
        dutyDate={dutyDate}
        onMealRefresh={refreshAll}
      />

      <DailyMealSummary
        uuid={uuid}
        dutyDate={dutyDate}
        refreshKey={refreshKey}
      />

      <TodayTimeline
        uuid={uuid}
        dutyDate={dutyDate}
        refreshKey={refreshKey}
      />

      <TodayRecordList
        uuid={uuid}
        dutyDate={dutyDate}
        refreshKey={refreshKey}
      />

      {DEBUG && <LogsScreen />}

    </>
  ) : (
    <SalaryMaster uuid={uuid} />
  )}

</ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

/* ===============================
   スタイル
=============================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  banner: {
    backgroundColor: '#1976D2',
    paddingBottom: 10,
  },

  bannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

/* ===============================
   ルート
=============================== */
export default function AppWrapper() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}