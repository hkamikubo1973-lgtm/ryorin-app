import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  WeatherType,
  updateWeatherByDutyDate,
  getTodayWeather,
} from '../database/database';

import { commonStyles } from '../styles/common';

type Props = {
  uuid: string;
  dutyDate: string;
};

const weatherOptions: WeatherType[] = ['晴', '曇', '雨', '雪', '荒天'];

export default function WeatherPicker({ uuid, dutyDate }: Props) {

  const [selected, setSelected] = useState<WeatherType | null>(null);

  const loadWeather = async () => {
    const w = await getTodayWeather(uuid, dutyDate);
    setSelected(w);
  };

  useEffect(() => {
    loadWeather();
  }, [dutyDate]);

  const onSelect = async (w: WeatherType) => {
    await updateWeatherByDutyDate(uuid, dutyDate, w);
    setSelected(w);
  };

  return (
    <View style={commonStyles.card}>

      {weatherOptions.map(w => (

        <TouchableOpacity
          key={w}
          onPress={() => onSelect(w)}
          style={[
            commonStyles.chip,
            selected === w && commonStyles.chipActive,
          ]}
        >

          <Text
            style={[
              commonStyles.chipText,
              selected === w && commonStyles.chipTextActive,
            ]}
          >
            {w}
          </Text>

        </TouchableOpacity>

      ))}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },

});