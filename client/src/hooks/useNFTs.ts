import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { useQuery } from '@tanstack/react-query';
import { NFT } from '@/types';
import nftService from '@/services/web3';

export function useNFTs() {
  const { address, status } = useWallet();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);

  const { data: nfts = [], isLoading, error } = useQuery({
    queryKey: ['nfts', address],
    queryFn: () => nftService.getNFTs(address!),
    enabled: status === 'connected' && !!address,
    retry: 2,
  });

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