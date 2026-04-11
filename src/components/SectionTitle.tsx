import { Text, View } from 'react-native';

export default function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          borderLeftWidth: 4,
          borderLeftColor: '#1e88e5',
          paddingLeft: 8,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
