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
import { useState, useEffect } from "react";
import { getPublicClient, getCurrentChain, formatNativeCurrency, getExplorerTxUrl, NETWORK_CONFIG } from "@/services/web3";
import { useAccount, useChainId } from "wagmi";
import { getMintSignature } from "@/services/api";

export function TokenConfigTable() {
  const chainId = useChainId();
  const { data: tokenConfigs, isLoading: isLoadingConfigs } = useTokenConfigs();
  const { toast } = useToast();
  const [mintingTokenId, setMintingTokenId] = useState<string | null>(null);
  const [currentChain, setCurrentChain] = useState<number | null>(null);

  // Update current chain when network changes
  useEffect(() => {
    if (chainId) {
      setCurrentChain(chainId);
    } else {
      getCurrentChain().then(chain => setCurrentChain(chain.id));
    }
  }, [chainId]);

  const handleMint = async (tokenId: bigint) => {
    try {
      setMintingTokenId(tokenId.toString());

      const chain = await getCurrentChain();
      const config = tokenConfigs?.find(c => c.tokenId === tokenId);

      if (!config) {
        throw new Error("Token configuration not found");
      }

      let signature = "0x"; // Default empty signature

      if (config.allowlistRequired) {
        try {
          const { address } = useAccount();
          if (!address) {
            throw new Error("Wallet not connected");
          }

          const signatureResponse = await getMintSignature({
            collectionId: "2DBt6gXTtwNMBkllG3qoKf8xwBKx", // TODO: Make this dynamic
            tokenId: tokenId.toString(),
            walletAddress: address,
            chainId: chain.id,
            contractAddress: NETWORK_CONFIG[chain.id]?.contractAddress || "",
            quantity: 1,
          });

          signature = signatureResponse.signature;
        } catch (error) {
          console.error("Failed to get mint signature:", error);
          toast({
            title: "Minting Not Allowed",
            description: "You are not allowlisted for this token",
            variant: "destructive",
          });
          return;
        }
      }

      const hash = await mintNFT({
        chain,
        tokenId,
        amount: BigInt(1),
        signature, // Pass the signature to the mint function
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

  const networkName = currentChain ? NETWORK_CONFIG[currentChain]?.name : "Unknown Network";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Available Token Types</CardTitle>
        <CardDescription>
          Current token configurations on {networkName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingConfigs || !currentChain ? (
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
                <TableHead>Access</TableHead>
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
                    {currentChain && formatNativeCurrency(currentChain, config.price)}
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
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      config.allowlistRequired 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {config.allowlistRequired ? "Allowlisted" : "Public"}
                    </span>
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