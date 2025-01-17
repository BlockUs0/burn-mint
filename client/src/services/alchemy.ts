import { NFT } from '@/types';

const ALCHEMY_BASE_URL = 'https://eth-mainnet.g.alchemy.com/nft/v3';
const ALCHEMY_API_KEY = 'Eb5YzZMR9-i55viNBnAvUpwN11ko7YR3';

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

    // Transform Alchemy response to our NFT type
    return data.ownedNfts.map((nft: any) => ({
      tokenId: nft.tokenId?.tokenId || nft.tokenId,
      name: nft.title || nft.name || 'Unnamed NFT',
      description: nft.description || 'No description available',
      image: nft.media?.[0]?.gateway || nft.rawMetadata?.image || '',
    }));
  } catch (error) {
    console.error('Error fetching NFTs from Alchemy:', error);
    throw error;
  }
}