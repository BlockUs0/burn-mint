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

  const { data: collections = [], isLoading: loading, error, refetch } = useQuery({
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

  // Check approval status whenever collection changes
  const checkApproval = useCallback(async () => {
    if (!address || !selectedCollection || !chain?.id) return;

    try {
      console.log('Checking approval for:', selectedCollection);
      const isApproved = await nftService.isApprovedForAll(
        address,
        selectedCollection as `0x${string}`
      );
      console.log('Approval status:', isApproved);
      setIsApprovedForAll(isApproved);
      return isApproved;
    } catch (error) {
      console.error('Error checking approval:', error);
      setIsApprovedForAll(false);
      toast({
        variant: "destructive",
        title: "Error checking approval status",
        description: "Please try selecting the collection again"
      });
      return false;
    }
  }, [address, selectedCollection, chain?.id, toast]);

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
    checkApproval();
  }, [checkApproval]);

  const selectCollection = useCallback((address: string) => {
    setShowNFTGrid(false); // Always reset grid view when selecting new collection
    if (address === '') {
      setSelectedCollection(null);
    } else {
      setSelectedCollection(address);
      setSelectedNFTs(new Set());
      // Force approval check when selecting new collection
      setTimeout(() => checkApproval(), 500);
    }
    console.log('Collection selected:', address);
  }, [checkApproval]);

  const viewCollection = useCallback(async () => {
    console.log('View Collection triggered', { isApprovedForAll, selectedCollection });
    if (!isApprovedForAll || !selectedCollection) {
      console.log('Cannot view collection - not approved or no collection selected');
      return;
    }

    try {
      // Double check approval before showing grid
      const currentlyApproved = await checkApproval();
      if (currentlyApproved) {
        console.log('Collection approved, showing NFT grid');
        // Force state update
        setShowNFTGrid(false);
        setTimeout(() => {
          setShowNFTGrid(true);
          console.log('NFT grid visibility updated');
        }, 0);
      } else {
        console.log('Collection not approved');
        toast({
          variant: "destructive",
          title: "Collection not approved",
          description: "Please approve the collection first"
        });
      }
    } catch (error) {
      console.error('Error in viewCollection:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to view collection"
      });
    }
  }, [isApprovedForAll, selectedCollection, checkApproval, toast]);

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
    checkApproval,
    showNFTGrid,
    viewCollection,
    setShowNFTGrid
  };
}