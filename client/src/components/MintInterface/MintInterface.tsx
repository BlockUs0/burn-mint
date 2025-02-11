import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNFTMint } from "@/hooks/useNFTMint";
import { useToast } from "@/hooks/use-toast";
import { useBurns } from "@/hooks/useBurns";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";

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
        description: `Transaction Hash: ${response.transactionHash?.slice(0, 10)}...`,
        title: "NFT Minted Successfully",
        description: "Your new NFT has been minted!",
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Mint NFT</CardTitle>
        <CardDescription>
          Mint your NFT from the collection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <span className="text-sm font-medium">Available Mints: </span>
          <span className="text-lg font-bold text-orange-500">{mintableCount}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Token ID</label>
            <p className="text-lg font-mono">{TOKEN_ID}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Contract Address</label>
            <p className="text-sm font-mono break-all">{TOKEN_ADDRESS}</p>
          </div>
        </div>
        <Button 
          onClick={handleMint} 
          disabled={isLoading || mintableCount === 0}
          className="w-full"
        >
          {isLoading ? "Minting..." : "Mint NFT"}
        </Button>
      </CardContent>
    </Card>
  );
}
