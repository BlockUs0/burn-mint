import { createPublicClient, createWalletClient, http, custom, PublicClient, WalletClient, Address, Hash } from "viem";
import { mainnet } from "viem/chains";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const NFT_CONTRACT_ADDRESS = "0x85be9de7a369850a964616a2c04d79000d168dea" as Address;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

export const NFT_ABI = [
  {
    "inputs": [{"internalType": "address","name": "owner","type": "address"}],
    "name": "tokensOfOwner",
    "outputs": [{"internalType": "uint256[]","name": "","type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string","name": "","type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address","name": "","type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "name": "transferFrom",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"name": "from","type": "address"},
      {"name": "to","type": "address"},
      {"name": "tokenId","type": "uint256"}
    ],
    "outputs": []
  },
  {
    "inputs": [
      {"name": "operator","type": "address"},
      {"name": "approved","type": "bool"}
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner","type": "address"},
      {"name": "operator","type": "address"}
    ],
    "name": "isApprovedForAll",
    "outputs": [{"name": "","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function getWalletClient(): WalletClient {
  if (!window.ethereum) throw new Error("No wallet detected");
  return createWalletClient({
    chain: mainnet,
    transport: custom(window.ethereum),
  });
}

async function parseTokenUri(uri: string) {
  try {
    // Handle IPFS URIs
    const url = uri.startsWith('ipfs://')
      ? `https://ipfs.io/ipfs/${uri.slice(7)}`
      : uri;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch metadata');

    return await response.json();
  } catch (error) {
    console.error('Error parsing token URI:', error);
    throw new Error('Failed to parse token metadata');
  }
}

class NFTService {
  private walletClient: WalletClient | null = null;

  constructor(
    private readonly publicClient: PublicClient,
  ) {}

  private async getWalletClient() {
    if (!this.walletClient) {
      this.walletClient = getWalletClient();
    }
    const [account] = await this.walletClient.requestAddresses();
    return { client: this.walletClient, account };
  }

  async getNFTs(address: Address): Promise<NFT[]> {
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
        })
      );

      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      throw new Error('Failed to fetch NFTs');
    }
  }

  async checkApproval(ownerAddress: Address): Promise<boolean> {
    try {
      return await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "isApprovedForAll",
        args: [ownerAddress, NFT_CONTRACT_ADDRESS],
      });
    } catch (error) {
      console.error('Error checking approval:', error);
      throw new Error('Failed to check NFT approval status');
    }
  }

  async setApproval(): Promise<Hash> {
    try {
      const { client, account } = await this.getWalletClient();
      return await client.writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "setApprovalForAll",
        args: [NFT_CONTRACT_ADDRESS, true],
        account,
        chain: mainnet,
      });
    } catch (error) {
      console.error('Error setting approval:', error);
      throw new Error('Failed to approve NFT contract');
    }
  }

  async burnNFT(tokenId: string): Promise<Hash> {
    try {
      const { client, account } = await this.getWalletClient();

      // Verify ownership
      const ownerAddress = await this.publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      });

      if (ownerAddress.toLowerCase() !== account.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }

      // Check if approved
      const isApproved = await this.checkApproval(ownerAddress);
      if (!isApproved) {
        const approvalHash = await this.setApproval();
        // Wait for approval transaction
        await this.publicClient.waitForTransactionReceipt({ hash: approvalHash });
      }

      // Perform burn
      const hash = await client.writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'transferFrom',
        args: [
          ownerAddress,
          ZERO_ADDRESS,
          BigInt(tokenId)
        ],
        account,
        chain: mainnet,
      });

      return hash;
    } catch (error) {
      console.error('Error burning NFT:', error);
      throw new Error('Failed to burn NFT');
    }
  }
}

// Initialize and export default instance
const nftService = new NFTService(publicClient);
export default nftService;