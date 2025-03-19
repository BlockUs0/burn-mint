import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  PublicClient,
  WalletClient,
  Address,
  Hash,
  Chain,
} from "viem";
import { mainnet, polygon } from "viem/chains";
import { hasBatchSupport, getBatchContractAddress } from "@/config/networks";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { API_CONFIG } from "@/config/api";

export const { NFT_ADDRESS: NFT_CONTRACT_ADDRESS, ZERO_ADDRESS, BURN_ADDRESS } = API_CONFIG.CONTRACTS;

export const SUPPORTED_CHAINS = {
  MAINNET: mainnet,
  POLYGON: polygon,
} as const;

// Network specific configurations
export const NETWORK_CONFIG = {
  [mainnet.id]: {
    name: 'Ethereum',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://etherscan.io',
  },
  [polygon.id]: {
    name: 'Polygon',
    nativeCurrency: {
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorer: 'https://polygonscan.com',
  },
} as const;

// Function to get block explorer URL for a transaction
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const config = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG];
  if (!config) throw new Error(`Unsupported chain ID: ${chainId}`);
  return `${config.blockExplorer}/tx/${txHash}`;
}

// Function to format native currency amount
export function formatNativeCurrency(chainId: number, amount: bigint): string {
  const config = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG];
  if (!config) throw new Error(`Unsupported chain ID: ${chainId}`);
  return `${(Number(amount) / 10 ** config.nativeCurrency.decimals).toFixed(4)} ${config.nativeCurrency.symbol}`;
}

// Function to get the current chain from ethereum provider
export async function getCurrentChain(): Promise<Chain> {
  if (!window.ethereum) throw new Error("No wallet detected");

  const chainId = parseInt(window.ethereum.chainId);

  // Find matching chain config
  const chain = Object.values(SUPPORTED_CHAINS).find((c) => c.id === chainId);

  if (!chain) {
    throw new Error(
      "Please connect to a supported network (chainId: 1 or 137)",
    );
  }

  return chain;
}

// Create public client that adapts to the current chain
export async function getPublicClient(): Promise<PublicClient> {
  const chain = await getCurrentChain();
  return createPublicClient({
    chain,
    transport: http(),
  });
}

// Get wallet client for write operations
export async function getWalletClient(): Promise<{
  client: WalletClient;
  account: Address;
}> {
  if (!window.ethereum) throw new Error("No wallet detected");

  const chain = await getCurrentChain();
  const client = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });

  const [account] = await client.requestAddresses();
  return { client, account };
}

export const NFT_ABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "tokensOfOwner",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "setApprovalForAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "isApprovedForAll",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const BATCH_TRANSFER_ABI = [
  {
    name: "batchTransferToSingleWallet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { internalType: "address", name: "erc721Contract", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256[]", name: "tokenIds", type: "uint256[]" },
    ],
    outputs: [],
  },
] as const;

class NFTService {
  private async getClient() {
    return getPublicClient();
  }

  async isApprovedForAll(owner: Address, tokenAddress: Address): Promise<boolean> {
    try {
      const client = await this.getClient();
      const chainId = client.chain?.id;

      if (!chainId || !hasBatchSupport(chainId)) {
        throw new Error("Batch operations not supported on this network");
      }

      const batchContractAddress = getBatchContractAddress(chainId);

      const isApproved = await client.readContract({
        address: tokenAddress,
        abi: NFT_ABI,
        functionName: "isApprovedForAll",
        args: [owner, batchContractAddress as Address],
      });

      return isApproved;
    } catch (error) {
      console.error("Error checking approval:", error);
      throw error;
    }
  }

  async setApprovalForAll(tokenAddress: Address): Promise<Hash> {
    try {
      const { client, account } = await getWalletClient();
      const chain = await getCurrentChain();

      if (!hasBatchSupport(chain.id)) {
        throw new Error("Batch operations not supported on this network");
      }

      const batchContractAddress = getBatchContractAddress(chain.id);

      const hash = await client.writeContract({
        address: tokenAddress,
        abi: NFT_ABI,
        functionName: "setApprovalForAll",
        args: [batchContractAddress as Address, true],
        account,
        chain
      });

      return hash;
    } catch (error) {
      console.error("Error setting approval:", error);
      throw error;
    }
  }

  async batchBurnNFTs(tokenAddress: Address, tokenIds: string[]): Promise<Hash> {
    try {
      const { client, account } = await getWalletClient();
      const chain = await getCurrentChain();

      if (!hasBatchSupport(chain.id)) {
        throw new Error("Batch operations not supported on this network");
      }

      const batchContractAddress = getBatchContractAddress(chain.id);

      // Convert tokenIds to BigInt
      const tokenIdsBigInt = tokenIds.map(id => BigInt(id));

      const hash = await client.writeContract({
        address: batchContractAddress as Address,
        abi: BATCH_TRANSFER_ABI,
        functionName: "batchTransferToSingleWallet",
        args: [
          tokenAddress,
          BURN_ADDRESS, // Use burn address for "burning" NFTs
          tokenIdsBigInt,
        ],
        account,
        chain
      });

      return hash;
    } catch (error) {
      console.error("Error batch burning NFTs:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to batch burn NFTs");
    }
  }
}

const nftService = new NFTService();
export default nftService;