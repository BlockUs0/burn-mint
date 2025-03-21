import { mainnet, sepolia, polygon, zksync } from "viem/chains";

export const networks = {
  [mainnet.id]: {
    chain: mainnet,
    displayName: "Ethereum",
    icon: "⟠",
    alchemyUrl: "https://eth-mainnet.g.alchemy.com/v2",
    contracts: {
      nft: "0x85be9de7a369850a964616a2c04d79000d168dea",
      batch: undefined, // Not deployed on mainnet yet
      tralaContract: undefined, // Not deployed on mainnet
    },
    nativeCurrency: {
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: "https://etherscan.io",
  },
  [sepolia.id]: {
    chain: sepolia,
    displayName: "Sepolia",
    icon: "🔵",
    alchemyUrl: "https://eth-sepolia.g.alchemy.com/v2",
    contracts: {
      nft: "0x85be9de7a369850a964616a2c04d79000d168dea",
      batch: undefined, // Not deployed on sepolia yet
      tralaContract: undefined, // Not deployed on sepolia
    },
  },
  [polygon.id]: {
    chain: polygon,
    displayName: "Polygon",
    icon: "🟣",
    alchemyUrl: "https://polygon-mainnet.g.alchemy.com/v2",
    contracts: {
      nft: "0xF9Ecd484e6a5495eFAc077B0f77F9311D0b38C63",
      batch: "0x3Fe5F8beD9821f2027bea6794b2d46c1eD7caB43",
      tralaContract: "0xF9Ecd484e6a5495eFAc077B0f77F9311D0b38C63",
    },
    nativeCurrency: {
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorer: "https://polygonscan.com",
  },
  [zksync.id]: {
    chain: zksync,
    displayName: zksync.name,
    icon: "🟣",
    alchemyUrl: "https://zksync-mainnet.g.alchemy.com/v2", //zksync-mainnet.g.alchemy.com/
    contracts: {
      nft: undefined,
      batch: "0x903331Afa5DEc4894403dcd7f26D4A981BB04Be4",
      tralaContract: undefined,
    },
    nativeCurrency: {
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: zksync.blockExplorers.default,
  },
} as const;

export type NetworkConfig = (typeof networks)[keyof typeof networks];
export type SupportedChainId = keyof typeof networks;

export function isChainSupported(chainId: number): chainId is SupportedChainId {
  return chainId in networks;
}

export function getContractAddress(
  chainId: number,
  contractType: keyof NetworkConfig["contracts"],
): string {
  if (!isChainSupported(chainId)) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }

  const address = networks[chainId].contracts[contractType];
  if (!address) {
    throw new Error(
      `${contractType} contract not deployed on chain ID ${chainId}`,
    );
  }

  return address;
}

export function hasBatchSupport(chainId: number): boolean {
  if (!isChainSupported(chainId)) return false;
  return networks[chainId].contracts.batch !== undefined;
}

export function getBatchContractAddress(chainId: number): string {
  return getContractAddress(chainId, "batch");
}
