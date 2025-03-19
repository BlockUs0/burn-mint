import { createPublicClient, http, Address, createWalletClient } from 'viem';
import { sepolia, mainnet } from 'viem/chains';
import type { Chain } from 'viem';

// Contract addresses for different networks
export const NFT_CONTRACT_ADDRESSES: Record<number, Address> = {
  [sepolia.id]: '0x...' as Address, // TODO: Add Sepolia contract address
  [mainnet.id]: '0x...' as Address, // TODO: Add Mainnet contract address
};

// ABI for the NFT contract
export const NFT_CONTRACT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'signature', type: 'bytes' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getAllTokenIds',
    outputs: [{ type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'tokenConfigs',
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'allowlistRequired', type: 'bool' },
      { name: 'active', type: 'bool' },
      { name: 'soulbound', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Types based on contract structs
export interface TokenConfig {
  name: string;
  maxSupply: bigint;
  price: bigint;
  allowlistRequired: boolean;
  active: boolean;
  soulbound: boolean;
}

// Create contract instance for reading
export const createNFTContractReader = (chain: Chain) => {
  const contractAddress = NFT_CONTRACT_ADDRESSES[chain.id];
  if (!contractAddress) {
    throw new Error(`No contract address found for chain ${chain.id}`);
  }

  const client = createPublicClient({
    chain,
    transport: http()
  });

  return {
    getAllTokenIds: async () => {
      return client.readContract({
        address: contractAddress,
        abi: NFT_CONTRACT_ABI,
        functionName: 'getAllTokenIds'
      });
    },
    getTokenConfig: async (tokenId: bigint): Promise<TokenConfig> => {
      const result = await client.readContract({
        address: contractAddress,
        abi: NFT_CONTRACT_ABI,
        functionName: 'tokenConfigs',
        args: [tokenId]
      }) as readonly [string, bigint, bigint, boolean, boolean, boolean];

      // Properly map the tuple to our TokenConfig interface
      return {
        name: result[0],
        maxSupply: result[1],
        price: result[2],
        allowlistRequired: result[3],
        active: result[4],
        soulbound: result[5]
      };
    }
  };
};