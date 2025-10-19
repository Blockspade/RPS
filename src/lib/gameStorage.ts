
export interface SavedGame {
  contractAddress: string;
  salt: string; // Only store salt - needed for P1 to reveal
}

const STORAGE_KEY = 'rps_current_game';

// Save current game 
export const saveGame = (game: SavedGame): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
};

// Get current game
export const getGame = (contractAddress: string): SavedGame | undefined => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return undefined;
  
  try {
    const game = JSON.parse(data);
    // Check if this is the right game
    if (game.contractAddress.toLowerCase() === contractAddress.toLowerCase()) {
      return game;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

// Clear current game (optional - for cleanup)
export const clearGame = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

