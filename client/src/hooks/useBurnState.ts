import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BurnState } from "@/types";
import nftService from "@/services/web3";
import { registerBurn } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { type Address } from "viem";
import { getPublicClient } from "@/services/web3";
import { useBurns } from "./useBurns";

export function useBurnState() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<BurnState>({
    status: "idle",
    burnCount: 0,
    canMint: false,
  });
  const { toast } = useToast();
  const { address } = useAccount();
  const { refetch: refetchBurns } = useBurns({ 
    walletAddress: address as Address,
    limit: 10 
  });

  const { mutate: burn } = useMutation({
    mutationFn: async ({
      tokenIds,
      tokenAddress,
      walletAddress,
    }: {
      tokenIds: string[];
      tokenAddress: Address;
      walletAddress: Address;
    }) => {
      setState((prev) => ({ ...prev, status: "burning" }));

      try {
        // Use batch burn functionality from web3 service
        const txHash = await nftService.batchBurnNFTs(tokenAddress, tokenIds);

        const publicClient = await getPublicClient();
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          timeout: 60_000,
        });

        if (receipt.status !== "success") {
          throw new Error("Transaction failed");
        }

        // Register the burn with our backend
        await registerBurn({ 
          tokenIds,
          txHash, 
          tokenAddress, 
          walletAddress 
        });

        // Refresh burn history and invalidate all burn-related queries
        queryClient.invalidateQueries({ queryKey: ["burns"] });
        await refetchBurns();

        setState((prev) => ({
          status: "completed",
          burnCount: prev.burnCount + tokenIds.length,
          canMint: prev.burnCount + tokenIds.length >= 2,
        }));

        toast({
          title: tokenIds.length > 1 ? "NFTs Burned Successfully" : "NFT Burned Successfully",
          description: `${tokenIds.length} NFT${tokenIds.length > 1 ? 's' : ''} transformed into pure energy`,
        });
      } catch (error) {
        setState((prev) => ({ ...prev, status: "error" }));
        toast({
          variant: "destructive",
          title: "Error burning NFT",
          description: (error as Error).message,
        });
        throw error;
      }
    },
  });

  return {
    ...state,
    burn,
  };
}