import { useState, useEffect } from 'react'
import './App.css'
import Connect from './components/connect'
import CreateGame from './components/CreateGame'
import GameView from './components/GameView'

function App() {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [showCreateGame, setShowCreateGame] = useState<boolean>(false);
  const [viewingGame, setViewingGame] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');

  const handleConnectionChange = (connected: boolean, address: string, correctNetwork: boolean, walletBalance?: string) => {
    setIsConnected(connected);
    setAccount(address);
    setIsCorrectNetwork(correctNetwork);
    if (walletBalance) {
      setBalance(walletBalance);
    }
    if (!connected) {
      setBalance('');
      setShowCreateGame(false);
      setViewingGame('');
    }
  };

  // Check URL for game parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameAddress = params.get('game');
    if (gameAddress) {
      setViewingGame(gameAddress);
    }
  }, []);

  const renderContent = () => {
    // Show connect if not connected or wrong network
    if (!isConnected || !isCorrectNetwork) {
      return <Connect onConnectionChange={handleConnectionChange} />;
    }

    // Show GameView if viewing a specific game
    if (viewingGame) {
      return (
        <GameView 
          contractAddress={viewingGame}
          account={account}
          onBack={() => setViewingGame('')}
        />
      );
    }

    // Show CreateGame form
    if (showCreateGame) {
      return (
        <CreateGame 
          account={account} 
          onBack={() => setShowCreateGame(false)}
          onGameCreated={(address) => {
            setShowCreateGame(false);
            setViewingGame(address);
          }}
        />
      );
    }

    // Simple main menu
    return (
      <div>
        <div>
          <h1>Rock Paper Scissors</h1>
          <p>{account.slice(0, 6)}...{account.slice(-4)}</p>
          <p>{balance} ETH</p>

          <hr />

          <button onClick={() => setShowCreateGame(true)}>
            Create New Game
          </button>

          <p>Or join with contract address:</p>
          <input
            type="text"
            placeholder="0x..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
          />
          <button 
            onClick={() => manualAddress && setViewingGame(manualAddress)}
            disabled={!manualAddress}
          >
            Join Game
          </button>

          <hr />

          <button onClick={() => handleConnectionChange(false, '', false)}>
            Disconnect
          </button>
        </div>
      </div>
    );
  };

  return <>{renderContent()}</>;
}

export default App
