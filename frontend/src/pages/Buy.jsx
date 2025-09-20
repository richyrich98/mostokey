import React, { useState, useEffect } from 'react';
import { ShoppingCart, Loader2, ExternalLink, Video, Search, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { getRightsFactoryContract, getVideoRightsTokenContract, formatCurrency, shortenAddress } from '../lib/contracts';
import { NETWORKS } from '../lib/config';
import { ethers } from 'ethers';

const Buy = () => {
  const { account, signer, provider, network, switchNetwork, formatAmount } = useWeb3();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState({});
  const [searchAddress, setSearchAddress] = useState('');
  const [error, setError] = useState('');

  const supportedNetworks = Object.values(NETWORKS);
  const currentNetwork = supportedNetworks.find(n => n.chainId === Number(network?.chainId));

  // Always use wallet provider if connected, fallback to public RPC only if not
  const getActiveProvider = () => {
    if (window.ethereum && signer) return signer.provider;
    if (provider) return provider;
    if (currentNetwork && currentNetwork.rpcUrl) {
      return new ethers.JsonRpcProvider(currentNetwork.rpcUrl);
    }
    return null;
  };

  const loadTokens = async () => {
    const activeProvider = getActiveProvider();
    if (!activeProvider || !currentNetwork) {
      setError('No provider or network found.');
      setTokens([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const factory = getRightsFactoryContract(activeProvider, Number(currentNetwork.chainId));
      let allTokenAddresses = [];
      try {
        allTokenAddresses = await factory.getAllTokens();
      } catch (err) {
        // Fallback: enumerate allTokens(uint256) until it fails (up to 100 tokens)
        console.warn('getAllTokens() failed, falling back to allTokens(uint256) enumeration', err);
        allTokenAddresses = [];
        for (let i = 0; i < 100; i++) {
          try {
            const addr = await factory.allTokens(i);
            if (addr === '0x0000000000000000000000000000000000000000') break;
            allTokenAddresses.push(addr);
          } catch (e) {
            break;
          }
        }
        if (allTokenAddresses.length === 0) {
          // Fallback: try getTokensByCreator(account) if available
          if (account) {
            try {
              allTokenAddresses = await factory.getTokensByCreator(account);
              if (allTokenAddresses.length === 0) {
                setError('No tokens found for your account.');
                setTokens([]);
                setLoading(false);
                return;
              }
            } catch (e2) {
              setError('No tokens found or contract not deployed on this network. (allTokens & getTokensByCreator fallback failed) ' + (e2?.message || ''));
              setTokens([]);
              setLoading(false);
              return;
            }
          } else {
            setError('No tokens found or contract not deployed on this network. (allTokens fallback)');
            setTokens([]);
            setLoading(false);
            return;
          }
        }
      }
      const tokenData = [];
      for (const address of allTokenAddresses) {
        try {
          const tokenInfo = await factory.getTokenInfo(address);
          if (!tokenInfo.active) continue;
          const tokenContract = getVideoRightsTokenContract(address, activeProvider);
          tokenData.push({
            address,
            name: await tokenContract.name(),
            symbol: await tokenContract.symbol(),
            creator: tokenInfo.creator,
            totalSupply: tokenInfo.totalSupply.toString(),
            soldTokens: tokenInfo.soldTokens.toString(),
            pricePerToken: tokenInfo.pricePerToken.toString(),
            videoUrl: tokenInfo.videoUrl,
            active: tokenInfo.active,
            availableTokens: (tokenInfo.totalSupply - tokenInfo.soldTokens).toString(),
          });
        } catch (error) {
          console.error(`Error loading token ${address}:`, error);
        }
      }
      setTokens(tokenData);
    } catch (error) {
      console.error('Error loading tokens:', error);
      setError('Failed to load tokens. Please check your network and contract deployment. ' + (error?.message || ''));
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const purchaseTokens = async (tokenAddress, amount) => {
    if (!signer || !account) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setPurchaseLoading(prev => ({ ...prev, [tokenAddress]: true }));
      setError('');

      const factory = getRightsFactoryContract(signer, Number(network.chainId));
      const tokenInfo = await factory.getTokenInfo(tokenAddress);
      
      const totalCost = BigInt(tokenInfo.pricePerToken) * BigInt(amount);
      
      const tx = await factory.purchaseTokens(tokenAddress, amount, {
        value: totalCost.toString()
      });
      
      await tx.wait();
      
      // Reload tokens to update available amounts
      await loadTokens();
      
      alert(`Successfully purchased ${amount} tokens!`);
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      setError(error.reason || error.message || 'Failed to purchase tokens');
    } finally {
      setPurchaseLoading(prev => ({ ...prev, [tokenAddress]: false }));
    }
  };

  const searchToken = async () => {
    if (!provider || !searchAddress || !currentNetwork) return;

    try {
      setError('');
      const factory = getRightsFactoryContract(provider, Number(network.chainId));
      const tokenInfo = await factory.getTokenInfo(searchAddress);
      
      if (!tokenInfo.active) {
        setError('Token not found or inactive');
        return;
      }

      const tokenContract = getVideoRightsTokenContract(searchAddress, provider);
      
      const searchResult = {
        address: searchAddress,
        name: await tokenContract.name(),
        symbol: await tokenContract.symbol(),
        creator: tokenInfo.creator,
        totalSupply: tokenInfo.totalSupply.toString(),
        soldTokens: tokenInfo.soldTokens.toString(),
        pricePerToken: tokenInfo.pricePerToken.toString(),
        videoUrl: tokenInfo.videoUrl,
        active: tokenInfo.active,
        availableTokens: (tokenInfo.totalSupply - tokenInfo.soldTokens).toString(),
      };

      // Add to tokens list if not already present
      setTokens(prev => {
        const exists = prev.find(t => t.address.toLowerCase() === searchAddress.toLowerCase());
        if (exists) return prev;
        return [searchResult, ...prev];
      });
    } catch (error) {
      console.error('Error searching token:', error);
      setError('Token not found');
    }
  };

  useEffect(() => {
    if (provider && currentNetwork) {
      loadTokens();
    }
  }, [provider, currentNetwork]);

  const TokenCard = ({ token }) => {
    const [purchaseAmount, setPurchaseAmount] = useState('1');
    const isCreator = account && token.creator && account.toLowerCase() === token.creator.toLowerCase();
    const totalCost = purchaseAmount ? 
      formatAmount(BigInt(token.pricePerToken) * BigInt(purchaseAmount || 0)) : '0';

    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 card-hover">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{token.name}</h3>
            <p className="text-gray-400 text-sm">{token.symbol}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-400">
              {formatCurrency(formatAmount(token.pricePerToken), currentNetwork.currency)}
            </div>
            <p className="text-gray-400 text-sm">per token</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Creator:</span>
            <span className="text-white font-mono">{shortenAddress(token.creator)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Available:</span>
            <span className="text-white">{token.availableTokens} / {token.totalSupply}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full" 
              style={{ 
                width: `${(parseInt(token.soldTokens) / parseInt(token.totalSupply)) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        <a
          href={token.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 mb-4 text-sm"
        >
          <Video className="h-4 w-4" />
          <span>View Video</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        {isCreator ? (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 text-center mt-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
            <span className="text-yellow-300 text-sm font-medium">You are the creator of this token and cannot purchase your own tokens.</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Amount to Purchase
              </label>
              <input
                type="number"
                min="1"
                max={token.availableTokens}
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                className="input-primary"
                placeholder="1"
              />
            </div>
            {purchaseAmount && (
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Cost:</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(totalCost, currentNetwork.currency)}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => purchaseTokens(token.address, purchaseAmount)}
              disabled={!purchaseAmount || parseInt(purchaseAmount) > parseInt(token.availableTokens) || purchaseLoading[token.address]}
              className="w-full btn-primary"
            >
              {purchaseLoading[token.address] ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Purchasing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Purchase Tokens
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-gray-800/50 border border-gray-700 rounded-xl p-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to browse and purchase video rights tokens
          </p>
        </div>
      </div>
    );
  }

  if (!currentNetwork) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-yellow-900/20 border border-yellow-700 rounded-xl p-12">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Unsupported Network</h2>
          <p className="text-gray-400 mb-6">
            Please switch to one of our supported networks:
          </p>
          <div className="space-y-2 mb-6">
            {supportedNetworks.map(network => (
              <button
                key={network.chainId}
                onClick={() => switchNetwork(network.chainId)}
                className="block w-full btn-primary"
              >
                Switch to {network.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Browse Video Rights Tokens</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Discover and invest in tokenized video rights on {currentNetwork.name}
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter token contract address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="input-primary"
              />
            </div>
            <button
              onClick={searchToken}
              className="btn-primary px-8"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-3 text-gray-400">Loading tokens...</span>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-16">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Tokens Found</h3>
          <p className="text-gray-400 mb-6">
            Be the first to create a video rights token!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map(token => (
            <TokenCard key={token.address} token={token} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Buy;