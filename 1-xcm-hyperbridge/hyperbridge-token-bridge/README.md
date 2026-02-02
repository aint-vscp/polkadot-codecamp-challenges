# Hyperbridge Token Bridge

A cross-chain token bridge built using the **Hyperbridge SDK** that enables ERC20 token transfers between different chains in the Polkadot ecosystem.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Source Chain  │         │   Hyperbridge    │         │   Dest Chain    │
│                 │         │                  │         │                 │
│  TokenBridge    │───────▶│   TokenGateway   │───────▶│   TokenGateway  │
│  (this contract)│         │   (teleport)     │         │   (receive)     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## Features

- **Cross-chain Token Transfers**: Bridge ERC20 tokens across Polkadot ecosystem chains
- **Token Registry**: Admin-managed list of supported tokens with asset IDs
- **Configurable Timeouts**: Set default or per-transaction timeouts
- **Emergency Recovery**: Owner can recover stuck tokens
- **Event Logging**: Full event emission for off-chain tracking

## Contract Overview

### TokenBridge.sol

| Function | Description |
| -------- | ----------- |
| `bridgeTokens()` | Bridge tokens to another chain using default timeout |
| `bridgeTokensWithTimeout()` | Bridge with custom timeout |
| `registerToken()` | Register a new token for bridging (owner only) |
| `deregisterToken()` | Remove a token from supported list (owner only) |
| `setDefaultTimeout()` | Update default timeout (owner only) |
| `getSupportedTokens()` | Get all supported token symbols |
| `isTokenSupported()` | Check if a token is supported |
| `getTokenInfo()` | Get token address and asset ID by symbol |

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd hyperbridge-token-bridge

# Install dependencies
forge install
```

## Build

```bash
forge build
```

## Test

```bash
forge test -vv
```

All 25+ unit tests should pass, covering:
- Constructor validation
- Token registration/deregistration
- Bridge token functionality
- Admin functions
- View functions

## Deployment

### Environment Setup

Create a `.env` file:

```bash
PRIVATE_KEY=your_private_key_here
TOKEN_BRIDGE_ADDRESS=deployed_bridge_address  # For RegisterTokensScript
```

### Deploy to Testnet

```bash
# Deploy to Sepolia
forge script script/TokenBridge.s.sol:TokenBridgeScript \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --broadcast

# Deploy to Paseo (Polkadot Hub TestNet)
forge script script/TokenBridge.s.sol:TokenBridgeScript \
  --rpc-url https://testnet-paseo-rpc.polkadot.io \
  --broadcast
```

### Register Tokens

After deployment, register tokens using the `RegisterTokensScript`.

## Supported Network Pairs

| Source Network | Destination Network | Status |
| -------------- | ------------------- | ------ |
| Paseo | ETH Sepolia | Supported |
| BSC Testnet | ETH Sepolia | Planned |
| Optimism Sepolia | ETH Sepolia | Planned |

## Deployment Addresses

| Network | Contract | Address |
| ------- | -------- | ------- |
| Sepolia | TokenBridge | *To be deployed* |
| Paseo | TokenBridge | *To be deployed* |

## Frontend

A web-based UI is available in the `frontend/` directory. Open `frontend/index.html` in your browser to:

1. Connect your MetaMask wallet
2. Select source and destination chains
3. Choose a token and enter amount
4. Execute the bridge transaction

## Usage Example

```solidity
// 1. Approve the bridge to spend your tokens
IERC20(tokenAddress).approve(bridgeAddress, amount);

// 2. Call bridgeTokens
TokenBridge(bridgeAddress).bridgeTokens(
    tokenAddress,        // Token to bridge
    "USDC",              // Token symbol (must be registered)
    1000000,             // Amount (6 decimals for USDC)
    recipientAddress,    // Recipient on destination chain
    destChainBytes       // Destination chain identifier
);
```

## Security Considerations

- Only the owner can register/deregister tokens
- Users must approve the bridge before transferring
- Emergency token recovery is owner-only
- All transfers emit events for transparency

## License

MIT
