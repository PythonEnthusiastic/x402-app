import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WalletDashboard() {
  const router = useRouter(); // Expo Router hook for navigation
  const BalanceUSD = "$1,234.56";
  const BalanceUSDC = "1,234.56 USDC";
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Wallet Dashboard</Text>
      </View>

      {/* Balance Display*/}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.usdBalance}>{BalanceUSD}</Text>
        <Text style={styles.usdcBalance}>{BalanceUSDC}</Text>
      </View>

      {/* Action buttons to different screens */}
      <View style={styles.buttonsContainer}>

        {/* Add funds button */}
        <TouchableOpacity
        style={styles.depositButton}
        onPress={() => router.push('/deposit')}>
          <Text style={styles.depositButtonText}>Depsoit Funds</Text>
        </TouchableOpacity>

        {/* Withdraw Funds button */}
        <TouchableOpacity
        style={styles.paymentButton}
        onPress={() => router.push('/pay')}>
          <Text style={styles.paymentButtonText}>Make Payment</Text>
        </TouchableOpacity>

        {/* Offramp/Withdraw Funds button */}
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => router.push('/withdraw')}>
          <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 16,
    paddingTop: 60, // pushed down to avoid iOS bar
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#161616',
    alignItems: 'center',
    marginBottom: 50,
    paddingVertical: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  balanceLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  usdBalance: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  usdcBalance: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  buttonsContainer: {
    gap: 15,
  },
  depositButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  depositButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 10
  },
  withdrawButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },

});