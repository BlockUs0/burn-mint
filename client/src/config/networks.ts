
import { mainnet, sepolia, goerli } from 'viem/chains';

export const networks = {
  [mainnet.id]: {
    chain: mainnet,
    displayName: 'Ethereum',
    icon: '⟠',
    alchemyUrl: 'https://eth-mainnet.g.alchemy.com/v2',
  },
  [sepolia.id]: {
    chain: sepolia,
    displayName: 'Sepolia',
    icon: '🔵',
    alchemyUrl: 'https://eth-sepolia.g.alchemy.com/v2',
  },
  [goerli.id]: {
    chain: goerli,
    displayName: 'Goerli',
    icon: '🟡',
    alchemyUrl: 'https://eth-goerli.g.alchemy.com/v2',
  },
} as const;

