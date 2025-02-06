import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNFTMint } from "@/hooks/useNFTMint";
import { useToast } from "@/hooks/use-toast";

// Hardcoded values for now
const COLLECTION_ID = "pNGsZiV5MZlIVMBHBw9LlVPPuhlJ";
const TOKEN_ID = "1";
const TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890";

export function MintInterface() {
  const { mint, isLoading } = useNFTMint();
  const { toast } = useToast();

  const handleMint = async () => {
    try {
      await mint({ 
        collectionId: COLLECTION_ID, 
        tokenId: TOKEN_ID,
        quantity: 1 
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
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Minting..." : "Mint NFT"}
        </Button>
      </CardContent>
    </Card>
  );
}
