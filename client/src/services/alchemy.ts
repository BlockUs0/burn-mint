import { NFT } from '@/types';

const ALCHEMY_BASE_URL = 'https://eth-mainnet.g.alchemy.com/v2';
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

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
      throw new Error('Failed to fetch NFTs from Alchemy');
    }

    const data = await response.json();
    
    // Transform Alchemy response to our NFT type
    return data.ownedNfts.map((nft: any) => ({
      tokenId: nft.id.tokenId,
      name: nft.title || 'Unnamed NFT',
      description: nft.description || 'No description available',
      image: nft.media[0]?.gateway || nft.metadata?.image || '',
    }));
  } catch (error) {
    console.error('Error fetching NFTs from Alchemy:', error);
    throw error;
  }
}
