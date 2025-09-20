import { ethers } from 'ethers';
import { getFactoryAddress } from './config';
import RightsFactoryABI from './abi/RightsFactory.json';
import VideoRightsTokenABI from './abi/VideoRightsToken.json';

export const getRightsFactoryContract = (providerOrSigner, chainId) => {
  const factoryAddress = getFactoryAddress(chainId);
  if (factoryAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Factory contract not deployed on this network');
  }
  return new ethers.Contract(factoryAddress, RightsFactoryABI, providerOrSigner);
};

export const getVideoRightsTokenContract = (tokenAddress, providerOrSigner) => {
  return new ethers.Contract(tokenAddress, VideoRightsTokenABI, providerOrSigner);
};

export const validateYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
};

export const extractVideoId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

export const formatTokenAmount = (amount, decimals = 18) => {
  return ethers.formatUnits(amount.toString(), decimals);
};

export const parseTokenAmount = (amount, decimals = 18) => {
  return ethers.parseUnits(amount.toString(), decimals);
};

export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatCurrency = (amount, currency = 'MATIC', decimals = 4) => {
  const formatted = parseFloat(amount).toFixed(decimals);
  return `${formatted} ${currency}`;
};