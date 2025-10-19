import { useState, useEffect } from 'react';
import { connectWallet, getBalance, onAccountsChanged, onChainChanged, isOnSepolia, switchToSepolia } from '../lib/ethersClient';

export default function Connect() {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [wrongNetwork, setWrongNetwork] = useState<boolean>(false);
  const [switchingNetwork, setSwitchingNetwork] = useState<boolean>(false);

  const checkNetwork = async () => {
    try {
      const onSepolia = await isOnSepolia();
      setWrongNetwork(!onSepolia);
      return onSepolia;
    } catch (err) {
      return false;
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await connectWallet();
      setAccount(data.address);
      setBalance(data.balance);
      await checkNetwork();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setSwitchingNetwork(true);
    setError('');
    
    try {
      await switchToSepolia();
      setWrongNetwork(false);
      // Refresh balance after switching
      if (account) {
        const newBalance = await getBalance(account);
        setBalance(newBalance);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
    } finally {
      setSwitchingNetwork(false);
    }
  };

  const handleDisconnect = () => {
    setAccount('');
    setBalance('');
    setError('');
    setWrongNetwork(false);
  };

  useEffect(() => {
    const handleAccountChange = async (accounts: string[]) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        setAccount(accounts[0]);
        const newBalance = await getBalance(accounts[0]);
        setBalance(newBalance);
      }
    };

    const handleChainChange = async () => {
      await checkNetwork();
      // Refresh balance if connected
      if (account) {
        const newBalance = await getBalance(account);
        setBalance(newBalance);
      }
    };

    onAccountsChanged(handleAccountChange);
    onChainChanged(handleChainChange);

    // Check network on mount if already connected
    if (account) {
      checkNetwork();
    }
  }, [account]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Connect Wallet
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {wrongNetwork && account && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              ⚠️ Wrong Network
            </p>
            <p className="text-xs text-yellow-700 mb-3">
              Please switch to Sepolia Testnet to continue.
            </p>
            <button
              onClick={handleSwitchNetwork}
              disabled={switchingNetwork}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {switchingNetwork ? 'Switching...' : 'Switch to Sepolia'}
            </button>
          </div>
        )}

        {!account ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Address</p>
              <p className="text-sm font-mono break-all">{account}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className="text-lg font-semibold">{balance} ETH</p>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}