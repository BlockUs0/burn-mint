import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import { useQuery } from "@tanstack/react-query";
import alchemyService from "@/services/alchemy";
import nftService from "@/services/web3";
import { useToast } from "@/hooks/use-toast";
import { useNetwork } from "@/lib/web3Provider";
import { Address } from "viem";

export function useNFTs() {
  const { address, status } = useWallet();
  const { chain } = useNetwork();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set());
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);
  const [showNFTGrid, setShowNFTGrid] = useState(false);
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem("auth_token");

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
    enabled:
      status === "connected" && !!address && !!chain?.id && isAuthenticated,
    retry: 1,
    staleTime: 30000,
  });

  const checkApproval = useCallback(async () => {
    if (!address || !selectedCollection || !chain?.id) return;

    try {
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
  }, [address, selectedCollection, chain?.id, toast]);

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
    [checkApproval],
  );

  const viewCollection = useCallback(async () => {
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
  }, [isApprovedForAll, selectedCollection, checkApproval, toast]);

  const toggleNFTSelection = useCallback((tokenId: string) => {
    setSelectedNFTs((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(tokenId)) {
        newSelection.delete(tokenId);
      } else {
        newSelection.add(tokenId);
      }
      return newSelection;
    });
  }, []);

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
