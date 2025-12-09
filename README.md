# Multilend

A cross-chain decentralized lending and borrowing platform that enables users to deposit collateral on Stellar and borrow assets on Polkadot. Built with React, Vite, and Soroban smart contracts.

## Overview

Multilend is a DeFi protocol that bridges liquidity between Stellar and Polkadot networks, allowing users to:
- **Deposit collateral** on Stellar (XLM, USDC, EUR)
- **Borrow assets** on Polkadot
- **Manage positions** across both networks through a unified interface

The platform uses Soroban smart contracts on Stellar to lock collateral and emits events that trigger cross-chain bridge operations to mint equivalent tokens on Polkadot.

## Features

- 🔐 **Wallet Integration**: Connect with Freighter wallet for Stellar network
- 💰 **Deposit Collateral**: Lock assets on Stellar to use as collateral
- 📊 **Borrow Assets**: Borrow assets on Polkadot using your Stellar collateral
- 🌉 **Cross-Chain Bridge**: Seamless asset transfer between Stellar and Polkadot
- 📈 **Transaction History**: Track all your deposits and borrows
- 🎨 **Modern UI**: Clean, responsive interface built with React

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Stellar SDK** - Stellar network interactions
- **Freighter API** - Wallet integration

### Smart Contracts
- **Rust** - Smart contract language
- **Soroban SDK** - Stellar smart contract framework
- **WASM** - Contract compilation target

### Networks
- **Stellar Testnet** - For collateral deposits
- **Polkadot** - For borrowing operations

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Rust toolchain (for smart contract development)
- Freighter wallet extension installed in your browser

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Multilend
```

2. Install dependencies:
```bash
npm install
```

3. Build smart contracts (optional, for development):
```bash
cd src/contract
cargo build --target wasm32-unknown-unknown --release
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
Multilend/
├── src/
│   ├── components/          # React components
│   │   ├── DepositCard.jsx  # Deposit collateral interface
│   │   ├── BorrowCard.jsx   # Borrow assets interface
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   └── Navbar.jsx       # Navigation bar
│   ├── pages/
│   │   └── Dashboard.jsx    # Main dashboard page
│   ├── contexts/
│   │   └── WalletContext.jsx # Wallet connection context
│   ├── contract/            # Soroban smart contracts
│   │   └── src/
│   │       └── lib.rs       # Collateral vault contract
│   ├── backend/             # Backend scripts
│   │   ├── deploy.cjs       # Contract deployment
│   │   ├── bridge_listener.cjs # Bridge event listener
│   │   └── check_relayer.cjs   # Relayer status checker
│   ├── constants.js         # Network and contract constants
│   ├── App.jsx              # Main app component
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── package.json
└── README.md
```

## Smart Contracts

### Collateral Vault Contract

The main smart contract (`CollateralVault`) handles:

- **Deposit**: Locks user assets and emits events for bridge operations
- **Withdraw**: Releases locked collateral (typically called by bridge)

**Key Functions:**
- `deposit(user, token, amount, destination)` - Lock collateral and trigger bridge
- `withdraw(to, token, amount)` - Release collateral back to user

**Contract Address (Testnet):**
```
CAIGF53UI7SWZXSQPHJNSYRK7T2AMPWEAF6I6R57IXFDNVQNFQAYF7IA
```

## Usage

### Connecting Your Wallet

1. Install [Freighter](https://freighter.app/) browser extension
2. Create or import a Stellar account
3. Click "Connect Wallet" in the application
4. Approve the connection request

### Depositing Collateral

1. Ensure your wallet is connected
2. Select an asset (XLM, USDC, or EUR)
3. Enter the amount you want to deposit
4. Click "Deposit [Asset]"
5. Approve the transaction in Freighter
6. Wait for confirmation

### Borrowing Assets

1. Set your Polkadot destination address
2. Select the asset you want to borrow
3. Enter the amount (based on your collateral)
4. Click "Borrow [Asset]"
5. Complete the transaction

## Configuration

Update network settings in `src/constants.js`:

```javascript
export const CONTRACT_ID = "YOUR_CONTRACT_ID";
export const NATIVE_TOKEN_ID = "YOUR_NATIVE_TOKEN_ID";
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
```

## Bridge Integration

The platform uses event-driven architecture for cross-chain operations:

1. User deposits collateral on Stellar
2. Smart contract emits a `deposit` event
3. Bridge listener (Spacewalk) detects the event
4. Equivalent tokens are minted on Polkadot
5. User receives tokens at the specified Polkadot address

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]

## Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This project is currently deployed on Stellar Testnet. Always verify contract addresses and network settings before using in production.
