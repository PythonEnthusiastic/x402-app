import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// --- EXPO URL IMPORTS ---
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';

// --- WEB3AUTH & BLOCKCHAIN IMPORTS ---
import { CHAIN_NAMESPACES } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import Web3Auth, { WEB3AUTH_NETWORK } from '@web3auth/react-native-sdk';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { useColorScheme } from '@/hooks/use-color-scheme';

// ---------------------------------------------------------
// 1. GENERATE THE REDIRECT URL
// ---------------------------------------------------------
const resolvedRedirectUrl =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ? Linking.createURL('web3auth', {})
    : Linking.createURL('web3auth', { scheme: 'x402app' });

// DONE console.log("Register this URL in the Dashboard:", resolvedRedirectUrl);

// ---------------------------------------------------------
// 2. CONFIGURE THE BLOCKCHAIN NETWORK 
// ---------------------------------------------------------
// Note Llamarpc works for now for testing, but for production we need to swtich to a service like Ankr/Infura/Alchemy
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { 
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x2105", // The mathematical Hex ID for Base Mainnet ChainId-8453
      rpcTarget: "https://mainnet.base.org", // The official free Base node
      displayName: "Base Mainnet",
      blockExplorerUrl: "https://basescan.org",
      ticker: "ETH", // Gas paid in ETH
      tickerName: "Ethereum",
    }
  }
});

// ---------------------------------------------------------
// 3. CREATE THE WEB3AUTH ENGINE
// ---------------------------------------------------------
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
  const colorScheme = useColorScheme();
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

  // start the Web3Auth engine on app load
  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.init();
        console.log('Web3Auth initialized successfully');
      } catch (error) {
        console.error('Error initializing Web3Auth:', error);
      }
    };
    init();
  }, []);

  return (
    /* Wraps the app with StripeProvider */
    <StripeProvider
      publishableKey={stripePublishableKey}
      merchantIdentifier="merchant.com.x402app"
      urlScheme="x402app"
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </StripeProvider>
  );
}