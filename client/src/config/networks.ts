import { mainnet, sepolia, goerli, polygon } from 'viem/chains';

export const networks = {
  [mainnet.id]: {
    chain: mainnet,
    displayName: 'Ethereum',
    icon: '⟠',
    alchemyUrl: 'https://eth-mainnet.g.alchemy.com/v2',
    contracts: {
      nft: '0x85be9de7a369850a964616a2c04d79000d168dea',
      batch: undefined, // Not deployed on mainnet yet
      tralaContract: undefined, // Not deployed on mainnet
    },
  },
  [sepolia.id]: {
    chain: sepolia,
    displayName: 'Sepolia',
    icon: '🔵',
    alchemyUrl: 'https://eth-sepolia.g.alchemy.com/v2',
    contracts: {
      nft: '0x85be9de7a369850a964616a2c04d79000d168dea',
      batch: undefined, // Not deployed on sepolia yet
      tralaContract: undefined, // Not deployed on sepolia
    },
  },
  [goerli.id]: {
    chain: goerli,
    displayName: 'Goerli',
    icon: '🟡',
    alchemyUrl: 'https://eth-goerli.g.alchemy.com/v2',
    contracts: {
      nft: '0x85be9de7a369850a964616a2c04d79000d168dea',
      batch: undefined, // Not deployed on goerli yet
      tralaContract: undefined, // Not deployed on goerli
    },
  },
  [polygon.id]: {
    chain: polygon,
    displayName: 'Polygon',
    icon: '🟣',
    alchemyUrl: 'https://polygon-mainnet.g.alchemy.com/v2',
    contracts: {
      nft: '0xF9Ecd484e6a5495eFAc077B0f77F9311D0b38C63', 
      batch: '0x3Fe5F8beD9821f2027bea6794b2d46c1eD7caB43',
      tralaContract: '0xF9Ecd484e6a5495eFAc077B0f77F9311D0b38C63',
    },
  },
} as const;

export type NetworkConfig = typeof networks[keyof typeof networks];
export type SupportedChainId = keyof typeof networks;

export function isChainSupported(chainId: number): chainId is SupportedChainId {
  return chainId in networks;
}

export function getContractAddress(chainId: number, contractType: keyof NetworkConfig['contracts']): string {
  if (!isChainSupported(chainId)) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }

  const address = networks[chainId].contracts[contractType];
  if (!address) {
    throw new Error(`${contractType} contract not deployed on chain ID ${chainId}`);
  }

  return address;
}

export function hasBatchSupport(chainId: number): boolean {
  if (!isChainSupported(chainId)) return false;
  return networks[chainId].contracts.batch !== undefined;
}

export function getBatchContractAddress(chainId: number): string {
  return getContractAddress(chainId, 'batch');
}