import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { generateAiCard } from '../utils/generateAiCard';
import { commonStyles } from '../styles/common';

type Props = {
  sales: number;
  areaSlots: {
    morning: string[];
    day: string[];
    night: string[];
  };
};

export const ActionCard = ({ sales, areaSlots }: Props) => {

  // 安全対策
  const safeAreaSlots = areaSlots ?? {
    morning: [],
    day: [],
    night: [],
  };

  const lines = generateAiCard({
    sales,
    areaSlots: safeAreaSlots,
  });

  return (
    <View style={commonStyles.container}>
      <View style={[commonStyles.card, styles.highlight]}>

        <Text style={commonStyles.section}>
          今日の振り返り
        </Text>

        {lines.map((line, i) => (
          <Text key={i} style={commonStyles.text}>
            {line}
          </Text>
        ))}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: '#EAF4FF',
    borderColor: '#90CAF9',
  },
});