import { useState } from 'react'
import './App.css'
import Connect from './components/connect'
import CreateGame from './components/CreateGame'
import LoadGame from './components/LoadGame'

function App() {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<'create' | 'load' | null>(null);

  const handleConnectionChange = (connected: boolean, address: string, correctNetwork: boolean) => {
    setIsConnected(connected);
    setAccount(address);
    setIsCorrectNetwork(correctNetwork);
    if (!connected) {
      setGameMode(null);
    }
  };

  const renderContent = () => {
    // Show connect if not connected or wrong network
    if (!isConnected || !isCorrectNetwork) {
      return <Connect onConnectionChange={handleConnectionChange} />;
    }

    // Show game mode selection
    if (!gameMode) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Rock Paper Scissors
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setGameMode('create')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-lg transition shadow-md hover:shadow-lg"
              >
                <div className="text-lg font-bold mb-1">Create Game</div>
                <div className="text-xs opacity-90">Start a new game and challenge someone</div>
              </button>

              <button
                onClick={() => setGameMode('load')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-lg transition shadow-md hover:shadow-lg"
              >
                <div className="text-lg font-bold mb-1">Load Game</div>
                <div className="text-xs opacity-90">Join an existing game</div>
              </button>
            </div>

            <button
              onClick={() => handleConnectionChange(false, '', false)}
              className="w-full mt-6 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Disconnect
            </button>
          </div>
        </div>
      );
    }

    // Show game components based on mode
    if (gameMode === 'create') {
      return <CreateGame account={account} onBack={() => setGameMode(null)} />;
    }

    if (gameMode === 'load') {
      return <LoadGame account={account} onBack={() => setGameMode(null)} />;
    }
  };

  return <>{renderContent()}</>;
}

export default App
