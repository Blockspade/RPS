import { useState } from 'react';

interface GameRulesAckProps {
  onAcknowledge: () => void;
}

export default function GameRulesAck({ onAcknowledge }: GameRulesAckProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px',
      textAlign: 'left',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      color: '#333'
    }}>
      <h2>Welcome to Rock-Paper-Scissors-Lizard-Spock! 🎮</h2>
      
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Please read these important notes before playing:
      </p>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        lineHeight: '1.6'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <strong>🎯 How It Works:</strong>
        </div>

        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            This is an extended Rock-Paper-Scissors game with 5 moves: Rock, Paper, Scissors, Lizard, and Spock
          </li>
          
          <li style={{ marginBottom: '10px' }}>
            When you create a game, a <strong>salt file</strong> will be automatically downloaded to your computer
          </li>
          
          <li style={{ marginBottom: '10px' }}>
            Share the game link with your opponent so they can join and play
          </li>
          
          <li style={{ marginBottom: '10px' }}>
            After Player 2 makes their move, you (Player 1) must upload the salt file to reveal your move
          </li>
          
          <li style={{ marginBottom: '10px' }}>
            The salt file proves you can't change your original move - it keeps the game fair!
          </li>
          
          <li style={{ marginBottom: '10px' }}>
            If either player becomes inactive, the other can claim a timeout win after the timer runs out
          </li>
        </ol>

        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#fff3cd', 
          borderLeft: '4px solid #ffc107',
          borderRadius: '4px'
        }}>
          <strong>⚠️ Critical:</strong> Keep your salt file safe! Without it, you cannot reveal your move and will lose by timeout.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginRight: '10px', cursor: 'pointer', width: '18px', height: '18px' }}
          />
          <span>I understand how the game works and will keep my salt file safe</span>
        </label>
      </div>

      <button
        onClick={onAcknowledge}
        disabled={!agreed}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          opacity: agreed ? 1 : 0.5,
          cursor: agreed ? 'pointer' : 'not-allowed'
        }}
      >
        {agreed ? "Let's Play! 🚀" : 'Please check the box above'}
      </button>
    </div>
  );
}

