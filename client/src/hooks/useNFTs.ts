import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { useQuery } from '@tanstack/react-query';
import { NFT } from '@/types';
import nftService from '@/services/web3';
import { useToast } from '@/hooks/use-toast';

export function useNFTs() {
  const { address, status } = useWallet();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: nfts = [], isLoading, error } = useQuery({
    queryKey: ['nfts', address],
    queryFn: async () => {
      try {
        if (!address) throw new Error('No wallet connected');
        return await nftService.getNFTs(address);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch NFTs",
          description: (error as Error).message
        });
        throw error;
      }
    },
    enabled: status === 'connected' && !!address,
    retry: 2,
  });

  // Reset selection when wallet disconnects
  useEffect(() => {
    if (status !== 'connected') {
      setSelectedNFT(null);
    }
  }, [status]);

  return {
    nfts,
    loading: isLoading,
    error,
    selectedNFT,
    selectNFT: setSelectedNFT
  };
}