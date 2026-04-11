import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getLogs } from '../database/logs';

export const exportLogsToCsv = async () => {
  try {

    const logs = await getLogs();

    if (!logs || logs.length === 0) {
      alert('ログがありません');
      return;
    }

    // ===== ヘッダー =====
    const header = 'uuid,created_at,action,detail\n';

    // ===== 行生成 =====
    const rows = logs.map(log => {

      const detail = log.detail
        ? `"${log.detail.replace(/"/g, '""')}"`
        : '';

      return `${log.uuid},${log.created_at},${log.action},${detail}`;
    });

    const csv = header + rows.join('\n');

    // ===== ファイル名（日付付き）=====
    const now = new Date();
    const fileName = `logs_${now.toISOString().slice(0,10)}.csv`;

    const fileUri = FileSystem.documentDirectory + fileName;

    // ===== BOM追加（Excel対策）=====
    const BOM = '\uFEFF';

    await FileSystem.writeAsStringAsync(
      fileUri,
      BOM + csv,
    );

    // ===== 共有 =====
    await Sharing.shareAsync(fileUri);

  } catch (e) {
    console.log('CSV出力エラー', e);
    alert('CSV出力に失敗しました');
  }
};