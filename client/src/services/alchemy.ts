import { NFT } from '@/types';

const ALCHEMY_BASE_URL = 'https://eth-mainnet.g.alchemy.com/nft/v3';
const ALCHEMY_API_KEY = 'Eb5YzZMR9-i55viNBnAvUpwN11ko7YR3';
const NFT_CONTRACT_ADDRESS = '0x85be9de7a369850a964616a2c04d79000d168dea';

const RETRY_COUNT = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

function sanitizeImageUrl(url: string): string {
  if (!url) return '';
  // Handle IPFS URLs
  if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
  // Handle relative URLs by making them absolute
  if (url.startsWith('/')) {
    return `https://nft-cdn.alchemy.com${url}`;
  }
  return url;
}

async function fetchWithRetry(url: string, options: RequestInit, retryCount = RETRY_COUNT): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText);

      // Check if it's a rate limit error
      if (errorJson.error?.message?.includes('rate limits') && retryCount > 0) {
        // Calculate delay with exponential backoff
        const delay = INITIAL_RETRY_DELAY * (RETRY_COUNT - retryCount + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retryCount - 1);
      }

      throw new Error(errorJson.error?.message || 'Failed to fetch NFTs');
    }

    return response;
  } catch (error) {
    if (retryCount > 0) {
      const delay = INITIAL_RETRY_DELAY * (RETRY_COUNT - retryCount + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retryCount - 1);
    }
    throw error;
  }
}

export async function getNFTsForOwner(ownerAddress: string): Promise<NFT[]> {
  try {
    const url = new URL(`${ALCHEMY_BASE_URL}/${ALCHEMY_API_KEY}/getNFTsForOwner`);
    url.searchParams.append('owner', ownerAddress);
    url.searchParams.append('withMetadata', 'true');
    url.searchParams.append('contractAddresses[]', NFT_CONTRACT_ADDRESS);

    const response = await fetchWithRetry(
      url.toString(),
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    const data = await response.json();

    // Log the full response structure
    console.log('Full Alchemy response:', JSON.stringify(data, null, 2));

    // Transform and log each NFT's data
    return data.ownedNfts.map((nft: any) => {
      console.log('Processing NFT:', {
        id: nft.tokenId,
        title: nft.title,
        rawName: nft.rawMetadata?.name,
        image: {
          media: nft.media?.[0]?.gateway,
          rawImage: nft.rawMetadata?.image,
          tokenUri: nft.tokenUri?.gateway,
          raw: nft.rawMetadata
        }
      });

      // Get the best available image URL
      let imageUrl = '';

      // Try different possible image locations in order of preference
      if (nft.media?.[0]?.gateway) {
        imageUrl = nft.media[0].gateway;
      } else if (nft.rawMetadata?.image) {
        imageUrl = nft.rawMetadata.image;
      } else if (nft.tokenUri?.gateway) {
        imageUrl = nft.tokenUri.gateway;
      } else if (typeof nft.rawMetadata?.image_url === 'string') {
        imageUrl = nft.rawMetadata.image_url;
      }

      const mappedNFT = {
        tokenId: nft.tokenId,
        name: nft.title || nft.rawMetadata?.name || `NFT #${nft.tokenId}`,
        description: nft.description || nft.rawMetadata?.description || 'No description available',
        image: sanitizeImageUrl(imageUrl),
      };

      console.log('Mapped NFT:', mappedNFT);
      return mappedNFT;
    });
  } catch (error) {
    console.error('Error fetching NFTs from Alchemy:', error);
    throw error;
  }
}

// Create and export default instance for consistency
const alchemyService = {
  getNFTsForOwner
};

export default alchemyService;