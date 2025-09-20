import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Shield, FileText, AlertTriangle, Lock, Eye } from 'lucide-react';

const Footer = () => {
  const legalLinks = [
    { href: '/legal/terms-of-service.html', label: 'Terms of Service', icon: FileText },
    { href: '/legal/risk-disclosure.html', label: 'Risk Disclosure', icon: AlertTriangle },
    { href: '/legal/no-securities-notice.html', label: 'No-Securities Notice', icon: Shield },
    { href: '/legal/content-ownership-attestation.html', label: 'Ownership Attestation', icon: Lock },
    { href: '/legal/privacy-policy.html', label: 'Privacy Policy', icon: Eye },
  ];

  const technologyFeatures = [
    { label: 'Built on Polygon', icon: '⚡' },
    { label: 'Smart Contracts', icon: '🔒' },
    { label: 'Web3 Integration', icon: '🌐' },
  ];

  return (
    <footer className="bg-gray-900/95 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">
                Fractional Video Rights
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Tokenize your YouTube videos into fractional ERC-20 tokens on Polygon Amoy testnet. 
              Let people buy units of your tokenized content and support your success.
            </p>
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-400 font-semibold text-sm">Testnet MVP</span>
              </div>
              <p className="text-yellow-300 text-xs">
                This is a testnet demonstration. Use testnet tokens only. 
                Not for production use.
              </p>
            </div>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary-500" />
              <span>Legal & Compliance</span>
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <Video className="h-5 w-5 text-primary-500" />
              <span>Technology</span>
            </h3>
            <ul className="space-y-3 mb-6">
              {technologyFeatures.map((feature) => (
                <li key={feature.label} className="flex items-center space-x-2 text-gray-400 text-sm">
                  <span className="text-lg">{feature.icon}</span>
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Supported Testnets:</h4>
              <div className="flex flex-col space-y-1">
                <span className="text-primary-400 text-xs">• Polygon Amoy Testnet</span>
                <span className="text-primary-400 text-xs">• Ethereum Sepolia Testnet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-gray-500 text-sm">
            © 2025 Mostokey. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <Link to="/legal/terms-of-service.html" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link to="/legal/privacy-policy.html" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link to="/legal/risk-disclosure.html" className="hover:underline">Risk Disclosure</Link>
            <span>•</span>
            <Link to="/legal/content-ownership-attestation.html" className="hover:underline">Ownership Attestation</Link>
            <span>•</span>
            <Link to="/legal/no-securities-notice.html" className="hover:underline">No Securities Notice</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;