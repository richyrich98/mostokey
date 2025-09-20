import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Create from './pages/Create';
import Buy from './pages/Buy';
import Creator from './pages/Creator';

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/creator" element={<Creator />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Web3Provider>
  );
}

export default App;