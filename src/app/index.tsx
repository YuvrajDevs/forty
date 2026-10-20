import { StyleSheet, Text, View } from 'react-native';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Put God before the scroll.</Text>
      <Text style={styles.subtitle}>Read the Bible before you scroll.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FAF6EA' },
  title: { fontSize: 28, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },
  subtitle: { marginTop: 12, fontSize: 16, color: '#5C5648', textAlign: 'center' },
});
