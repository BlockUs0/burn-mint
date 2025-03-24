import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import { useQuery } from "@tanstack/react-query";
import alchemyService from "@/services/alchemy";
import nftService from "@/services/web3";
import { useToast } from "@/hooks/use-toast";
import { useNetwork } from "@/lib/web3Provider";
import { useAuth } from "@/context/AuthContext";
import { Address } from "viem";

export function useNFTs() {
  const { address, status } = useWallet();
  const { chain } = useNetwork();
  const { isAuthenticated, refreshSession } = useAuth();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set());
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);
  const [showNFTGrid, setShowNFTGrid] = useState(false);
  const { toast } = useToast();

  const {
    data: collections = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["collections", address, chain?.id],
    queryFn: async () => {
      try {
        if (!address) throw new Error("No wallet connected");
        if (!chain?.id) throw new Error("No chain selected");
        if (!isAuthenticated) throw new Error("Not authenticated");

        // Refresh the session on API calls
        refreshSession();
        
        return alchemyService.getNFTCollections(address, chain.id);
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast({
          variant: "destructive",
          title: "Failed to fetch NFT collections",
          description: (error as Error).message,
        });
        return [];
      }
    },
    enabled: status === "connected" && !!address && !!chain?.id && isAuthenticated,
    retry: 1,
    staleTime: 30000,
  });

  const checkApproval = useCallback(async () => {
    if (!address || !selectedCollection || !chain?.id) return;

    try {
      // Refresh the session on API calls
      refreshSession();
      
      const isApproved = await nftService.isApprovedForAll(
        address as Address,
        selectedCollection as `0x${string}`,
      );
      setIsApprovedForAll(isApproved);
      return isApproved;
    } catch (error) {
      setIsApprovedForAll(false);
      toast({
        variant: "destructive",
        title: "Error checking approval status",
        description: "Please try selecting the collection again",
      });
      return false;
    }
  }, [address, selectedCollection, chain?.id, toast, refreshSession]);

  useEffect(() => {
    if (status !== "connected" || !isAuthenticated) {
      setSelectedCollection(null);
      setSelectedNFTs(new Set());
      // setIsApprovedForAll(false);
      // setShowNFTGrid(false);
    }
  }, [status, isAuthenticated]);

  useEffect(() => {
    checkApproval();
  }, [checkApproval]);

  const selectCollection = useCallback(
    (address: string) => {
      // Refresh the session on user interactions
      refreshSession();
      
      setShowNFTGrid(false);
      if (address === "") {
        setSelectedCollection(null);
      } else {
        setSelectedCollection(address);
        setSelectedNFTs(new Set());
        checkApproval();
      }
      console.log("Collection selected:", address);
    },
    [checkApproval, refreshSession],
  );

  const viewCollection = useCallback(async () => {
    // Refresh the session on user interactions
    refreshSession();
    
    if (!isApprovedForAll || !selectedCollection) {
      console.log(
        "Cannot view collection - not approved or no collection selected",
      );
      return;
    }

    try {
      setShowNFTGrid(true);
    } catch (error) {
      console.error("Error in viewCollection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to view collection",
      });
    }
  }, [isApprovedForAll, selectedCollection, toast, refreshSession]);

  const toggleNFTSelection = useCallback((tokenId: string) => {
    // Refresh the session on user interactions
    refreshSession();
    
    setSelectedNFTs((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(tokenId)) {
        newSelection.delete(tokenId);
      } else {
        newSelection.add(tokenId);
      }
      return newSelection;
    });
  }, [refreshSession]);

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
    setShowNFTGrid,
  };
}