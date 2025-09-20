import React, { useState, useEffect } from 'react';
import { User, Wallet, Loader2, ExternalLink, Video, TrendingUp, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { getRightsFactoryContract, getVideoRightsTokenContract, formatCurrency, shortenAddress } from '../lib/contracts';
import { NETWORKS } from '../lib/config';

const Creator = () => {
  const { account, signer, provider, network, switchNetwork, formatAmount } = useWeb3();
  const [creatorTokens, setCreatorTokens] = useState([]);
  const [earnings, setEarnings] = useState('0');
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');

  const supportedNetworks = Object.values(NETWORKS);
  const currentNetwork = supportedNetworks.find(n => n.chainId === Number(network?.chainId));

  const loadCreatorData = async () => {
    if (!provider || !account || !currentNetwork) return;

    try {
      setLoading(true);
      const factory = getRightsFactoryContract(provider, Number(network.chainId));
      
      // Get creator's earnings
      const creatorEarnings = await factory.getCreatorEarnings(account);
      setEarnings(formatAmount(creatorEarnings));

      // Get creator's tokens
      const tokenAddresses = await factory.getTokensByCreator(account);
      
      const tokenData = [];
      for (const address of tokenAddresses) {
        try {
          const tokenInfo = await factory.getTokenInfo(address);
          const tokenContract = getVideoRightsTokenContract(address, provider);
          
          const totalEarnings = formatAmount(BigInt(tokenInfo.soldTokens) * BigInt(tokenInfo.pricePerToken));
          
          tokenData.push({
            address,
            name: await tokenContract.name(),
            symbol: await tokenContract.symbol(),
            totalSupply: tokenInfo.totalSupply.toString(),
            soldTokens: tokenInfo.soldTokens.toString(),
            pricePerToken: tokenInfo.pricePerToken.toString(),
            videoUrl: tokenInfo.videoUrl,
            availableTokens: (tokenInfo.totalSupply - tokenInfo.soldTokens).toString(),
            totalEarnings,
            saleProgress: (parseInt(tokenInfo.soldTokens) / parseInt(tokenInfo.totalSupply)) * 100,
          });
        } catch (error) {
          console.error(`Error loading token ${address}:`, error);
        }
      }
      
      setCreatorTokens(tokenData);
    } catch (error) {
      console.error('Error loading creator data:', error);
      setError('Failed to load creator data');
    } finally {
      setLoading(false);
    }
  };

  const withdrawEarnings = async () => {
    if (!signer || !account) return;

    try {
      setWithdrawing(true);
      setError('');

      const factory = getRightsFactoryContract(signer, Number(network.chainId));
      const tx = await factory.withdrawEarnings();
      await tx.wait();

      // Reload data
      await loadCreatorData();
      
      alert('Earnings withdrawn successfully!');
    } catch (error) {
      console.error('Error withdrawing earnings:', error);
      setError(error.reason || error.message || 'Failed to withdraw earnings');
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    if (provider && account && currentNetwork) {
      loadCreatorData();
    }
  }, [provider, account, currentNetwork]);

  const TokenCard = ({ token }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{token.name}</h3>
          <p className="text-gray-400 text-sm">{token.symbol}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-green-400">
            {formatCurrency(token.totalEarnings, currentNetwork.currency)}
          </div>
          <p className="text-gray-400 text-sm">earned</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Sold:</span>
          <span className="text-white">{token.soldTokens} / {token.totalSupply}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Price:</span>
          <span className="text-white">
            {formatCurrency(formatAmount(token.pricePerToken), currentNetwork.currency)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full" 
            style={{ width: `${token.saleProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">{token.saleProgress.toFixed(1)}% sold</span>
          <span className="text-gray-500">{token.availableTokens} remaining</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <a
          href={token.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center space-x-2 btn-secondary text-sm py-2"
        >
          <Video className="h-4 w-4" />
          <span>View Video</span>
        </a>
        <a
          href={`${currentNetwork.blockExplorer}/address/${token.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center space-x-2 btn-secondary text-sm py-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Contract</span>
        </a>
      </div>
    </div>
  );

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-gray-800/50 border border-gray-700 rounded-xl p-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access your creator dashboard
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
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-4">
          <User className="h-8 w-8 text-primary-500" />
          <h1 className="text-4xl font-bold text-white">Creator Dashboard</h1>
        </div>
        <p className="text-xl text-gray-400">
          Manage your video rights tokens and track earnings on {currentNetwork.name}
        </p>
      </div>

      {error && (
        <div className="mb-8">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-white font-semibold">Available Earnings</h3>
              <p className="text-gray-400 text-sm">Ready to withdraw</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-4">
            {formatCurrency(earnings, currentNetwork.currency)}
          </div>
          <button
            onClick={withdrawEarnings}
            disabled={withdrawing || parseFloat(earnings) === 0}
            className="w-full btn-primary"
          >
            {withdrawing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Withdraw Earnings
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Video className="h-8 w-8 text-primary-500" />
            <div>
              <h3 className="text-white font-semibold">Active Tokens</h3>
              <p className="text-gray-400 text-sm">Created by you</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-primary-400">
            {loading ? '...' : creatorTokens.length}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-white font-semibold">Total Tokens Sold</h3>
              <p className="text-gray-400 text-sm">Across all videos</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {loading ? '...' : creatorTokens.reduce((sum, token) => sum + parseInt(token.soldTokens), 0)}
          </div>
        </div>
      </div>

      {/* Tokens Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-3 text-gray-400">Loading your tokens...</span>
        </div>
      ) : creatorTokens.length === 0 ? (
        <div className="text-center py-16">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Tokens Created Yet</h3>
          <p className="text-gray-400 mb-6">
            Start by creating your first video rights token
          </p>
          <a href="/create" className="btn-primary">
            <Video className="h-4 w-4" />
            Create Token
          </a>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Your Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorTokens.map(token => (
              <TokenCard key={token.address} token={token} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Creator;