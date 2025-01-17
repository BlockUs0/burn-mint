import { useNFTs } from "@/hooks/useNFTs";
import { NFTCard } from "./NFTCard";
import { Skeleton } from "@/components/ui/skeleton";

export function NFTGrid() {
  const { nfts, loading, selectedNFT, selectNFT } = useNFTs();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (!nfts.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No NFTs found in your wallet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
