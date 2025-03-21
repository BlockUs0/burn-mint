import { NFT, NFTCollection } from "@/types";
import {
  networks,
  isChainSupported,
} from "@/config/networks";

import { API_CONFIG } from "@/config/api";
const ALCHEMY_API_KEY = API_CONFIG.ALCHEMY_KEY;

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

async function getAllNFTPages(baseUrl: string, owner: string, chainId: number): Promise<NFT[]> {
  const pageSize = 100;
  let allNFTs: NFT[] = [];
  let pageKey = "";

  do {
    const url = new URL(`${baseUrl}/getNFTsForOwner`);
    url.searchParams.append("owner", owner);
    url.searchParams.append("withMetadata", "true");
    url.searchParams.append("pageSize", pageSize.toString());
    url.searchParams.append("refreshCache", "true");
    if (chainId === 324) { // ZKSync Era Mainnet
      url.searchParams.append("contractAddresses[]", "0xc880a0e89fe281bb95f8835c3512b7fb863ec8f3");
    }
    if (pageKey) {
      url.searchParams.append("pageKey", pageKey);
    }

    const response = await fetchWithRetry(url.toString(), {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache", // Prevent browser caching
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

    console.log("Current page NFTs count:", nfts.length);
    console.log("Total NFTs collected so far:", allNFTs.length);
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
    const nfts = await getAllNFTPages(baseUrl, ownerAddress, chainId);
    
    return nfts;
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
    const collections = nfts.reduce((acc, nft) => {
      console.log("Processing NFT for collection:", {
        tokenId: nft.tokenId,
        tokenAddress: nft.tokenAddress,
        name: nft.name,
      });

      const collection = acc.get(nft.tokenAddress) || {
        address: nft.tokenAddress,
        name: nft.name.split("#")[0].trim(),
        nfts: [],
        totalNFTs: 0,
        chainId,
      };

      collection.nfts.push(nft);
      collection.totalNFTs = collection.nfts.length;

      acc.set(nft.tokenAddress, collection);
      return acc;
    }, new Map<string, NFTCollection>());

    const result = Array.from(collections.values());
    console.log(
      "Final collections:",
      result.map((collection) => ({
        address: collection.address,
        name: collection.name,
        totalNFTs: collection.totalNFTs,
        nftIds: collection.nfts.map((nft) => nft.tokenId),
      })),
    );

    return result;
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