import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Zap, Shield, Gem, Smartphone } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'EVM-compatible Polygon network ensures cheap fees and instant transactions',
    },
    {
      icon: Shield,
      title: 'Secure & Trustless',
      description: 'Smart contracts handle all transactions automatically with full transparency',
    },
    {
      icon: Gem,
      title: 'Fractional Ownership',
      description: 'Break down video rights into tradeable tokens for maximum accessibility',
    },
    {
      icon: Smartphone,
      title: 'Easy Integration',
      description: 'Connect with MetaMask and start trading in minutes, not hours',
    },
  ];

  const stats = [
    { value: '$2.4M', label: 'Total Volume' },
    { value: '1,247', label: 'Active Tokens' },
    { value: '8,934', label: 'Users' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              Mostokey
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight">
              Tokenize Your <span className="text-primary-400">Video Rights</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 font-medium">
              Transform your YouTube videos into fractional ERC-20 tokens on Polygon Amoy testnet. Let investors buy shares of your content and share in your success.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link to="/create" className="inline-block px-8 py-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-lg shadow-lg transition-all duration-200">
                <Video className="inline-block mr-2 -mt-1 h-6 w-6" />
                Create Token
              </Link>
              <Link to="/buy" className="inline-block px-8 py-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-primary-400 font-semibold text-lg shadow-lg border border-primary-500 transition-all duration-200">
                Browse Tokens
              </Link>
            </div>
            <div className="inline-block bg-gray-800/80 rounded-xl px-8 py-6 shadow-xl border border-gray-700">
              <div className="flex items-center space-x-4">
                <Video className="h-10 w-10 text-primary-400" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">Video Token</div>
                  <div className="text-3xl font-extrabold text-green-400">$1,250</div>
                  <div className="text-gray-400 text-sm">Holders <span className="font-semibold text-white">156</span></div>
                  <div className="text-green-400 text-xs font-bold">Growth +24%</div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built on cutting-edge blockchain technology with user-friendly features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-primary-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Tokenize Your Content?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of creators who are already monetizing their video rights
          </p>
          <Link to="/create" className="inline-flex items-center space-x-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors">
            <Video className="h-5 w-5" />
            <span>Get Started Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;