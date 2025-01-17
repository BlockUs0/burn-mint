import { useNFTs } from "@/hooks/useNFTs";
import { NFTCard } from "./NFTCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";

export function NFTGrid() {
  const { nfts, loading, selectedNFT, selectNFT } = useNFTs();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-3 text-lg text-muted-foreground">
            Fetching your NFTs...
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!nfts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
        <p className="text-muted-foreground max-w-md">
          You don't own any NFTs from this collection yet. Once you acquire NFTs, they will appear here ready for transformation.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nfts.map((nft) => (
        <NFTCard
          key={nft.tokenId}
          nft={nft}
          selected={selectedNFT === nft.tokenId}
          onSelect={() => selectNFT(nft.tokenId)}
        />
      ))}
    </div>
  );
}