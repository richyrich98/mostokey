# Fractional Video Rights

> **Status:** Testnet-ready MVP for tokenizing YouTube video rights into ERC-20 fractional units.  
> **Chain:** EVM (Polygon Amoy & Ethereum Sepolia testnets for development)  
> **Gas:** Paid by users (non-custodial)  
> **Budget Fit:** <$100 infra by using public RPCs + free tier hosting

A full-stack Web3 application that allows content creators to tokenize their YouTube videos into fractional ERC-20 tokens, enabling investors to purchase shares of video rights and creators to monetize their content in innovative ways.

## 🌟 Features

- **Multi-chain Support**: Deploy on Polygon Amoy or Ethereum Sepolia testnets
- **Video Rights Tokenization**: Convert YouTube videos into tradeable ERC-20 tokens
- **Creator Dashboard**: Track earnings, manage tokens, and withdraw proceeds
- **Token Marketplace**: Browse and purchase available video rights tokens
- **Ownership Verification**: Cryptographic attestation system for content ownership
- **Responsive Design**: Modern, mobile-friendly interface with smooth animations
- **Legal Compliance**: Comprehensive legal documentation and risk disclosures

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Testnet ETH/MATIC from faucets

### 1. Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd fractional-video-rights
npm install
npm run postinstall
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values:
PRIVATE_KEY=your_private_key_here
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
```

### 3. Get Testnet Tokens

**Polygon Amoy:**
- Faucet: https://faucet.polygon.technology/
- Add network: https://chainlist.org/chain/80002

**Ethereum Sepolia:**
- Faucet: https://sepoliafaucet.com/
- Add network: https://chainlist.org/chain/11155111

### 4. Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Polygon Amoy
npm run deploy:amoy

# OR deploy to Ethereum Sepolia  
npm run deploy:sepolia
```

### 5. Update Frontend Configuration

After deployment, update the factory address in `frontend/src/lib/config.js`:

```javascript
export const FACTORY_ADDRESSES = {
  80002: '0xYourDeployedFactoryAddress', // Polygon Amoy
  11155111: '0xYourDeployedFactoryAddress', // Ethereum Sepolia
};
```

### 6. Launch Application

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🏗️ Architecture

### Smart Contracts

- **RightsFactory.sol** - Main factory contract that deploys video token contracts and handles sales
- **VideoRightsToken.sol** - ERC-20 token representing fractional video rights

### Frontend Stack

- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **ethers.js** for Web3 integration
- **React Router** for navigation

### Key Directories

```
fractional-video-rights/
├── contracts/           # Smart contracts
├── scripts/            # Deployment scripts  
├── test/              # Contract tests
├── frontend/          # React application
│   ├── src/pages/     # Application pages
│   ├── src/components/# Reusable components
│   ├── src/lib/       # Web3 utilities
│   └── public/legal/  # Legal documents
└── deployments/       # Deployment artifacts
```

## 💡 Usage

### Creating a Token

1. Connect your Web3 wallet
2. Navigate to "Create" page
3. Enter YouTube video URL and token details
4. Sign ownership attestation
5. Deploy your token contract
6. Share token address with potential investors

### Buying Tokens

1. Visit "Buy" page to browse available tokens
2. Search by token address or browse listings
3. Enter purchase amount
4. Confirm transaction with required payment
5. Receive tokens in your wallet

### Managing as Creator

1. Access "Creator" dashboard
2. View all your created tokens
3. Track sales and earnings
4. Withdraw accumulated proceeds
5. Monitor token performance

## 🧪 Testing

```bash
# Run smart contract tests
npm test

# Test specific contracts
npx hardhat test test/RightsFactory.test.ts
```

## 🔒 Security Considerations

- All smart contracts use OpenZeppelin libraries
- Reentrancy protection on all state-changing functions
- Input validation and access controls
- Comprehensive error handling

## 📋 Legal Framework

The platform includes draft legal documents:

- **Terms of Service** - Platform usage terms
- **Risk Disclosure** - Comprehensive risk warnings
- **No-Securities Notice** - Clarification on token classification
- **Content Ownership Attestation** - IP ownership requirements
- **Privacy Policy** - Data handling practices

> ⚠️ **Important**: These are draft templates only. Consult qualified legal counsel before production deployment.

## 🌐 Supported Networks

| Network | Chain ID | Currency | Faucet |
|---------|----------|----------|---------|
| Polygon Amoy | 80002 | MATIC | https://faucet.polygon.technology/ |
| Ethereum Sepolia | 11155111 | ETH | https://sepoliafaucet.com/ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is provided for educational and testing purposes. See legal documentation for usage terms and conditions.

## 🆘 Support

For technical issues:
- Check the troubleshooting guide
- Review smart contract documentation
- Open an issue on GitHub

For legal questions:
- Consult qualified legal counsel
- Review provided legal templates
- Understand your local regulations

---

**⚠️ Testnet Notice**: This platform operates on testnets only. All tokens and transactions are for demonstration purposes and have no real monetary value.