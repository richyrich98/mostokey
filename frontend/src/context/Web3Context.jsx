import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { NETWORKS } from '../lib/config';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionTimer = useRef(null);

  const startSessionTimer = () => {
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    sessionTimer.current = setTimeout(() => {
      disconnectWallet();
      setSessionExpired(true);
    }, 60 * 60 * 1000); // 1 hour
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();

          setAccount(accounts[0]);
          setProvider(provider);
          setSigner(signer);
          setNetwork(network);
  }
  startSessionTimer();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('Please install MetaMask to use this application');
    }
  };

  const switchNetwork = async (chainId) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (error) {
        if (error.code === 4902) {
          // Network not added, add it
          const networkConfig = Object.values(NETWORKS).find(n => n.chainId === chainId);
          if (networkConfig) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig],
            });
          }
        }
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setNetwork(null);
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount, decimals = 18) => {
    return ethers.formatUnits(amount, decimals);
  };

  const parseAmount = (amount, decimals = 18) => {
    return ethers.parseUnits(amount, decimals);
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
    };
  }, []);

  // Show session expired popup
  useEffect(() => {
    if (sessionExpired) {
      alert('Session expired, please connect wallet again.');
      setSessionExpired(false);
    }
  }, [sessionExpired]);

  const value = {
    account,
    provider,
    signer,
    network,
    isConnecting,
    connectWallet,
    switchNetwork,
    disconnectWallet,
    formatAddress,
    formatAmount,
    parseAmount,
    sessionExpired,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};