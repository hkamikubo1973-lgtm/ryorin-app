import { StyleSheet } from 'react-native'

/* =========================================
   共通スタイル（全画面統一用）
========================================= */

export const commonStyles = StyleSheet.create({

  /* ===== 画面全体 ===== */
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: '#FFFFFF',
  },

  /* ===== カード ===== */
  card: {
    width: '100%',
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  /* ===== セクションタイトル ===== */
  section: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#263238',
  },

  /* ===== タイトル（大） ===== */
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },

  /* ===== サブテキスト（追加） ===== */
  textSub: {
    fontSize: 12,
    color: '#666',
  },

  /* ===== 通常テキスト（追加） ===== */
  text: {
    fontSize: 14,
    color: '#333',
  },

  /* ===== 入力欄 ===== */
  input: {
    borderWidth: 1.5,
    borderColor: '#B0BEC5',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 6,
  },

  /* ===== テキストエリア ===== */
  textarea: {
    borderWidth: 1.5,
    borderColor: '#B0BEC5',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 6,
  },

  /* ===== プライマリボタン ===== */
  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* ===== セカンダリボタン ===== */
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonOutlineText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },

  /* ===== 危険ボタン（追加） ===== */
  buttonDanger: {
    borderWidth: 1,
    borderColor: '#E57373',
    backgroundColor: '#FDECEA',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonDangerText: {
    color: '#C62828',
    fontWeight: '600',
  },

  /* ===== 小ボタン（チップ系） ===== */
  chip: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  chipActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },

  chipText: {
    fontSize: 13,
    color: '#444',
  },

  chipTextActive: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },

  /* ===== 選択状態（追加） ===== */
  selected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },

  /* ===== 横並び（追加） ===== */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* ===== 保存完了表示 ===== */
  successText: {
    marginTop: 6,
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
  },

  /* ===== エラー表示 ===== */
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#D32F2F',
    textAlign: 'center',
  },

/* ===== 追加 ===== */

  sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
},

outlineButton: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#2F80ED',
},

outlineButtonText: {
  color: '#2F80ED',
  fontWeight: 'bold',
},

barRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginVertical: 8,
  gap: 4,
},

bar: {
  width: 18,
  height: 10,
  backgroundColor: '#90CAF9',
  borderRadius: 3,
},

barActive: {
  backgroundColor: '#1976D2',
},

patternWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 6,
},

buttonHalf: {
  flex: 1,
  height: 44,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 10,
},

buttonHalfPrimary: {
  backgroundColor: '#1976D2',
},

buttonHalfOutline: {
  borderWidth: 1,
  borderColor: '#1976D2',
},

buttonHalfText: {
  fontSize: 15,
  fontWeight: 'bold',
},

buttonHalfTextPrimary: {
  color: '#fff',
},

buttonHalfTextOutline: {
  color: '#1976D2',
},
buttonOutlineSmall: {
  borderWidth: 1,
  borderColor: '#1976D2',
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 12,
},
accordionToggle: {
  marginTop: 4,
  paddingVertical: 4,
  paddingHorizontal: 12,
},

accordionText: {
  fontSize: 13,
  fontWeight: '300',
  color: '#1976D2',
},
savedMessage: {
  textAlign: 'center',
  marginTop: 6,
  color: '#4CAF50',
  fontSize: 13,
},
})