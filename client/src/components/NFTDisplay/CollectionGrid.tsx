import { useNFTs } from "@/hooks/useNFTs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import nftService from "@/services/web3";
import { useToast } from "@/hooks/use-toast";

export function CollectionGrid() {
  const { 
    collections, 
    loading, 
    selectedCollection, 
    selectCollection,
    isApprovedForAll 
  } = useNFTs();
  const { toast } = useToast();

  const handleApproval = async (collectionAddress: string) => {
    try {
      await nftService.setApprovalForAll(collectionAddress as `0x${string}`);
      toast({
        title: "Approval Successful",
        description: "You can now batch burn NFTs from this collection",
      });
    } catch (error) {
      console.error('Error setting approval:', error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: (error as Error).message
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-3 text-lg text-muted-foreground">
            Fetching your NFT collections...
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={`skeleton-${i}`}
              className="h-32 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!collections?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No NFT Collections Found</h3>
        <p className="text-muted-foreground max-w-md">
          We couldn't find any NFT collections in your wallet. Make sure you're connected
          to the right network and have some NFTs.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <motion.div 
          key={collection.address}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className={`
              relative p-4 cursor-pointer
              ${selectedCollection === collection.address ? "ring-2 ring-primary" : ""}
            `}
            onClick={() => selectCollection(collection.address)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold truncate">{collection.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {collection.totalNFTs} NFTs
                </p>
              </div>
              {selectedCollection === collection.address && (
                <Badge variant="secondary" className="ml-2">
                  Selected
                </Badge>
              )}
            </div>

            {selectedCollection === collection.address && (
              <div className="mt-4">
                {isApprovedForAll ? (
                  <div className="flex items-center text-sm text-green-500">
                    <Check className="w-4 h-4 mr-2" />
                    Approved for batch operations
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApproval(collection.address);
                    }}
                  >
                    Approve Collection
                  </Button>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
