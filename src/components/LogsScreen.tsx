import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { getLogs } from '../database/logs';
import { exportLogsToCsv } from '../utils/exportLogsToCsv';

type LogType = {
  id: number;
  uuid: string;
  action: string;
  detail: string;
  created_at: string;
};

export default function LogsScreen() {

  const [logs, setLogs] = useState<LogType[]>([]);
  const [open, setOpen] = useState(false); // ★追加（アコーディオン）

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await getLogs();
    setLogs(data as LogType[]);
  };

  return (
    <ScrollView style={styles.container}>

      {/* ===== CSVボタン（常に表示）===== */}
      <TouchableOpacity
        style={styles.exportButton}
        onPress={exportLogsToCsv}
      >
        <Text style={styles.exportText}>
          CSVエクスポート
        </Text>
      </TouchableOpacity>

      {/* ===== アコーディオンヘッダー ===== */}
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.toggleText}>
          {open ? '▲ ログ（開発用）を閉じる' : '▼ ログ（開発用）'}
        </Text>
      </TouchableOpacity>

      {/* ===== ログ表示（開いた時だけ）===== */}
      {open && logs.map((log) => (
        <View key={log.id} style={styles.card}>

          <Text style={styles.time}>
            {log.created_at}
          </Text>

          <Text style={styles.action}>
            {log.action}
          </Text>

          <Text style={styles.detail}>
            {formatDetail(log.detail)}
          </Text>

        </View>
      ))}

    </ScrollView>
  );
}

/* ===== JSON整形 ===== */
const formatDetail = (detail: string) => {
  try {
    return JSON.stringify(JSON.parse(detail), null, 2);
  } catch {
    return detail;
  }
};

const styles = StyleSheet.create({

  container: {
    marginTop: 20,
    padding: 10,
  },

  /* ===== CSVボタン ===== */
  exportButton: {
    padding: 10,
    backgroundColor: '#ddd',
    marginBottom: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  exportText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* ===== トグル ===== */
  toggle: {
    paddingVertical: 8,
    marginBottom: 10,
  },

  toggleText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },

  /* ===== ログカード ===== */
  card: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },

  time: {
    fontSize: 12,
    color: '#666',
  },

  action: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },

  detail: {
    fontSize: 12,
    marginTop: 4,
  },

});