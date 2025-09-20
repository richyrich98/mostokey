import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, Wallet, Menu, X } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { NETWORKS } from '../lib/config';
import { useState } from 'react';

const Navbar = () => {
  const { account, network, connectWallet, disconnectWallet, formatAddress, switchNetwork } = useWeb3();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/create', label: 'Create' },
    { path: '/buy', label: 'Buy' },
    { path: '/creator', label: 'Creator' },
  ];

  const isActive = (path) => location.pathname === path;

  const getSupportedNetwork = () => {
    if (!network) return null;
    return Object.values(NETWORKS).find(n => n.chainId === Number(network.chainId));
  };

  const currentNetwork = getSupportedNetwork();
  const isUnsupportedNetwork = network && !currentNetwork;

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Video className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent tracking-wide drop-shadow-lg">
              Mostokey
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Network Indicator */}
            {network && (
              <div className="hidden sm:block">
                {isUnsupportedNetwork ? (
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                      Unsupported Network
                    </span>
                    <select
                      className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700"
                      onChange={(e) => switchNetwork(parseInt(e.target.value))}
                      defaultValue=""
                    >
                      <option value="" disabled>Switch Network</option>
                      {Object.values(NETWORKS).map((net) => (
                        <option key={net.chainId} value={net.chainId}>
                          {net.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                    {currentNetwork?.name}
                  </span>
                )}
              </div>
            )}

            {/* Wallet Button */}
            {account ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-gray-300 text-sm">
                  {formatAddress(account)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-primary text-sm py-2 px-4">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {network && isUnsupportedNetwork && (
                <div className="px-3 py-2">
                  <span className="text-red-400 text-xs mb-2 block">Unsupported Network</span>
                  <select
                    className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700"
                    onChange={(e) => switchNetwork(parseInt(e.target.value))}
                    defaultValue=""
                  >
                    <option value="" disabled>Switch Network</option>
                    {Object.values(NETWORKS).map((net) => (
                      <option key={net.chainId} value={net.chainId}>
                        {net.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;