import { createPublicClient, createWalletClient, custom, http, PublicClient, Address, Hash, Chain } from 'viem';
import { getContractAddress } from '@/config/networks';

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

export interface TokenConfig {
  name: string;
  maxSupply: bigint;
  price: bigint;
  allowlistRequired: boolean;
  active: boolean;
  soulbound: boolean;
}

export const createNFTContractReader = (chain: Chain) => {
  const contractAddress = getContractAddress(chain.id, 'nft') as Address;

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

export const mintNFT = async ({
  chain,
  tokenId,
  amount = BigInt(1),
  signature = '0x', // Add signature parameter with default empty value
  price = BigInt(0), // Add price parameter
}: {
  chain: Chain;
  tokenId: bigint;
  amount?: bigint;
  signature?: `0x${string}`;
  price?: bigint;
}): Promise<Hash> => {
  if (!window.ethereum) throw new Error('No wallet detected');

  const contractAddress = getContractAddress(chain.id, 'nft') as Address;

  const client = createWalletClient({
    chain,
    transport: custom(window.ethereum)
  });

  const [account] = await client.requestAddresses();

  return client.writeContract({
    address: contractAddress,
    abi: NFT_CONTRACT_ABI,
    functionName: 'mint',
    args: [account, tokenId, amount, signature],
    account,
    value: price * amount, // Calculate total price based on amount
  });
};