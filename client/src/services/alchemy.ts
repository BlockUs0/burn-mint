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
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
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

      if (errorJson.error?.message?.includes("rate limits") && retryCount > 0) {
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

async function getAllNFTPages(baseUrl: string, owner: string): Promise<NFT[]> {
  const pageSize = 100;
  let allNFTs: NFT[] = [];
  let pageKey = "";

  do {
    const url = new URL(`${baseUrl}/getNFTsForOwner`);
    url.searchParams.append("owner", owner);
    url.searchParams.append("withMetadata", "true");
    url.searchParams.append("pageSize", pageSize.toString());
    if (pageKey) {
      url.searchParams.append("pageKey", pageKey);
    }

    const response = await fetchWithRetry(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    const nfts = data.ownedNfts.map((nft: any) => {
      let imageUrl = "";
      if (nft.image?.cachedUrl) {
        imageUrl = nft.image.cachedUrl;
      } else if (nft.image?.thumbnailUrl) {
        imageUrl = nft.image.thumbnailUrl;
      } else if (nft.media?.[0]?.gateway) {
        imageUrl = nft.media[0].gateway;
      } else if (nft.rawMetadata?.image) {
        imageUrl = nft.rawMetadata.image;
      }

      return {
        tokenId: nft.id.tokenId,
        name: nft.name || nft.title || `NFT #${nft.tokenId}`,
        description:
          nft.description ||
          nft.rawMetadata?.description ||
          "No description available",
        image: sanitizeImageUrl(imageUrl),
        tokenType: nft.contractMetadata.tokenType,
        tokenAddress: nft.contract.address,
        balance: nft.balance,
      };
    });

    allNFTs = [...allNFTs, ...nfts];
    pageKey = data.pageKey;
  } while (pageKey);

  return allNFTs;
}

export async function getNFTsForOwner(
  ownerAddress: string,
  chainId: number,
): Promise<NFT[]> {
  try {
    if (!isChainSupported(chainId)) {
      throw new Error(`Chain ID ${chainId} is not supported`);
    }

    const baseUrl = getAlchemyBaseUrl(chainId);
    return getAllNFTPages(baseUrl, ownerAddress);
  } catch (error) {
    console.error("Error fetching NFTs from Alchemy:", error);
    throw error;
  }
}

export async function getNFTCollections(
  ownerAddress: string,
  chainId: number,
): Promise<NFTCollection[]> {
  try {
    const nfts = await getNFTsForOwner(ownerAddress, chainId);
    console.log("Total NFTs fetched:", nfts.length);

    const collections = nfts.reduce((acc, nft) => {
      const collection = acc.get(nft.tokenAddress) || {
        address: nft.tokenAddress,
        name: nft.name.split('#')[0].trim(),
        nfts: new Set(), // Use Set for unique NFTs
        totalNFTs: 0,
        chainId
      };

      // Only add NFT if it's not already in the collection
      if (!Array.from(collection.nfts).some(existingNft => existingNft.tokenId === nft.tokenId)) {
        collection.nfts.add(nft);
        collection.totalNFTs = collection.nfts.size; // Update count based on actual size
      }

      acc.set(nft.tokenAddress, collection);
      return acc;
    }, new Map<string, NFTCollection>());

    // Convert Set back to Array before returning
    return Array.from(collections.values()).map(collection => ({
      ...collection,
      nfts: Array.from(collection.nfts),
      totalNFTs: collection.nfts.size
    }));
  } catch (error) {
    console.error("Error fetching NFT collections:", error);
    throw error;
  }
}

const alchemyService = {
  getNFTsForOwner,
  getNFTCollections,
};

export default alchemyService;