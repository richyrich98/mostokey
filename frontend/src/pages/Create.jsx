import React, { useState, useEffect } from 'react';
import { parseEther } from 'ethers';
import { Video, Loader2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { getRightsFactoryContract, validateYouTubeUrl, extractVideoId } from '../lib/contracts';
import { NETWORKS } from '../lib/config';

const Create = () => {
  const { account, signer, provider, network, switchNetwork } = useWeb3();
  console.log('Create.jsx mount', { account, signer, provider, network });
  // ...existing code...
  const [formData, setFormData] = useState({
    videoUrl: '',
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    pricePerToken: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);
  const [error, setError] = useState('');
  const [signature, setSignature] = useState('');
  const [allTokens, setAllTokens] = useState([]);
  // Load all tokens for validation
  useEffect(() => {
    console.log('useEffect: signer, provider, network', { signer, provider, network });
    const fetchTokens = async () => {
      if (!signer && !provider) return;
      try {
        const factory = getRightsFactoryContract(signer || provider, Number(network?.chainId || 80002));
        let allTokenAddresses = [];
        try {
          allTokenAddresses = await factory.getAllTokens();
        } catch (err) {
          for (let i = 0; i < 100; i++) {
            try {
              const addr = await factory.allTokens(i);
              if (addr === '0x0000000000000000000000000000000000000000') break;
              allTokenAddresses.push(addr);
            } catch (e) {
              break;
            }
          }
        }
        const tokens = [];
        for (const address of allTokenAddresses) {
          try {
            const info = await factory.getTokenInfo(address);
            tokens.push(info);
          } catch {}
        }
        setAllTokens(tokens);
      } catch {}
    };
    fetchTokens();
  }, [signer, provider, network]);

  const supportedNetworks = Object.values(NETWORKS);
  const currentNetwork = supportedNetworks.find(n => n.chainId === Number(network?.chainId));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    // Auto-generate token details from YouTube URL
    if (name === 'videoUrl' && validateYouTubeUrl(value)) {
      const videoId = extractVideoId(value);
      if (videoId && !formData.tokenName) {
        setFormData(prev => ({
          ...prev,
          tokenName: `Video Token ${videoId.slice(-6).toUpperCase()}`,
          tokenSymbol: `VT${videoId.slice(-4).toUpperCase()}`
        }));
      }
    }

    // Real-time validation for duplicates (check all fields every time)
    let duplicateError = '';
    if (updatedForm.videoUrl && allTokens.some(t => t.videoUrl === updatedForm.videoUrl)) {
      duplicateError = 'This YouTube video has already been tokenized.';
    } else if (updatedForm.tokenName && allTokens.some(t => t.name === updatedForm.tokenName)) {
      duplicateError = 'A token with this name already exists.';
    } else if (updatedForm.tokenSymbol && allTokens.some(t => t.symbol === updatedForm.tokenSymbol)) {
      duplicateError = 'A token with this symbol already exists.';
    }
    setError(duplicateError);
  };

  const signOwnershipAttestation = async () => {
    if (!signer || !formData.videoUrl) return;

    try {
      const message = `I hereby attest that I own the rights to the YouTube video: ${formData.videoUrl} and have the authority to tokenize these rights. Timestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      setSignature(signature);
      return `signature:${signature};msg:${message}`;
    } catch (error) {
      console.error('Error signing attestation:', error);
      setError('Failed to sign ownership attestation');
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Real-time duplicate validation before any blockchain interaction
    if (allTokens.some(t => t.videoUrl === formData.videoUrl)) {
      setError('This YouTube video has already been tokenized.');
      return;
    }
    if (allTokens.some(t => t.name === formData.tokenName)) {
      setError('A token with this name already exists.');
      return;
    }
    if (allTokens.some(t => t.symbol === formData.tokenSymbol)) {
      setError('A token with this symbol already exists.');
      return;
    }

    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!currentNetwork) {
      setError('Please switch to a supported network');
      return;
    }

    // Validation
    if (!validateYouTubeUrl(formData.videoUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    if (!formData.tokenName || !formData.tokenSymbol) {
      setError('Please provide token name and symbol');
      return;
    }
    // Prevent submission if duplicate error is present
    if (error) {
      return;
    }

    if (!formData.totalSupply || parseFloat(formData.totalSupply) <= 0) {
      setError('Total supply must be greater than 0');
      return;
    }

    if (!formData.pricePerToken || parseFloat(formData.pricePerToken) <= 0) {
      setError('Price per token must be greater than 0');
      return;
    }

    try {
      setIsCreating(true);
      const factory = getRightsFactoryContract(signer, Number(network.chainId));

      // Uniqueness checks: fetch all tokens and compare videoUrl, name, symbol
      let allTokenAddresses = [];
      try {
        allTokenAddresses = await factory.getAllTokens();
      } catch (err) {
        // fallback to allTokens(uint256) enumeration
        for (let i = 0; i < 100; i++) {
          try {
            const addr = await factory.allTokens(i);
            if (addr === '0x0000000000000000000000000000000000000000') break;
            allTokenAddresses.push(addr);
          } catch (e) {
            break;
          }
        }
      }
      for (const address of allTokenAddresses) {
        const info = await factory.getTokenInfo(address);
        if (info.videoUrl === formData.videoUrl) {
          setError('This YouTube video has already been tokenized. Each video can only be tokenized once.');
          setIsCreating(false);
          return;
        }
        if (info.name === formData.tokenName) {
          setError('A token with this name already exists. Please choose a unique name.');
          setIsCreating(false);
          return;
        }
        if (info.symbol === formData.tokenSymbol) {
          setError('A token with this symbol already exists. Please choose a unique symbol.');
          setIsCreating(false);
          return;
        }
      }

      // Sign ownership attestation
      const metadataURI = await signOwnershipAttestation();
      if (!metadataURI) {
        setIsCreating(false);
        return;
      }

      try {
        const tx = await factory.createToken(
          formData.tokenName,
          formData.tokenSymbol,
          formData.totalSupply,
          parseEther(formData.pricePerToken),
          formData.videoUrl,
          metadataURI
        );

        const receipt = await tx.wait();

        // Extract token address from events
        const event = receipt.logs.find(log => {
          try {
            const parsed = factory.interface.parseLog(log);
            return parsed?.name === 'TokenCreated';
          } catch {
            return false;
          }
        });

        if (event) {
          const parsed = factory.interface.parseLog(event);
          setCreatedToken({
            address: parsed.args.tokenAddress,
            name: formData.tokenName,
            symbol: formData.tokenSymbol,
            totalSupply: formData.totalSupply,
            pricePerToken: formData.pricePerToken,
            videoUrl: formData.videoUrl,
            txHash: tx.hash
          });
        }

        // Reset form
        setFormData({
          videoUrl: '',
          tokenName: '',
          tokenSymbol: '',
          totalSupply: '',
          pricePerToken: '',
        });
      } catch (txError) {
        // If we reach here, it means the contract reverted for another reason
        setError('Failed to create token. Please check your input or try a different video link, name, or symbol.');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      setError('Failed to create token. Please check your input or try a different video link, name, or symbol.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-gray-800/50 border border-gray-700 rounded-xl p-12">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to create video rights tokens
          </p>
        </div>
      </div>
    );
  }

  if (!currentNetwork) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

  if (createdToken) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-green-900/20 border border-green-700 rounded-xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Token Created Successfully!</h2>
          
          <div className="bg-gray-800 rounded-lg p-6 text-left mb-6">
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Token Address:</span>
                <p className="text-white font-mono text-sm break-all">{createdToken.address}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Name:</span>
                <p className="text-white">{createdToken.name} ({createdToken.symbol})</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Total Supply:</span>
                  <p className="text-white">{createdToken.totalSupply}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Price:</span>
                  <p className="text-white">{createdToken.pricePerToken} {currentNetwork.currency}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href={`${currentNetwork.blockExplorer}/tx/${createdToken.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full"
            >
              <ExternalLink className="h-4 w-4" />
              View Transaction
            </a>
            <button
              onClick={() => setCreatedToken(null)}
              className="btn-primary w-full"
            >
              Create Another Token
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
        <div className="text-center mb-8">
          <Video className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Create Video Rights Token</h1>
          <p className="text-gray-400">
            Tokenize your YouTube video and allow others to invest in your content
          </p>
          <div className="mt-4 bg-blue-900/20 border border-blue-700 rounded-lg p-3">
            <p className="text-blue-300 text-sm">
              Connected to <strong>{currentNetwork.name}</strong>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-2">
              YouTube Video URL *
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              className="input-primary"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            {formData.videoUrl && !validateYouTubeUrl(formData.videoUrl) && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid YouTube URL</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Token Name *
              </label>
              <input
                type="text"
                name="tokenName"
                value={formData.tokenName}
                onChange={handleInputChange}
                className="input-primary"
                placeholder="My Video Token"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">
                Token Symbol *
              </label>
              <input
                type="text"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleInputChange}
                className="input-primary"
                placeholder="MVT"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Total Supply *
              </label>
              <input
                type="number"
                name="totalSupply"
                value={formData.totalSupply}
                onChange={handleInputChange}
                className="input-primary"
                placeholder="1000"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">
                Price per Token ({currentNetwork.currency}) *
              </label>
              <input
                type="number"
                name="pricePerToken"
                value={formData.pricePerToken}
                onChange={handleInputChange}
                className="input-primary"
                placeholder="0.1"
                step="0.0001"
                min="0.0001"
                required
              />
            </div>
          </div>

          {signature && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-300 text-sm font-medium">Ownership Attestation Signed</span>
              </div>
              <p className="text-green-200 text-xs">
                Your signature will be stored with the token as proof of ownership.
              </p>
            </div>
          )}

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-300 text-sm font-medium">Legal Notice</span>
            </div>
            <p className="text-yellow-200 text-xs">
              By creating this token, you attest that you own the rights to this video content 
              and have the authority to tokenize these rights. You will be asked to sign a 
              cryptographic attestation before proceeding.
            </p>
          </div>

          <button
            type="submit"
            disabled={isCreating || !!error}
            className="w-full btn-primary py-4 text-lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Token...
              </>
            ) : (
              <>
                <Video className="h-5 w-5" />
                Create Token
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Create;