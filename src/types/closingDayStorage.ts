// src/utils/closingDayStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'closingDay';

export const getClosingDay = async (): Promise<number> => {
  const value = await AsyncStorage.getItem(KEY);
  return value ? Number(value) : 31; // デフォルトは月末
};

export const setClosingDay = async (day: number) => {
  await AsyncStorage.setItem(KEY, String(day));
};
