import { NFT } from '@/types';

const ALCHEMY_BASE_URL = 'https://eth-mainnet.g.alchemy.com/nft/v3';
const ALCHEMY_API_KEY = 'Eb5YzZMR9-i55viNBnAvUpwN11ko7YR3';

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

export async function getNFTsForOwner(ownerAddress: string): Promise<NFT[]> {
  try {
    const response = await fetch(
      `${ALCHEMY_BASE_URL}/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${ownerAddress}&withMetadata=true`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Alchemy API error:', error);
      throw new Error(`Alchemy API error: ${error}`);
    }

    const data = await response.json();
    console.log('Alchemy response:', data); // For debugging

    // Transform Alchemy response to our NFT type
    return data.ownedNfts.map((nft: any) => {
      // Get the best available image URL
      let imageUrl = '';
      if (nft.media?.[0]?.gateway) {
        imageUrl = nft.media[0].gateway;
      } else if (nft.rawMetadata?.image) {
        imageUrl = nft.rawMetadata.image;
      } else if (nft.tokenUri?.gateway) {
        imageUrl = nft.tokenUri.gateway;
      }

      return {
        tokenId: nft.tokenId,
        name: nft.title || nft.rawMetadata?.name || 'Unnamed NFT',
        description: nft.description || nft.rawMetadata?.description || 'No description available',
        image: sanitizeImageUrl(imageUrl),
      };
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