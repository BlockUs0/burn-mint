import { mainnet, sepolia, goerli, polygon } from 'viem/chains';

export const networks = {
  [mainnet.id]: {
    chain: mainnet,
    displayName: 'Ethereum',
    icon: '⟠',
    alchemyUrl: 'https://eth-mainnet.g.alchemy.com/v2',
    nftContractAddress: '0x85be9de7a369850a964616a2c04d79000d168dea',
  },
  [sepolia.id]: {
    chain: sepolia,
    displayName: 'Sepolia',
    icon: '🔵',
    alchemyUrl: 'https://eth-sepolia.g.alchemy.com/v2',
    nftContractAddress: '0x85be9de7a369850a964616a2c04d79000d168dea',
  },
  [goerli.id]: {
    chain: goerli,
    displayName: 'Goerli',
    icon: '🟡',
    alchemyUrl: 'https://eth-goerli.g.alchemy.com/v2',
    nftContractAddress: '0x85be9de7a369850a964616a2c04d79000d168dea',
  },
  [polygon.id]: {
    chain: polygon,
    displayName: 'Polygon',
    icon: '🟣',
    alchemyUrl: 'https://polygon-mainnet.g.alchemy.com/v2',
    nftContractAddress: '0x85be9de7a369850a964616a2c04d79000d168dea',
  },
} as const;

export type NetworkConfig = typeof networks[keyof typeof networks];
export type SupportedChainId = keyof typeof networks;

export function isChainSupported(chainId: number): chainId is SupportedChainId {
  return chainId in networks;
}