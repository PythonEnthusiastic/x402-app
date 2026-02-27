// Inject the complete OpenSSL cryptography engine first, before anything else, to ensure all crypto functions are available for Web3Auth and Ethers
import { install } from 'react-native-quick-crypto';
install(); 

// Load the rest of the Web3 requirements after the crypto engine is installed 
import { Buffer } from 'buffer';
import 'fast-text-encoding';
import process from 'process';

global.Buffer = global.Buffer || Buffer;
global.process = process;
global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production';
global.btoa = global.btoa || function (str) { return Buffer.from(str, 'binary').toString('base64'); };
global.atob = global.atob || function (b64Encoded) { return Buffer.from(b64Encoded, 'base64').toString('binary'); };