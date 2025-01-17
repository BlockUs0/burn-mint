import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { useQuery } from '@tanstack/react-query';
import { NFT } from '@/types';
import { getNFTsForOwner } from '@/services/alchemy';
import { useToast } from '@/hooks/use-toast';

export function useNFTs() {
  const { address, status } = useWallet();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: nfts = [], isLoading: loading, error } = useQuery({
    queryKey: ['nfts', address],
    queryFn: async () => {
      try {
        if (!address) throw new Error('No wallet connected');
        return await getNFTsForOwner(address);
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
    enabled: status === 'connected' && !!address,
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Reset selection when wallet disconnects
  useEffect(() => {
    if (status !== 'connected') {
      setSelectedNFT(null);
    }
  }, [status]);

  return {
    nfts,
    loading,
    error,
    selectedNFT,
    selectNFT: setSelectedNFT
  };
}