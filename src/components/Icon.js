import { View, Text, StyleSheet } from 'react-native'

export default function Icon({ item }) {
  const glyph = item.initial || item.name[0]
  return (
    <View style={[styles.icon, { backgroundColor: item.color }]}>
      <Text style={styles.glyph}>{glyph}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  icon: { width: 37, height: 37, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  glyph: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
