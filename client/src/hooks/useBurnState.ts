import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { BurnState } from "@/types";
import nftService from "@/services/web3";
import { registerBurn } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { type Address, hexToNumber } from "viem";
import { getPublicClient } from "@/services/web3";
import { useBurns } from "./useBurns";

export function useBurnState() {
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
      tokenId,
      tokenAddress,
      walletAddress,
    }: {
      tokenId: string;
      tokenAddress: Address;
      walletAddress: Address;
    }) => {
      setState((prev) => ({ ...prev, status: "burning" }));

      try {
        const txHash = await nftService.burnNFT(
          tokenAddress,
          hexToNumber(tokenId).toString(),
        );

        const publicClient = await getPublicClient();
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          timeout: 60_000,
        });

        if (receipt.status !== "success") {
          throw new Error("Could not burn NFT");
        }

        await registerBurn({ tokenId, txHash, tokenAddress, walletAddress });
        await refetchBurns();

        setState((prev) => ({
          status: "completed",
          burnCount: prev.burnCount + 1,
          canMint: prev.burnCount + 1 >= 2,
        }));

        toast({
          title: "NFT Burned Successfully",
          description: "Your NFT has been transformed into pure energy",
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