// Load the polyfills and force them to evaluate first
import './globals.js';

// Boot up Expo Router second so it can find the polyfilled globals
import 'expo-router/entry';
