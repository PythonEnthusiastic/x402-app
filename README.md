# X402 Microtransactions: Technical Architecture
## Overview

X402 is a React Native mobile application for seamless peer-to-peer stablecoin microtransactions. It abstracts blockchain complexity from users. Authentication is handled through Google SSO, and gas fees (SOL) are hidden so users can transact purely in USDC.

The architecture uses two parallel systems:

1. **Cryptography Layer (Web3Auth/Solana)**  
   Handles non-custodial wallet generation and transaction signing.

2. **Social Graph (Firebase Firestore)**  
   Maps human-readable identities (email/name) to 44-character wallet addresses for searchable P2P transfers.

## Tech Stack

- **Framework:** React Native + Expo (SDK 51+)
- **Routing:** Expo Router (file-based navigation)
- **Wallet & Auth:** Web3Auth (React Native SDK via `@web3auth/solana-provider`)
- **Blockchain:** Solana Devnet (ed25519 cryptographic curve)
- **Database:** Firebase Firestore (NoSQL)
- **Fiat Onramp:** Stripe React Native SDK (PaymentSheet)
