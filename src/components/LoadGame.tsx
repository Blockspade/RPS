import { useState } from 'react';
import { checkContractExists, getGameState, playMove, Move } from '../lib/rpsContract';
import type { GameState } from '../lib/rpsContract';
import { isAddress } from 'ethers';

interface LoadGameProps {
  account: string;
  onBack: () => void;
}

export default function LoadGame({ account, onBack }: LoadGameProps) {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);

  const handleLoadGame = async () => {
    setLoading(true);
    setError('');
    setGameState(null);

    try {
      // Validate address format
      if (!isAddress(contractAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      // Check if contract exists
      const exists = await checkContractExists(contractAddress);
      if (!exists) {
        throw new Error('No contract found at this address');
      }

      // Get game state
      const state = await getGameState(contractAddress);

      // Check if user is j2
      if (state.j2.toLowerCase() !== account.toLowerCase()) {
        throw new Error('You are not player 2 in this game');
      }

      // Check if stake is still available (game not finished)
      if (state.stake === '0.0') {
        throw new Error('This game has already been completed');
      }

      // Check if j2 has already played
      if (state.c2 !== Move.Null) {
        throw new Error('You have already played your move. Waiting for Player 1 to reveal.');
      }

      setGameState(state);
    } catch (err: any) {
      setError(err.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayMove = async () => {
    if (!selectedMove || !gameState) return;

    setPlaying(true);
    setError('');

    try {
      await playMove(contractAddress, selectedMove, gameState.stake);
      setError('');
      alert('Move played successfully! Waiting for Player 1 to reveal.');
      onBack();
    } catch (err: any) {
      setError(err.message || 'Failed to play move');
    } finally {
      setPlaying(false);
    }
  };

  const moves = [
    { value: Move.Rock, emoji: '✊', label: 'Rock' },
    { value: Move.Paper, emoji: '📄', label: 'Paper' },
    { value: Move.Scissors, emoji: '✂️', label: 'Scissors' },
    { value: Move.Spock, emoji: '🖖', label: 'Spock' },
    { value: Move.Lizard, emoji: '🦎', label: 'Lizard' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 transition mb-4"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Load Game</h2>
          <p className="text-xs text-gray-500 mt-1">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        {!gameState ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Contract Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the contract address of the game you want to join
              </p>
            </div>

            <button
              onClick={handleLoadGame}
              disabled={loading || !contractAddress}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load Game'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Game Found!</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Player 1:</strong> {gameState.j1.slice(0, 6)}...{gameState.j1.slice(-4)}</p>
                <p><strong>Stake:</strong> {gameState.stake} ETH</p>
                <p className="text-xs text-green-600 mt-2">Player 1 has already committed their move. Choose yours!</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Move
              </label>
              <div className="grid grid-cols-3 gap-2">
                {moves.map((move) => (
                  <button
                    key={move.value}
                    onClick={() => setSelectedMove(move.value)}
                    className={`py-3 px-2 border-2 rounded-lg transition ${
                      selectedMove === move.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{move.emoji}</div>
                    <div className="text-xs font-medium">{move.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePlayMove}
              disabled={!selectedMove || playing}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {playing ? 'Playing...' : `Play Move (${gameState.stake} ETH)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

