/**
 * CUSTOM EXPO ENTRY POINT
 * We override the default Expo entry so we can inject Node.js polyfills 
 * into the global scope before the React Native component tree mounts. 
 * If Expo boots before the polyfills, the Web3Auth cryptography engine will crash.
 */

// Load the polyfills and force them to evaluate first
import './globals.js';

// Boot up Expo Router second so it can find the polyfilled globals
import 'expo-router/entry';
