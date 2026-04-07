import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

// --- EXPO URL IMPORTS ---
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';

// --- WEB3AUTH & BLOCKCHAIN IMPORTS ---
import { CHAIN_NAMESPACES } from '@web3auth/base';
import Web3Auth, { WEB3AUTH_NETWORK } from '@web3auth/react-native-sdk';
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { setIsAuthenticated } from '../authState';

// ---------------------------------------------------------
// 1. GENERATE THE REDIRECT URL
// ---------------------------------------------------------
/**
 * Web3Auth requires a whitelist URL to redirect back to the app after Google Login.
 * - StoreClient (Expo Go): Uses a generic Expo linking URL.
 * - Production (Bare/Built App): Uses our custom app scheme (x402app://)
 */
const resolvedRedirectUrl =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ? Linking.createURL('web3auth', {})
    : Linking.createURL('web3auth', { scheme: 'x402app' });

// ---------------------------------------------------------
// 2. CONFIGURE THE BLOCKCHAIN NETWORK 
// ---------------------------------------------------------
/**
 * Configures the cryptographic curve and blockchain network.
 * We are using Solana Devnet for rapid, low-fee testing. 
 * TODO: Swap 'rpcTarget' and 'chainId' to Solana Mainnet before production launch.
 */
const privateKeyProvider = new SolanaPrivateKeyProvider({
  config: { 
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.SOLANA,
      chainId: '0x3', // 0x3 is the standard identifier for Solana Devnet
      rpcTarget: 'https://api.devnet.solana.com',
      displayName: 'Solana Devnet',
      blockExplorerUrl: 'https://explorer.solana.com/?cluster=devnet',
      ticker: 'SOL',
      tickerName: 'Solana',
    }
  }
});

// ---------------------------------------------------------
// 3. CREATE THE WEB3AUTH ENGINE
// ---------------------------------------------------------
/**
 * The core Web3Auth instance. 
 * SecureStore is injected to safely hold session tokens in the device's secure enclave.
 * WebBrowser is injected so the Google login pops up inside the app, not in Safari.
 */
export const web3auth = new Web3Auth(WebBrowser, SecureStore, {
  clientId: 'BFc94jCepY0_jtw3VbLwK5defAGUfQ9wz813xOTZ2nU-kn3PkMVMsLs5EMJsxk7Qk0Zxvuu2JtEzd4B6Sx5B4xI',
  network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, 
  redirectUrl: resolvedRedirectUrl,
  privateKeyProvider: privateKeyProvider,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

// ---------------------------------------------------------
// 4. ROOT COMPONENT
// ---------------------------------------------------------

export default function RootLayout() {
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
  
  // State to track if the engine is awake
  const [isWeb3Ready, setIsWeb3Ready] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.init();
        setIsAuthenticated(Boolean(web3auth.provider));
        console.log('✅ Web3Auth initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing Web3Auth:', error);
        setIsAuthenticated(false);
      } finally {
        // Tell the app the engine is finished booting, whether it succeeded or failed
        setIsWeb3Ready(true); 
      }
    };
    init();
  }, []);

  // Block the UI from rendering until Web3Auth is ready
  if (!isWeb3Ready) {
    return null; // This keeps the splash screen visible while loading
  }

  return (
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.com.x402app"
      urlScheme="x402app"
    >
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="pay" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </StripeProvider>
  );
}