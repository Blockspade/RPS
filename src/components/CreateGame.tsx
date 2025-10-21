import { useState } from 'react';
import { isAddress } from 'ethers';
import { generateSaltUint256, commitment } from '../lib/hashing';
import { deployGame, Move } from '../lib/rpsContract';
import { downloadSaltFile } from '../lib/fileStorage';

interface CreateGameProps {
  account: string;
  balance: string;
  onBack: () => void;
  onGameCreated?: (contractAddress: string) => void;
  onBalanceRefresh: () => Promise<void>;
}

export default function CreateGame({ account, balance, onBack, onGameCreated, onBalanceRefresh }: CreateGameProps) {
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [opponentAddress, setOpponentAddress] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleCreateGame = async () => {
    setLoading(true);
    setError('');

    try {
      if (!selectedMove) {
        throw new Error('Please select your move');
      }
      if (!isAddress(opponentAddress)) {
        throw new Error('Invalid opponent address');
      }
      if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
        throw new Error('Please enter a valid stake amount');
      }
      if (opponentAddress.toLowerCase() === account.toLowerCase()) {
        throw new Error('You cannot play against yourself');
      }

      // Generate salt and commitment
      const salt = generateSaltUint256();
      const c1Hash = commitment(selectedMove as 1 | 2 | 3 | 4 | 5, salt);

      // Deploy the contract
      const contractAddress = await deployGame(c1Hash, opponentAddress, stakeAmount);

      // Download salt file
      downloadSaltFile(salt.toString());

      // Refresh balance after deployment
      await onBalanceRefresh();

      // Navigate to GameView
      setTimeout(() => {
        if (onGameCreated) {
          onGameCreated(contractAddress);
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to create game');
    } finally {
      setLoading(false);
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
    <div>
      <div>
        <div>
          <button onClick={onBack}>← Back</button>
          <h2>Create New Game</h2>
          <p>{account.slice(0, 6)}...{account.slice(-4)}</p>
          <p>{balance} ETH</p>
        </div>

        {error && <div>{error}</div>}

        <div>
          <div>
            <label>Your Move (will be hidden)</label>
            <div>
              {moves.map((move) => (
                <button
                  key={move.value}
                  onClick={() => setSelectedMove(move.value)}
                >
                  <div>{move.emoji}</div>
                  <div>{move.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label>Opponent Address (Player 2)</label>
            <input
              type="text"
              placeholder="0x..."
              value={opponentAddress}
              onChange={(e) => setOpponentAddress(e.target.value)}
            />
          </div>

          <div>
            <label>Stake Amount (ETH)</label>
            <input
              type="number"
              step="0.001"
              placeholder="0.01"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
          </div>

          <div style={{ 
            marginTop: '20px',
            marginBottom: '15px', 
            padding: '12px', 
            backgroundColor: '#fff3cd', 
            borderLeft: '4px solid #ffc107',
            borderRadius: '4px',
            color: '#333',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <strong>⚠️ Critical:</strong> A salt file will be automatically downloaded when you create the game. Keep it safe! You'll need it to reveal your move later. Without it, you cannot complete the game and will lose by timeout.
          </div>

          <button
            onClick={handleCreateGame}
            disabled={loading || !selectedMove || !opponentAddress || !stakeAmount}
          >
            {loading ? 'Deploying...' : 'Create Game & Deploy'}
          </button>
        </div>
      </div>
    </div>
  );
}

