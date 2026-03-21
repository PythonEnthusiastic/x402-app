import { useStripe } from '@stripe/stripe-react-native';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Preset deposit amounts in dollars
const PRESET_AMOUNTS = [10, 50, 100, 250];

export default function DepositScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  
  // Track the amount the user wants to deposit default to $50
  const [depositAmount, setDepositAmount] = useState<number>(50);

  const handleDepositPress = async () => {
    setLoading(true);

    try {
      const backendUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000/create-payment-intent' 
        : 'http://localhost:3000/create-payment-intent';

      // Stripe expects amounts in cents. So $5 = 500 cents.
      const amountInCents = depositAmount * 100;

      // Send the amount to backend to create a PaymentIntent
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInCents }), 
      });
      
      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        throw new Error(backendError);
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'x402app',
        paymentIntentClientSecret: clientSecret,
        returnURL: Linking.createURL('stripe-redirect'),
      });

      if (initError) throw initError;

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', paymentError.message);
        }
      } else {
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
      <Text style={styles.headerTitle}>Add Funds</Text>
      
      {/* Display the current selected amount */}
      <Text style={styles.amountDisplay}>${depositAmount}.00</Text>

      {/* Preset Amount Buttons */}
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

      {/* The main checkout button */}
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
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8f9fa', // Light gray background
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111',
  },
  amountDisplay: {
    fontSize: 56,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 40,
    color: '#000',
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  presetButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  presetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  presetTextSelected: {
    color: '#fff',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});