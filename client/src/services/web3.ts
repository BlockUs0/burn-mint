import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  PublicClient,
  WalletClient,
  Address,
  Hash,
  SwitchChainError,
} from "viem";
import { mainnet } from "viem/chains";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const NFT_CONTRACT_ADDRESS =
  "0x85be9de7a369850a964616a2c04d79000d168dea" as Address;
export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

// Create public client for read operations
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Get wallet client for write operations
export function getWalletClient(): WalletClient {
  if (!window.ethereum) throw new Error("No wallet detected");
  return createWalletClient({
    chain: mainnet,
    transport: custom(window.ethereum),
  });
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
  private walletClient: WalletClient | null = null;

  constructor(private readonly publicClient: PublicClient) {}

  private async getWalletClient() {
    if (!this.walletClient) {
      this.walletClient = getWalletClient();
    }
    const [account] = await this.walletClient.requestAddresses();
    return { client: this.walletClient, account };
  }

  private async ensureCorrectChain(client: WalletClient) {
    try {
      const chainId = await client.getChainId();
      if (chainId !== mainnet.id) {
        await client.switchChain({ id: mainnet.id });
      }
    } catch (error) {
      if (error instanceof SwitchChainError) {
        throw new Error("Please switch to Ethereum Mainnet to burn NFTs");
      }
      throw error;
    }
  }

  async getNFTs(address: Address) {
    try {
      // Get token IDs owned by address
      const tokenIds = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "tokensOfOwner",
        args: [address],
      });

      // Fetch metadata for each token
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const uri = await this.publicClient.readContract({
            address: NFT_CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: "tokenURI",
            args: [tokenId],
          });

          const metadata = await parseTokenUri(uri);

          return {
            tokenId: tokenId.toString(),
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

  async burnNFT(tokenId: string): Promise<Hash> {
    try {
      const { client, account } = await this.getWalletClient();

      if (!account) {
        throw new Error("No wallet detected");
      }

      // Ensure user is on correct chain before proceeding
      await this.ensureCorrectChain(client);

      // Perform burn by sending to zero address
      const hash = await client.writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "transferFrom",
        args: [account, ZERO_ADDRESS, BigInt(tokenId)],
        account,
        chain: mainnet,
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
const nftService = new NFTService(publicClient);
export default nftService;