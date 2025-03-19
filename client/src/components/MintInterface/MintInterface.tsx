import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNFTMint } from "@/hooks/useNFTMint";
import { useTokenConfigs } from "@/hooks/useTokenConfigs";
import { useToast } from "@/hooks/use-toast";
import { useBurns } from "@/hooks/useBurns";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Hardcoded values for now
const COLLECTION_ID = "2DBt6gXTtwNMBkllG3qoKf8xwBKx";
const TOKEN_ID = "1";
const TOKEN_ADDRESS = "0xF86a582D544cbB50B2EFf695F20862E030d916C6";

export function MintInterface() {
  const { mint, isLoading } = useNFTMint();
  const { data: tokenConfigs, isLoading: isLoadingConfigs } = useTokenConfigs();
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
            <div className="flex items-center justify-center w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Minting...</span>
                </>
              ) : (
                "Mint NFT"
              )}
            </div>
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Available Token Types</CardTitle>
          <CardDescription>
            Current token configurations in the contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingConfigs ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : tokenConfigs && tokenConfigs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Max Supply</TableHead>
                  <TableHead>Price (ETH)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokenConfigs.map((config) => (
                  <TableRow key={config.tokenId.toString()}>
                    <TableCell className="font-mono">
                      {config.tokenId.toString()}
                    </TableCell>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>
                      {config.maxSupply === BigInt(0) 
                        ? "Unlimited" 
                        : config.maxSupply.toString()}
                    </TableCell>
                    <TableCell>
                      {(Number(config.price) / 1e18).toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        config.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {config.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {config.soulbound ? "Soulbound" : "Transferable"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No token configurations found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}