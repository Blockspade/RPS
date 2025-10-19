import { useState, useEffect } from 'react';
import { connectWallet, getBalance, onAccountsChanged, onChainChanged, isOnSepolia, switchToSepolia } from '../lib/ethersClient';

interface ConnectProps {
  onConnectionChange: (connected: boolean, address: string, correctNetwork: boolean, balance?: string) => void;
}

export default function Connect({ onConnectionChange }: ConnectProps) {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [wrongNetwork, setWrongNetwork] = useState<boolean>(false);
  const [switchingNetwork, setSwitchingNetwork] = useState<boolean>(false);

  const checkNetwork = async (address?: string, bal?: string) => {
    try {
      const onSepolia = await isOnSepolia();
      setWrongNetwork(!onSepolia);
      const addr = address || account;
      const currentBalance = bal || balance;
      if (addr) {
        onConnectionChange(true, addr, onSepolia, currentBalance);
      }
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
      await checkNetwork(data.address, data.balance);
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
        onConnectionChange(true, account, true, newBalance);
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
    onConnectionChange(false, '', false);
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
    <div className="container">
      <div>
        <h1>
          Connect Wallet
        </h1>

        {error && (
          <div className="badge red">
            {error}
          </div>
        )}

        {wrongNetwork && account && (
          <div>
            <p>
              ⚠️ Wrong Network
            </p>
            <p className="muted">
              Please switch to Sepolia Testnet to continue.
            </p>
            <button
              onClick={handleSwitchNetwork}
              disabled={switchingNetwork}
            >
              {switchingNetwork ? 'Switching...' : 'Switch to Sepolia'}
            </button>
          </div>
        )}

        {!account ? (
          <button
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <div>
            <div>
              <p className="muted">Address</p>
              <p>{account}</p>
            </div>

            <div>
              <p className="muted">Balance</p>
              <p>{balance} ETH</p>
            </div>

            <button
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}