import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTokenConfigs } from "@/hooks/useTokenConfigs";
import { mintNFT } from "@/services/nftMinting";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { getPublicClient, getCurrentChain, formatNativeCurrency, getExplorerTxUrl } from "@/services/web3";

export function TokenConfigTable() {
  const { data: tokenConfigs, isLoading: isLoadingConfigs } = useTokenConfigs();
  const { toast } = useToast();
  const [mintingTokenId, setMintingTokenId] = useState<string | null>(null);

  const handleMint = async (tokenId: bigint) => {
    try {
      setMintingTokenId(tokenId.toString());

      const chain = await getCurrentChain();
      const hash = await mintNFT({
        chain,
        tokenId,
        amount: BigInt(1),
      });

      const explorerUrl = getExplorerTxUrl(chain.id, hash);

      toast({
        title: "NFT Minting Started",
        description: (
          <span>
            Transaction hash:{" "}
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-blue-500 hover:text-blue-700"
            >
              {hash.slice(0, 10)}...
            </a>
          </span>
        ),
      });

      // Wait for transaction confirmation using Viem
      const publicClient = await getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60_000,
      });

      if (receipt.status === "success") {
        toast({
          title: "NFT Minted Successfully",
          description: "Your NFT has been minted!",
          variant: "default",
        });
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Minting error:", error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint NFT",
        variant: "destructive",
      });
    } finally {
      setMintingTokenId(null);
    }
  };

  return (
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
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
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
                    {formatNativeCurrency(config.chainId, config.price)}
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
                  <TableCell>
                    <Button
                      onClick={() => handleMint(config.tokenId)}
                      disabled={
                        !config.active || 
                        mintingTokenId === config.tokenId.toString()
                      }
                      variant="secondary"
                      size="sm"
                    >
                      {mintingTokenId === config.tokenId.toString() ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        "Mint"
                      )}
                    </Button>
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
  );
}