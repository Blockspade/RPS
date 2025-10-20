import { BrowserProvider, Contract, ContractFactory, formatEther, parseEther } from 'ethers';
import RPS_ABI from '../abi/rps.json';
import { RPS_BYTECODE } from '../abi/bytecode';

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
  console.log(contractAddress, j1, j2, stake, c2, c1Hash, lastAction, timeout);
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

export const getMoveEmoji = (move: Move): string => {
  switch (move) {
    case Move.Rock: return '✊';
    case Move.Paper: return '📄';
    case Move.Scissors: return '✂️';
    case Move.Spock: return '🖖';
    case Move.Lizard: return '🦎';
    default: return '❓';
  }
};

export const determineWinner = async (contractAddress: string, c1: Move, c2: Move): Promise<number> => {
  if (c1 === c2) return 0;
  if (c1 === Move.Null || c2 === Move.Null) return 0;
  
  try {
    const provider = new BrowserProvider(window.ethereum);
    const contract = new Contract(contractAddress, RPS_ABI, provider);
    
    const c1Wins: boolean = await contract.win(c1, c2);
    
    return c1Wins ? 1 : 2;
  } catch (error) {
    console.error('Error determining winner:', error);
    return 0;
  }
};

export const deployGame = async (
  c1Hash: string,
  j2Address: string,
  stakeAmount: string
): Promise<string> => {
  if (RPS_BYTECODE.includes("BYTECODE_NEEDED")) {
    throw new Error("Contract bytecode not configured. Please add your compiled bytecode to src/abi/bytecode.ts");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const factory = new ContractFactory(RPS_ABI, RPS_BYTECODE, signer);

  const contract = await factory.deploy(c1Hash, j2Address, {
    value: parseEther(stakeAmount)
  });

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  return address;
};

export const solveGame = async (
  contractAddress: string,
  move: number,
  salt: string
): Promise<void> => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, RPS_ABI, signer);

  const tx = await contract.solve(move, salt);
  await tx.wait();
};

export const j1Timeout = async (contractAddress: string): Promise<void> => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, RPS_ABI, signer);

  const tx = await contract.j1Timeout();
  await tx.wait();
};

export const j2Timeout = async (contractAddress: string): Promise<void> => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, RPS_ABI, signer);

  const tx = await contract.j2Timeout();
  await tx.wait();
};

