import { NFT, NFTCollection } from "@/types";
import {
  networks,
  type SupportedChainId,
  isChainSupported,
} from "@/config/networks";

const ALCHEMY_API_KEY =
  import.meta.env.VITE_ALCHEMY_API_KEY || "Eb5YzZMR9-i55viNBnAvUpwN11ko7YR3";

function getAlchemyBaseUrl(chainId: number): string {
  if (!isChainSupported(chainId)) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }

  const network = networks[chainId];
  if (!network?.alchemyUrl) {
    throw new Error(`Alchemy URL not configured for chain ID ${chainId}`);
  }

  return `${network.alchemyUrl}/${ALCHEMY_API_KEY}`;
}

function sanitizeImageUrl(url: string): string {
  if (!url) return "";
  // Handle IPFS URLs
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
  // Handle relative URLs by making them absolute
  if (url.startsWith("/")) {
    return `https://nft-cdn.alchemy.com${url}`;
  }
  return url;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryCount = 3,
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText);

      // Check if it's a rate limit error
      if (errorJson.error?.message?.includes("rate limits") && retryCount > 0) {
        // Calculate delay with exponential backoff
        const delay = 1000 * (3 - retryCount + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retryCount - 1);
      }

      throw new Error(errorJson.error?.message || "Failed to fetch NFTs");
    }

    return response;
  } catch (error) {
    if (retryCount > 0) {
      const delay = 1000 * (3 - retryCount + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount - 1);
    }
    throw error;
  }
}

export async function getNFTCollections(
  ownerAddress: string,
  chainId: number,
): Promise<NFTCollection[]> {
  try {
    const nfts = await getNFTsForOwner(ownerAddress, chainId);

    // Group NFTs by contract address
    const collections = nfts.reduce((acc, nft) => {
      const collection = acc.get(nft.tokenAddress) || {
        address: nft.tokenAddress,
        name: nft.name.split('#')[0].trim(), // Use the name before '#' as collection name
        nfts: [],
        totalNFTs: 0,
        chainId
      };

      collection.nfts.push(nft);
      collection.totalNFTs++;

      acc.set(nft.tokenAddress, collection);
      return acc;
    }, new Map<string, NFTCollection>());

    return Array.from(collections.values());
  } catch (error) {
    console.error("Error fetching NFT collections:", error);
    throw error;
  }
}

export async function getNFTsForOwner(
  ownerAddress: string,
  chainId: number,
): Promise<NFT[]> {
  try {
    // Validate chain ID before proceeding
    if (!isChainSupported(chainId)) {
      throw new Error(`Chain ID ${chainId} is not supported`);
    }

    const baseUrl = getAlchemyBaseUrl(chainId);
    const url = new URL(`${baseUrl}/getNFTsForOwner`);
    url.searchParams.append("owner", ownerAddress);
    url.searchParams.append("withMetadata", "true");
    // url.searchParams.append("contractAddresses[]", networks[chainId].nftContractAddress);

    const response = await fetchWithRetry(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();
    // Transform and log each NFT's data
    return data.ownedNfts.map((nft: any) => {
      // Get the best available image URL
      let imageUrl = "";

      // Try different possible image locations in order of preference
      if (nft.image?.cachedUrl) {
        imageUrl = nft.image.cachedUrl;
      } else if (nft.image?.thumbnailUrl) {
        imageUrl = nft.image.thumbnailUrl;
      } else if (nft.media?.[0]?.gateway) {
        imageUrl = nft.media[0].gateway;
      } else if (nft.rawMetadata?.image) {
        imageUrl = nft.rawMetadata.image;
      }

      const mappedNFT = {
        tokenId: nft.id.tokenId,
        name: nft.name || nft.title || `NFT #${nft.tokenId}`,
        description:
          nft.description ||
          nft.rawMetadata?.description ||
          "No description available",
        image: sanitizeImageUrl(imageUrl),
        tokenType: nft.contractMetadata.tokenType,
        tokenAddress: nft.contract.address,
      };

      return mappedNFT;
    });
  } catch (error) {
    console.error("Error fetching NFTs from Alchemy:", error);
    throw error;
  }
}

const alchemyService = {
  getNFTsForOwner,
  getNFTCollections,
};

export default alchemyService;