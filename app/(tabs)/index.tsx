import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- BLOCKCHAIN IMPORTS ---
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useIsAuthenticated } from '../../authState';
import { web3auth } from '../_layout';

export default function WalletDashboard() {
  const router = useRouter(); 
  const isAuthenticated = useIsAuthenticated();
  
  const [walletAddress, setWalletAddress] = useState<string>('Loading...');
  const [balanceSOL, setBalanceSOL] = useState<string>('0.00');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        if (!isAuthenticated) {
          setLoading(false);
          router.replace('/');
          return;
        }

        // 1. Check if logged in
        if (!web3auth.provider) {
          console.log("User is not authenticated. Routing to login.");
          router.replace('/');
          return;
        }

        // 2. Fetch the Address
        const accounts = await web3auth.provider.request({ method: 'requestAccounts' });
        const address = Array.isArray(accounts) ? accounts[0] : null;
        
        if (!address || typeof address !== 'string') {
           throw new Error("Could not derive wallet address.");
        }
        
        setWalletAddress(address);

        // 3. Connect to Solana and Fetch Balance
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const publicKey = new PublicKey(address);
        const rawBalance = await connection.getBalance(publicKey);
        
        // Convert Lamports to SOL (9 decimal places)
        const formattedBalance = (rawBalance / LAMPORTS_PER_SOL).toFixed(4);
        setBalanceSOL(formattedBalance);

      } catch (error) {
        console.error("Dashboard Error:", error);
        setWalletAddress('Error connecting');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Wallet Dashboard</Text>
        <Text style={styles.addressTag}>
          {walletAddress.length > 20 
            ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`
            : walletAddress}
        </Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>TOTAL BALANCE (DEVNET)</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4ADE80" style={{ marginVertical: 20 }} />
        ) : (
          <>
            <Text style={styles.usdBalance}>{balanceSOL}</Text>
            <Text style={styles.usdcBalance}>SOL</Text>
          </>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.depositButton} onPress={() => router.push('/deposit')}>
          <Text style={styles.depositButtonText}>Deposit Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.paymentButton} onPress={() => router.push('/pay')}>
          <Text style={styles.paymentButtonText}>Make Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.withdrawButton} onPress={() => router.push('/withdraw')}>
          <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 16, paddingTop: 60 },
  header: { marginBottom: 40, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  addressTag: { color: '#666', fontSize: 12, marginTop: 5, backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  balanceCard: { backgroundColor: '#161616', alignItems: 'center', marginBottom: 50, paddingVertical: 30, borderRadius: 24, borderWidth: 1, borderColor: '#333' },
  balanceLabel: { color: '#888', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  usdBalance: { color: '#fff', fontSize: 56, fontWeight: '900', letterSpacing: -2 },
  usdcBalance: { color: '#4ADE80', fontSize: 16, fontWeight: '600', marginTop: 5 },
  buttonsContainer: { gap: 15 },
  depositButton: { backgroundColor: '#007AFF', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  depositButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  paymentButton: { backgroundColor: '#2A2A2A', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  paymentButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  withdrawButton: { backgroundColor: 'transparent', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333', marginTop: 10 },
  withdrawButtonText: { color: '#aaa', fontSize: 16, fontWeight: '600' },
});