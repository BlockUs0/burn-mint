import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import { useQuery } from "@tanstack/react-query";
import alchemyService from "@/services/alchemy";
import nftService from "@/services/web3";
import { useToast } from "@/hooks/use-toast";
import { useNetwork } from "@/lib/web3Provider";

export function useNFTs() {
  const { address, status } = useWallet();
  const { chain } = useNetwork();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set());
  const [isApprovedForAll, setIsApprovedForAll] = useState(false);
  const [showNFTGrid, setShowNFTGrid] = useState(false);
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem("auth_token");

  const { data: collections = [], isLoading: loading, error } = useQuery({
    queryKey: ["collections", address, chain?.id],
    queryFn: async () => {
      if (!address) throw new Error("No wallet connected");
      if (!chain?.id) throw new Error("No chain selected");
      if (!isAuthenticated) throw new Error("Not authenticated");
      return alchemyService.getNFTCollections(address, chain.id);
    },
    enabled: status === "connected" && !!address && !!chain?.id && isAuthenticated,
    retry: 1,
    staleTime: 30000,
  });

  const checkApproval = useCallback(async () => {
    if (!address || !selectedCollection || !chain?.id) return false;

    try {
      const isApproved = await nftService.isApprovedForAll(
        address,
        selectedCollection as `0x${string}`,
      );
      setIsApprovedForAll(isApproved);
      return isApproved;
    } catch (error) {
      console.error("Error checking approval:", error);
      setIsApprovedForAll(false);
      return false;
    }
  }, [address, selectedCollection, chain?.id]);

  const selectCollection = useCallback((address: string) => {
    console.log("Selecting collection:", address);
    setShowNFTGrid(false);
    setSelectedCollection(address || null);
    setSelectedNFTs(new Set());
    if (address) {
      checkApproval();
    }
  }, [checkApproval]);

  const viewCollection = useCallback(async () => {
    console.log("Viewing collection...");
    if (!isApprovedForAll || !selectedCollection) {
      console.log("Cannot view - not approved or no collection");
      return;
    }

    try {
      const isApproved = await checkApproval();
      if (isApproved) {
        console.log("Setting showNFTGrid to true");
        setShowNFTGrid(true);
      } else {
        toast({
          variant: "destructive",
          title: "Collection not approved",
          description: "Please approve the collection first"
        });
      }
    } catch (error) {
      console.error("View collection error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to view collection"
      });
    }
  }, [isApprovedForAll, selectedCollection, checkApproval, toast]);

  const toggleNFTSelection = useCallback((tokenId: string) => {
    setSelectedNFTs(prev => {
      const next = new Set(prev);
      if (next.has(tokenId)) {
        next.delete(tokenId);
      } else {
        next.add(tokenId);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (status !== "connected" || !isAuthenticated) {
      setSelectedCollection(null);
      setSelectedNFTs(new Set());
      setIsApprovedForAll(false);
      setShowNFTGrid(false);
    }
  }, [status, isAuthenticated]);

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