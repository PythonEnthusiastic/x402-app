/**
 * REACT NATIVE WEB3 POLYFILLS
 * React Native does not naturally support Node.js core modules (like 'crypto' or 'buffer').
 * Web3 libraries require these to sign blockchain transactions. 
 * This file mimics a Node.js environment directly on the mobile device.
 */

// Inject the complete OpenSSL cryptography engine first.
// We use 'react-native-quick-crypto' because it is a native C++ binding, so it's much faster
import { install } from 'react-native-quick-crypto';
install(); 

// Load the remaining Node environment requirements
import { Buffer } from 'buffer';
import 'fast-text-encoding';
import process from 'process';

// Attach polyfills to the global window object so Web3Auth can find them anywhere
global.Buffer = global.Buffer || Buffer;
global.process = process;

// Trick Web3 libraries into thinking they are running in a standard Node environment
global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production';

// Polyfill base64 encoding/decoding, which is heavily used by Solana transaction hashes
global.btoa = global.btoa || function (str) { return Buffer.from(str, 'binary').toString('base64'); };
global.atob = global.atob || function (b64Encoded) { return Buffer.from(b64Encoded, 'base64').toString('binary'); };