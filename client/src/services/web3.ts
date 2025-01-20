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

declare global {
  interface Window {
    ethereum: any;
  }
}

export const NFT_CONTRACT_ADDRESS =
  "0x85be9de7a369850a964616a2c04d79000d168dea" as Address;
export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

// Support multiple chains
export const SUPPORTED_CHAINS = {
  MAINNET: mainnet,
  POLYGON: polygon,
} as const;

// Function to get the current chain from ethereum provider
async function getCurrentChain(): Promise<Chain> {
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
] as const;

class NFTService {
  constructor() {}

  private async getClient() {
    return getPublicClient();
  }

  async getNFTs(address: Address) {
    try {
      const client = await this.getClient();

      // Get token IDs owned by address
      const tokenIds = await client.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "tokensOfOwner",
        args: [address],
      });

      // Fetch metadata for each token
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const uri = await client.readContract({
            address: NFT_CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: "tokenURI",
            args: [tokenId],
          });

          const metadata = await parseTokenUri(uri);

          return {
            tokenId: tokenId.toString(),
            tokenAddress: NFT_CONTRACT_ADDRESS,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
          };
        }),
      );

      return nfts;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      throw new Error("Failed to fetch NFTs");
    }
  }

  async burnNFT(tokenAddress: Address, tokenId: string): Promise<Hash> {
    try {
      const { client, account } = await getWalletClient();

      console.log(tokenAddress, tokenId);
      if (!tokenAddress || !tokenId) {
        throw new Error("Invalid token address or token ID");
      }

      // Log chain information for debugging
      console.log("Current Chain:", client.chain);
      console.log("Account:", account);
      console.log("Token Address:", tokenAddress);
      console.log("Token ID:", tokenId);

      // Perform burn by sending to dead address
      const hash = await client.writeContract({
        address: tokenAddress,
        abi: NFT_ABI,
        functionName: "transferFrom",
        args: [
          account,
          "0x000000000000000000000000000000000000dEaD" as Address,
          BigInt(tokenId),
        ],
        account,
        chain: client.chain,
      });

      return hash;
    } catch (error) {
      console.error("Error burning NFT:", error);
      if (error instanceof Error) {
        throw error; // Preserve the original error message
      }
      throw new Error("Failed to burn NFT");
    }
  }
}

async function parseTokenUri(uri: string) {
  try {
    // Handle IPFS URIs
    const url = uri.startsWith("ipfs://")
      ? `https://ipfs.io/ipfs/${uri.slice(7)}`
      : uri;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch metadata");

    return await response.json();
  } catch (error) {
    console.error("Error parsing token URI:", error);
    throw new Error("Failed to parse token metadata");
  }
}

// Initialize and export default instance
const nftService = new NFTService();
export default nftService;
