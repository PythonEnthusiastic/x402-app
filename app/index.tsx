import { LOGIN_PROVIDER } from '@web3auth/react-native-sdk';
import { ethers } from 'ethers';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { web3auth } from './_layout'; // Importing our initialized engine

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // Trigger the Web3Auth login flow with Google as the provider
      await web3auth.login({
        loginProvider: LOGIN_PROVIDER.GOOGLE,
        curve: 'secp256k1',
      });

      // Access the secure provider and signer from Web3Auth
      if (web3auth.provider) {
        // Wrap the Web3Auth secure provider with Ethers
        const ethersProvider = new ethers.BrowserProvider(web3auth.provider);
        
        // Retrieve the authorized signer (the user's secure wallet)
        const signer = await ethersProvider.getSigner();
        
        // extract the wallet address to display and use in the app
        const walletAddress = await signer.getAddress();
        
        setAddress(walletAddress);
        console.log("Wallet successfully connected:", walletAddress);

        // Redirect to the main dashboard after a short delay to show the success state
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      } else {
        console.error("Provider not found after login.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Authentication failed:", error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>X402</Text>
        <Text style={styles.subtitle}>Microtransactions</Text>
      </View>
      
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