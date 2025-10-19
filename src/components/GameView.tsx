import { useState, useEffect } from 'react';
import { getGameState, Move, solveGame, playMove, getMoveString, getMoveEmoji, determineWinner, j1Timeout, j2Timeout } from '../lib/rpsContract';
import type { GameState } from '../lib/rpsContract';
import { getGame } from '../lib/gameStorage';

interface GameViewProps {
  contractAddress: string;
  account: string;
  onBack: () => void;
}

// Component to display winner/loser/tie result
function WinnerDisplay({ 
  contractAddress, 
  revealedMove, 
  c2, 
  isPlayer1, 
  isPlayer2, 
  stake 
}: { 
  contractAddress: string;
  revealedMove: Move;
  c2: Move;
  isPlayer1: boolean;
  isPlayer2: boolean;
  stake: string;
}) {
  const [winner, setWinner] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinner = async () => {
      const result = await determineWinner(contractAddress, revealedMove, c2);
      setWinner(result);
      setLoading(false);
    };
    fetchWinner();
  }, [contractAddress, revealedMove, c2]);

  if (loading) {
    return <p>Calculating result...</p>;
  }

  const stakeAmount = parseFloat(stake);
  const winAmount = (stakeAmount * 2).toFixed(4);

  if (winner === 0) {
    return (
      <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>🤝 It's a Tie!</h3>
        <p>Both players chose {getMoveString(revealedMove)}.</p>
        <p>Stakes have been returned.</p>
      </div>
    );
  } else if ((winner === 1 && isPlayer1) || (winner === 2 && isPlayer2)) {
    return (
      <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>🎉 You Won!</h3>
        <p>Congratulations! You won {winAmount} ETH</p>
      </div>
    );
  } else {
    return (
      <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px', marginBottom: '15px' }}>
        <h3>😔 You Lost</h3>
        <p>Better luck next time!</p>
      </div>
    );
  }
}

export default function GameView({ contractAddress, account, onBack }: GameViewProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [revealedMove, setRevealedMove] = useState<Move | null>(null);
  const [callingTimeout, setCallingTimeout] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    loadGame();
    
    // Poll every 15 seconds
    const pollInterval = setInterval(() => {
      loadGame();
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [contractAddress]);

  // Calculate time remaining
  useEffect(() => {
    if (!gameState) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const lastAction = Number(gameState.lastAction);
      const timeout = Number(gameState.timeout);
      const deadline = lastAction + timeout;
      const remaining = deadline - now;

      if (remaining <= 0) {
        setTimeLeft('Timeout!');
        setIsTimedOut(true);
      } else {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        setTimeLeft(`${minutes}m ${seconds}s`);
        setIsTimedOut(false);
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState]);

  const loadGame = async () => {
    try {
      const state = await getGameState(contractAddress);
      setGameState(state);
    } catch (err: any) {
      setError(err.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const gameLink = `${window.location.origin}/?game=${contractAddress}`;
    navigator.clipboard.writeText(gameLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReveal = async () => {
    if (!selectedMove || !gameState) return;

    setRevealing(true);
    setError('');

    try {
      const savedGame = getGame(contractAddress);
      if (!savedGame) {
        throw new Error('Game data not found. Did you create this game on this browser?');
      }

      await solveGame(contractAddress, selectedMove, savedGame.salt);
      
      // Save the revealed move in state (not localStorage)
      setRevealedMove(selectedMove);
      
      loadGame(); // Refresh to show result
    } catch (err: any) {
      setError(err.message || 'Failed to reveal. Wrong move?');
    } finally {
      setRevealing(false);
    }
  };

  const handlePlay = async () => {
    if (!selectedMove || !gameState) return;

    setPlaying(true);
    setError('');

    try {
      await playMove(contractAddress, selectedMove, gameState.stake);
      alert('Move played! Waiting for Player 1 to reveal.');
      loadGame(); // Refresh
    } catch (err: any) {
      setError(err.message || 'Failed to play move');
    } finally {
      setPlaying(false);
    }
  };

  const handleJ2Timeout = async () => {
    setCallingTimeout(true);
    setError('');

    try {
      await j2Timeout(contractAddress);
      alert('Timeout called! You won by default.');
      loadGame(); // Refresh
    } catch (err: any) {
      setError(err.message || 'Failed to call timeout');
    } finally {
      setCallingTimeout(false);
    }
  };

  const handleJ1Timeout = async () => {
    setCallingTimeout(true);
    setError('');

    try {
      await j1Timeout(contractAddress);
      alert('Timeout called! You won by default.');
      loadGame(); // Refresh
    } catch (err: any) {
      setError(err.message || 'Failed to call timeout');
    } finally {
      setCallingTimeout(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div>
          <div>Loading game...</div>
        </div>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div>
        <div>
          <button onClick={onBack}>← Back</button>
          <div>{error || 'Game not found'}</div>
        </div>
      </div>
    );
  }

  const isPlayer1 = gameState.j1.toLowerCase() === account.toLowerCase();
  const isPlayer2 = gameState.j2.toLowerCase() === account.toLowerCase();
  const hasPlayer2Played = gameState.c2 !== Move.Null;
  const isGameComplete = parseFloat(gameState.stake) === 0;

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
        <button onClick={onBack}>← Back</button>
        <h2>Rock Paper Scissors</h2>

        {error && <div style={{color: 'red'}}>{error}</div>}

        <div>
          <p>Contract: {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</p>
          <p>Player 1: {gameState.j1.slice(0, 10)}...{isPlayer1 && ' (You)'}</p>
          <p>Player 2: {gameState.j2.slice(0, 10)}...{isPlayer2 && ' (You)'}</p>
          <p>Stake: {gameState.stake} ETH</p>
          {!isGameComplete && (
            <p>
              ⏱️ Time Remaining: {' '}
              {isTimedOut && ((isPlayer1 && !hasPlayer2Played) || (isPlayer2 && hasPlayer2Played)) ? (
                <span 
                  onClick={isPlayer1 && !hasPlayer2Played ? handleJ2Timeout : handleJ1Timeout}
                  style={{ 
                    color: 'red', 
                    cursor: callingTimeout ? 'wait' : 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 'bold'
                  }}
                  title="Click to claim timeout win"
                >
                  {callingTimeout ? 'Processing...' : timeLeft}
                </span>
              ) : (
                timeLeft
              )}
            </p>
          )}
        </div>

        <hr />

        {/* Game Complete - Result Screen */}
        {isGameComplete && (
          <div>
            {revealedMove && gameState.c2 !== Move.Null ? (
              // Show detailed result
              <>
                <h3>🏁 Game Result</h3>
                
                <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Player 1 {isPlayer1 && '(You)'}:</strong>
                    <div style={{ fontSize: '32px' }}>{getMoveEmoji(revealedMove)} {getMoveString(revealedMove)}</div>
                  </div>
                  
                  <div style={{ fontSize: '24px', margin: '10px 0' }}>vs</div>
                  
                  <div>
                    <strong>Player 2 {isPlayer2 && '(You)'}:</strong>
                    <div style={{ fontSize: '32px' }}>{getMoveEmoji(gameState.c2)} {getMoveString(gameState.c2)}</div>
                  </div>
                </div>

                <WinnerDisplay 
                  contractAddress={contractAddress}
                  revealedMove={revealedMove}
                  c2={gameState.c2}
                  isPlayer1={isPlayer1}
                  isPlayer2={isPlayer2}
                  stake={gameState.stake}
                />

                <button onClick={onBack}>Back to Menu</button>
              </>
            ) : (
              
              <>
                <h3>🏁 Game Complete!</h3>
                {isPlayer2 && gameState.c2 !== Move.Null && (
                  <div style={{ margin: '15px 0' }}>
                    <p><strong>Your Move:</strong> {getMoveEmoji(gameState.c2)} {getMoveString(gameState.c2)}</p>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                      The game has been resolved. Check your wallet balance to see the result!
                    </p>
                  </div>
                )}
                <button onClick={onBack}>Back to Menu</button>
              </>
            )}
          </div>
        )}

        {/* Player 1: Waiting for Player 2 */}
        {!isGameComplete && isPlayer1 && !hasPlayer2Played && (
          <div>
            <h3>⏳ Waiting for Player 2...</h3>
            <p>Share this link with your opponent:</p>
            <button onClick={handleCopyLink}>
              {copied ? '✓ Copied!' : 'Copy Game Link'}
            </button>
            <p style={{fontSize: '12px', color: '#666'}}>🔄 Auto-refreshing every 15 seconds...</p>
          </div>
        )}

        {/* Player 1: Ready to Reveal */}
        {!isGameComplete && isPlayer1 && hasPlayer2Played && (
          <div>
            <h3>✅ Player 2 has played!</h3>
            <p>Enter your move to reveal and resolve the game:</p>
            
            <div>
              {moves.map((move) => (
                <button
                  key={move.value}
                  onClick={() => setSelectedMove(move.value)}
                  style={{
                    border: selectedMove === move.value ? '2px solid blue' : '1px solid gray',
                    margin: '5px'
                  }}
                >
                  <div>{move.emoji}</div>
                  <div>{move.label}</div>
                </button>
              ))}
            </div>

            <button 
              onClick={handleReveal} 
              disabled={!selectedMove || revealing}
            >
              {revealing ? 'Revealing...' : 'Reveal Move & Resolve Game'}
            </button>
          </div>
        )}

        {/* Player 2: Play Move */}
        {!isGameComplete && isPlayer2 && !hasPlayer2Played && (
          <div>
            <h3>🎮 Your Turn!</h3>
            <p>Player 1 has committed their move. Choose yours:</p>
            
            <div>
              {moves.map((move) => (
                <button
                  key={move.value}
                  onClick={() => setSelectedMove(move.value)}
                  style={{
                    border: selectedMove === move.value ? '2px solid green' : '1px solid gray',
                    margin: '5px'
                  }}
                >
                  <div>{move.emoji}</div>
                  <div>{move.label}</div>
                </button>
              ))}
            </div>

            <button 
              onClick={handlePlay} 
              disabled={!selectedMove || playing}
            >
              {playing ? 'Playing...' : `Play Move (${gameState.stake} ETH)`}
            </button>
          </div>
        )}

        {/* Player 2: Waiting for Player 1 to Reveal */}
        {!isGameComplete && isPlayer2 && hasPlayer2Played && (
          <div>
            <h3>⏳ Waiting for Player 1 to reveal...</h3>
            <p>Your move has been submitted. Wait for Player 1 to reveal their move.</p>
            <p style={{fontSize: '12px', color: '#666'}}>🔄 Auto-refreshing every 15 seconds...</p>
          </div>
        )}

        {/* Observer: Not a player */}
        {!isPlayer1 && !isPlayer2 && (
          <div>
            <h3>👀 Spectator View</h3>
            <p>You are not a player in this game.</p>
            <button onClick={onBack}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

