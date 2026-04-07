import { useStripe } from '@stripe/stripe-react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Preset deposit amounts in fiat (USD)
const PRESET_AMOUNTS = [10, 50, 100, 250];

/**
 * DEPOSIT / ONRAMP SCREEN
 * Handles fiat-to-crypto onboarding.
 * Currently uses Stripe's PaymentSheet to accept credit cards / Apple Pay.
 */
export default function DepositScreen() {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  
  // Track the amount the user wants to deposit, defaulting to $50
  const [depositAmount, setDepositAmount] = useState<number>(50);

  /**
   * Orchestrates the secure Stripe checkout flow.
   * 1. Asks our Node.js backend to securely generate a Payment Intent.
   * 2. Initializes the native Stripe UI with the secret token.
   * 3. Presents the UI to the user to complete the transaction.
   */
  const handleDepositPress = async () => {
    setLoading(true);

    try {
      // FIXME: These are local development URLs. 
      // Before production, this must be swapped to our hosted backend
      const backendUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000/create-payment-intent' 
        : 'http://localhost:3000/create-payment-intent';

      // Stripe API strictly expects integer amounts in the smallest currency unit (cents).
      const amountInCents = depositAmount * 100;

      // 1. Request the Client Secret from our secure backend
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInCents }), 
      });
      
      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        throw new Error(backendError);
      }

      // 2. Initialize the native iOS/Android Stripe UI
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'x402app',
        paymentIntentClientSecret: clientSecret,
        returnURL: Linking.createURL('stripe-redirect'),
      });

      if (initError) throw initError;

      // 3. Open the checkout drawer
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        // We ignore 'Canceled' so the user doesn't get an angry error just for closing the drawer
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', paymentError.message);
        }
      } else {
        // TODO: In Phase 2, trigger a webhook here or poll the backend to actually mint/transfer the USDC
        Alert.alert('Success', `Successfully deposited $${depositAmount}.00!`);
      }

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Funds</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Dynamic Amount Display */}
      <Text style={styles.amountDisplay}>${depositAmount}.00</Text>

      {/* Preset Amount Grid */}
      <View style={styles.presetContainer}>
        {PRESET_AMOUNTS.map((amount) => (
          <TouchableOpacity 
            key={amount} 
            style={[
              styles.presetButton, 
              depositAmount === amount && styles.presetButtonSelected
            ]}
            onPress={() => setDepositAmount(amount)}
          >
            <Text style={[
              styles.presetText,
              depositAmount === amount && styles.presetTextSelected
            ]}>
              ${amount}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.checkoutButton} 
        onPress={handleDepositPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.checkoutButtonText}>Continue with Stripe</Text>
        )}
      </TouchableOpacity>
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
    borderColor: '#333',
  },
  backButton: { padding: 10, marginLeft: -10 },
  backText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  amountDisplay: {
    fontSize: 56,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 40,
    color: '#fff',
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#161616',
    alignItems: 'center',
  },
  presetButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  presetText: { fontSize: 16, fontWeight: '600', color: '#888' },
  presetTextSelected: { color: '#fff' },
  checkoutButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});