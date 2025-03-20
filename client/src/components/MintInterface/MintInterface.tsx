import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNFTMint } from "@/hooks/useNFTMint";
import { useToast } from "@/hooks/use-toast";
import { useBurns } from "@/hooks/useBurns";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CollectionMint } from "./CollectionMint";
import { TokenConfigTable } from "./TokenConfigTable";

// Hardcoded values for now
const COLLECTION_ID = "2DBt6gXTtwNMBkllG3qoKf8xwBKx";
const TOKEN_ID = "1";
const TOKEN_ADDRESS = "0xF86a582D544cbB50B2EFf695F20862E030d916C6";

export function MintInterface() {
  const { mint, isLoading } = useNFTMint();
  const { toast } = useToast();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { burns } = useBurns({ walletAddress: address as Address });

  const mintableCount = burns?.items?.filter(burn => !burn.used).length || 0;

  const handleMint = async () => {
    try {
      const response = await mint({ 
        collectionId: COLLECTION_ID, 
        tokenId: TOKEN_ID,
        quantity: 1 
      });

      // Invalidate and refetch burns query
      await queryClient.invalidateQueries({ queryKey: ["burns"] });

      // Show success toast with tx hash
      toast({
        title: "NFT Minted Successfully",
        description: `Transaction Hash: ${response.mintTxs[0]?.slice(0, 10)}...`,
      });
    } catch (error) {
      console.error("Mint error:", error);
      toast({
        variant: "destructive",
        title: "Mint Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <div className="space-y-8">
      <CollectionMint />
      <TokenConfigTable />
    </div>
  );
}