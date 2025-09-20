export const NETWORKS = {
  amoy: {
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    currency: 'MATIC',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
    faucetUrl: 'https://faucet.polygon.technology/',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Ethereum Sepolia Testnet',
    currency: 'SepoliaETH',
    rpcUrl: 'https://eth-sepolia.public.blastapi.io',
    blockExplorer: 'https://sepolia.etherscan.io',
    faucetUrl: 'https://sepoliafaucet.com/',
  },
};

// Update these addresses after deployment
export const FACTORY_ADDRESSES = {
  80002: '0x053263A5B4421a7434bbD1e4B01aBaCF4B628bfF', // Polygon Amoy
  11155111: '0x0000000000000000000000000000000000000000', // Sepolia - UPDATE AFTER DEPLOYMENT
};

export const getFactoryAddress = (chainId) => {
  return FACTORY_ADDRESSES[chainId] || FACTORY_ADDRESSES[80002];
};

export const getSupportedNetwork = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
};