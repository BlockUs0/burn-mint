import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { arbitrum } from 'viem/chains';
import { NFT } from '@/types';

const NFT_CONTRACT_ADDRESS = '0x...'; // Replace with actual contract address

export const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http()
});

export function getWalletClient() {
  if (!window.ethereum) throw new Error('No wallet detected');
  
  return createWalletClient({
    chain: arbitrum,
    transport: custom(window.ethereum)
  });
}

export async function getNFTs(address: string): Promise<NFT[]> {
  const walletClient = getWalletClient();
  
  // Replace with actual contract call to fetch NFTs
  const tokenIds = await publicClient.readContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: [], // Add contract ABI
    functionName: 'tokensOfOwner',
    args: [address]
  });

  // Fetch metadata for each token
  const nfts = await Promise.all(
    tokenIds.map(async (tokenId) => {
      const uri = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: [], // Add contract ABI
        functionName: 'tokenURI',
        args: [tokenId]
      });

      const response = await fetch(uri);
      const metadata = await response.json();

      return {
        tokenId: tokenId.toString(),
        name: metadata.name,
        description: metadata.description,
        image: metadata.image
      };
    })
  );

  return nfts;
}

export async function burnNFT(tokenId: string): Promise<string> {
  const walletClient = getWalletClient();
  
  const hash = await walletClient.writeContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: [], // Add contract ABI
    functionName: 'burn',
    args: [tokenId]
  });

  return hash;
}
