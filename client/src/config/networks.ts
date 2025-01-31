import { mainnet, sepolia, goerli, polygon } from 'viem/chains';

export const networks = {
  [mainnet.id]: {
    chain: mainnet,
    displayName: 'Ethereum',
    icon: '⟠',
    alchemyUrl: 'https://eth-mainnet.g.alchemy.com/v2',
    nftContractAddress: '0x85be9de7a369850a964616a2c04d79000d168dea',
    batchContractAddress: undefined, // Not deployed on mainnet yet
  },
  [sepolia.id]: {
    chain: sepolia,
    displayName: 'Sepolia',
    icon: '🔵',
    alchemyUrl: 'https://eth-sepolia.g.alchemy.com/v2',
    nftContractAddress: '0x85be9de7a369850a964616a2c04d79000d168dea',
    batchContractAddress: undefined, // Not deployed on sepolia yet
  },
  [goerli.id]: {
    chain: goerli,
    displayName: 'Goerli',
    icon: '🟡',
    alchemyUrl: 'https://eth-goerli.g.alchemy.com/v2',
    nftContractAddress: '0x85be9de7a369850a964616a2c04d79000d168dea',
    batchContractAddress: undefined, // Not deployed on goerli yet
  },
  [polygon.id]: {
    chain: polygon,
    displayName: 'Polygon',
    icon: '🟣',
    alchemyUrl: 'https://polygon-mainnet.g.alchemy.com/v2',
    nftContractAddress: '0x85be9de7a369850a964616a2c04d79000d168dea',
    batchContractAddress: '0x3Fe5F8beD9821f2027bea6794b2d46c1eD7caB43',
  },
} as const;

export type NetworkConfig = typeof networks[keyof typeof networks];
export type SupportedChainId = keyof typeof networks;

export function isChainSupported(chainId: number): chainId is SupportedChainId {
  return chainId in networks;
}

export function hasBatchSupport(chainId: number): boolean {
  if (!isChainSupported(chainId)) return false;
  return networks[chainId as SupportedChainId].batchContractAddress !== undefined;
}

export function getBatchContractAddress(chainId: number): string {
  if (!isChainSupported(chainId)) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }

  const address = networks[chainId as SupportedChainId].batchContractAddress;
  if (!address) {
    throw new Error(`Batch operations not supported on chain ID ${chainId}`);
  }

  return address;
}