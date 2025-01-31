import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useQuery } from '@tanstack/react-query';
import { NFT, NFTCollection } from '@/types';
import alchemyService from '@/services/alchemy';
import nftService from '@/services/web3';
import { useToast } from '@/hooks/use-toast';
import { useNetwork } from '@/lib/web3Provider';

export function useNFTs() {
  const { address, status } = useWallet();
  const { chain } = useNetwork();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set());
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);
  const [showNFTGrid, setShowNFTGrid] = useState(false);
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem('auth_token');

  const { data: collections = [], isLoading: loading, error } = useQuery({
    queryKey: ['collections', address, chain?.id],
    queryFn: async () => {
      try {
        if (!address) throw new Error('No wallet connected');
        if (!chain?.id) throw new Error('No chain selected');
        if (!isAuthenticated) throw new Error('Not authenticated');

        return alchemyService.getNFTCollections(address, chain.id);
      } catch (error) {
        console.error('Error fetching collections:', error);
        toast({
          variant: "destructive",
          title: "Failed to fetch NFT collections",
          description: (error as Error).message
        });
        return [];
      }
    },
    enabled: status === 'connected' && !!address && !!chain?.id && isAuthenticated,
    retry: 1,
    staleTime: 30000,
  });

  // Reset selections when wallet disconnects or auth status changes
  useEffect(() => {
    if (status !== 'connected' || !isAuthenticated) {
      setSelectedCollection(null);
      setSelectedNFTs(new Set());
      setIsApprovedForAll(false);
      setShowNFTGrid(false);
    }
  }, [status, isAuthenticated]);

  // Check approval status whenever collection changes
  useEffect(() => {
    async function checkApproval() {
      if (!address || !selectedCollection || !chain?.id) return;

      try {
        const isApproved = await nftService.isApprovedForAll(
          address,
          selectedCollection as `0x${string}`
        );
        setIsApprovedForAll(isApproved);
      } catch (error) {
        console.error('Error checking approval:', error);
        setIsApprovedForAll(false);
      }
    }

    checkApproval();
  }, [selectedCollection, address, chain?.id]);

  const selectCollection = useCallback((address: string) => {
    if (address === '') {
      setSelectedCollection(null);
      setShowNFTGrid(false);
    } else {
      setSelectedCollection(address);
      setSelectedNFTs(new Set());
      setShowNFTGrid(false);
    }
    console.log('Collection selected:', address);
  }, []);

  const viewCollection = useCallback(() => {
    console.log('View Collection triggered', { isApprovedForAll, selectedCollection });
    if (isApprovedForAll && selectedCollection) {
      setShowNFTGrid(true);
      console.log('Showing NFT grid');
    }
  }, [isApprovedForAll, selectedCollection]);

  const toggleNFTSelection = useCallback((tokenId: string) => {
    setSelectedNFTs(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tokenId)) {
        newSelection.delete(tokenId);
      } else {
        newSelection.add(tokenId);
      }
      return newSelection;
    });
  }, []);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('State updated:', { 
      showNFTGrid, 
      selectedCollection, 
      isApprovedForAll,
      selectedNFTsCount: selectedNFTs.size 
    });
  }, [showNFTGrid, selectedCollection, isApprovedForAll, selectedNFTs]);

  return {
    collections,
    loading,
    error,
    selectedCollection,
    selectCollection,
    selectedNFTs,
    toggleNFTSelection,
    isApprovedForAll,
    showNFTGrid,
    viewCollection,
    setShowNFTGrid
  };
}