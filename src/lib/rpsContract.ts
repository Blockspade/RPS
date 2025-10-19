import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import RPS_ABI from '../abi/rps.json';

export const Move = {
  Null: 0,
  Rock: 1,
  Paper: 2,
  Scissors: 3,
  Spock: 4,
  Lizard: 5
} as const;

export type Move = typeof Move[keyof typeof Move];

export interface GameState {
  j1: string;
  j2: string;
  stake: string;
  c2: Move;
  c1Hash: string;
  lastAction: bigint;
  timeout: bigint;
}

export const checkContractExists = async (address: string): Promise<boolean> => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    return false;
  }
};

export const getGameState = async (contractAddress: string): Promise<GameState> => {
  const provider = new BrowserProvider(window.ethereum);
  const contract = new Contract(contractAddress, RPS_ABI, provider);

  const [j1, j2, stake, c2, c1Hash, lastAction, timeout] = await Promise.all([
    contract.j1(),
    contract.j2(),
    contract.stake(),
    contract.c2(),
    contract.c1Hash(),
    contract.lastAction(),
    contract.TIMEOUT()
  ]);

  return {
    j1,
    j2,
    stake: formatEther(stake),
    c2: Number(c2) as Move,
    c1Hash,
    lastAction,
    timeout
  };
};

export const playMove = async (
  contractAddress: string,
  move: Move,
  stakeAmount: string
): Promise<void> => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, RPS_ABI, signer);

  const tx = await contract.play(move, {
    value: parseEther(stakeAmount)
  });

  await tx.wait();
};

export const getMoveString = (move: Move): string => {
  switch (move) {
    case Move.Rock: return 'Rock';
    case Move.Paper: return 'Paper';
    case Move.Scissors: return 'Scissors';
    case Move.Spock: return 'Spock';
    case Move.Lizard: return 'Lizard';
    default: return 'None';
  }
};

