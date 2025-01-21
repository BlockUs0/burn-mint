import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { useQuery } from '@tanstack/react-query';
import { NFT } from '@/types';
import alchemyService from '@/services/alchemy';
import { useToast } from '@/hooks/use-toast';
import { useNetwork } from '@/lib/web3Provider';

export function useNFTs() {
  const { address, status } = useWallet();
  const { chain } = useNetwork();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem('auth_token');

  const { data: nfts = [], isLoading: loading, error } = useQuery({
    queryKey: ['nfts', address, chain?.id],
    queryFn: async () => {
      try {
        if (!address) throw new Error('No wallet connected');
        if (!chain?.id) throw new Error('No chain selected');
        if (!isAuthenticated) throw new Error('Not authenticated');

        const fetchedNFTs = await alchemyService.getNFTsForOwner(address, chain.id);

        return fetchedNFTs
          .filter(nft => nft && nft.tokenId)
          .map(nft => ({
            ...nft,
            tokenId: nft.tokenId.toString(),
            name: nft.name || `NFT #${nft.tokenId}`,
            description: nft.description || 'No description available',
            image: nft.image || 'https://placehold.co/200x200/orange/white?text=NFT'
          }));
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        toast({
          variant: "destructive",
          title: "Failed to fetch NFTs",
          description: (error as Error).message
        });
        return [];
      }
    },
    enabled: status === 'connected' && !!address && !!chain?.id && isAuthenticated,
    retry: 1,
    staleTime: 30000,
  });

  // Reset selection when wallet disconnects or auth status changes
  useEffect(() => {
    if (status !== 'connected' || !isAuthenticated) {
      setSelectedNFT(null);
    }
  }, [status, isAuthenticated]);

  const selectNFT = (tokenId: string) => {
    setSelectedNFT(prev => prev === tokenId ? null : tokenId);
  };

  return {
    nfts,
    loading,
    error,
    selectedNFT,
    selectNFT
  };
}