import { BrowserProvider, formatEther } from 'ethers';
import { SEPOLIA } from './chain';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);
  const network = await provider.getNetwork();

  return {
    address,
    balance: parseFloat(formatEther(balance)).toFixed(4),
    chainId: network.chainId.toString()
  };
};

export const getBalance = async (address: string) => {
  const provider = new BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  return parseFloat(formatEther(balance)).toFixed(4);
};

export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
  if (!window.ethereum) return;
  window.ethereum.on('accountsChanged', callback);
};

export const onChainChanged = (callback: () => void) => {
  if (!window.ethereum) return;
  window.ethereum.on('chainChanged', callback);
};

export const removeListeners = () => {
  if (!window.ethereum?.removeListener) return;
  
  window.ethereum.removeListener('accountsChanged', () => {});
  window.ethereum.removeListener('chainChanged', () => {});
};

export const getCurrentChainId = async (): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  return network.chainId.toString();
};

export const isOnSepolia = async (): Promise<boolean> => {
  const chainId = await getCurrentChainId();
  return chainId === SEPOLIA.chainId.toString();
};

export const switchToSepolia = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA.chainIdHex }],
    });
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: SEPOLIA.chainIdHex,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: [SEPOLIA.explorer],
          },
        ],
      });
    } else {
      throw error;
    }
  }
};