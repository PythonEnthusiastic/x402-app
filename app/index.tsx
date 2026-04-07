import { LOGIN_PROVIDER } from '@web3auth/react-native-sdk';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { setIsAuthenticated } from '../authState';
import { db } from '../firebaseConfig';
import { web3auth } from './_layout';

/**
 * LOGIN & AUTHENTICATION SCREEN
 * The entry point of the app. Handles Google SSO, non-custodial wallet derivation, 
 * and syncing the user profile to the Firebase Social Graph.
 */
export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);

  /**
   * Extracts the raw Base58 Solana public key from the Web3Auth provider 
   * after a successful login.
   */
  const getSolanaAddress = async (): Promise<string | null> => {
    if (!web3auth.provider) return null;
    const accounts = await web3auth.provider.request({ method: 'requestAccounts' });
    if (Array.isArray(accounts) && accounts.length > 0 && typeof accounts[0] === 'string') {
      return accounts[0];
    }
    return null;
  };

  /**
   * Master authentication flow.
   */
  const handleLogin = async () => {
    setLoading(true);

    try {
      // 1. Trigger the Web3Auth Google Login UI
      // FIXME: mfaLevel is 'none' for rapid development. 
      // MUST be changed to 'mandatory' for production to enable cross-device account recovery.
      await web3auth.login({
        loginProvider: LOGIN_PROVIDER.GOOGLE,
        curve: 'ed25519',
        mfaLevel: 'none' 
      });

      if (!web3auth.provider) throw new Error('Provider not found after login.');

      // 2. Fetch the newly derived Solana wallet address
      const walletAddress = await getSolanaAddress();
      if (!walletAddress) throw new Error('Unable to fetch Solana account.');

      console.log('✅ Wallet successfully connected:', walletAddress);

      // 3. Extract the user's social info from the Google token
      const userInfo = await web3auth.userInfo();

      // 4. Save the user to Firebase
      // We use the Solana address as the explicit Document ID to perfectly link the blockchain to the DB.
      const userRef = doc(db, 'users', walletAddress);
      await setDoc(userRef, {
        email: userInfo?.email || '',
        name: userInfo?.name || '',
        walletAddress: walletAddress,
      }, { merge: true });

      console.log("✅ User successfully saved to Firestore!");

      // 5. Trigger UI success state *only* after database save succeeds
      setAddress(walletAddress);

      // 6. Navigate to main dashboard
      setIsAuthenticated(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);

    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>X402</Text>
        <Text style={styles.subtitle}>Microtransactions</Text>
      </View>
      
      {/* Conditionally render the success card or the login button */}
      {address ? (
        <View style={styles.successCard}>
          <Text style={styles.label}>WALLET CONNECTED</Text>
          <Text style={styles.addressText}>{address}</Text>
          <ActivityIndicator size="small" color="#4ADE80" style={{ marginTop: 10 }} />
          <Text style={styles.redirectText}>Redirecting to dashboard...</Text>
        </View>
      ) : (
        <View style={styles.loginSection}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Connect with Google</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.footerText}>Secure authentication via Web3Auth</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#0A0A0A',
    paddingVertical: 100,
    paddingHorizontal: 30 
  },
  header: { alignItems: 'center' },
  title: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5, textAlign: 'center' },
  loginSection: { width: '100%', alignItems: 'center' },
  button: { 
    backgroundColor: '#007AFF', 
    paddingVertical: 18, 
    borderRadius: 16, 
    width: '100%', 
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footerText: { color: '#444', fontSize: 12, marginTop: 20 },
  successCard: { 
    backgroundColor: '#161616', 
    padding: 25, 
    borderRadius: 24, 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#333',
    alignItems: 'center'
  },
  label: { fontSize: 10, color: '#4ADE80', fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  addressText: { fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center', opacity: 0.8 },
  redirectText: { fontSize: 12, color: '#666', marginTop: 15 }
});