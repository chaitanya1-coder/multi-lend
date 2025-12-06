import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/markets" element={<div style={{ padding: '2rem' }}>Markets Page (Coming Soon)</div>} />
          </Routes>
        </Layout>
      </Router>
    </WalletProvider>
  );
}

export default App;
