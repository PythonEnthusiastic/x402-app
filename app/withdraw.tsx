import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * WITHDRAW / OFFRAMP SCREEN
 * Placeholder screen for converting crypto back to fiat.
 * TODO: Integrate Stripe Connect or Ramp Network here for ACH bank payouts.
 */
export default function WithdrawScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Placeholder Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Offramp</Text>
        <Text style={styles.subtitle}>Bank withdrawal integration coming soon.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderColor: '#333'
  },
  backButton: { padding: 10, marginLeft: -10 },
  backText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    paddingBottom: 100 // Push up slightly from exact center
  },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#666', fontSize: 16 }
});