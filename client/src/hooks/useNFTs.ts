import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import { useQuery } from '@tanstack/react-query';
import { NFT } from '@/types';
import { getNFTs } from '@/services/web3';

export function useNFTs() {
  const { address, status } = useWallet();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);

  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ['nfts', address],
    queryFn: () => getNFTs(address!),
    enabled: status === 'connected' && !!address,
  });

  useEffect(() => {
    if (status !== 'connected') {
      setSelectedNFT(null);
    }
  }, [status]);

  return {
    nfts,
    loading: isLoading,
    selectedNFT,
    selectNFT: setSelectedNFT
  };
}
