import { useNFTs } from "@/context/NFTContext";
import { NFTCard } from "./NFTCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BurnButton } from "../BurnInterface/BurnButton";

export function NFTGrid() {
  const { 
    collections,
    loading,
    selectedCollection,
    selectCollection,
    selectedNFTs,
    toggleNFTSelection,
  } = useNFTs();

  const selectedCollectionData = selectedCollection 
    ? collections.find(c => c.address === selectedCollection)
    : null;

  const handleBack = () => {
    selectCollection(''); 
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-3 text-lg text-muted-foreground">
            Fetching your NFTs...
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={`skeleton-${i}`}
              className="aspect-square rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!selectedCollectionData?.nfts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
        <p className="text-muted-foreground max-w-md">
          No NFTs found in this collection. Please select a different collection.
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={handleBack}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Collections
        </Button>
      </div>
    );
  }

  const selectedNFTsArray = selectedCollectionData.nfts.filter(nft => 
    selectedNFTs.has(nft.tokenId)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {selectedCollectionData.name} ({selectedCollectionData.nfts.length} NFTs)
          </h2>
          {selectedNFTsArray.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedNFTsArray.length} NFT{selectedNFTsArray.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {selectedNFTsArray.length > 0 && (
            <BurnButton
              tokenIds={selectedNFTsArray.map(nft => nft.tokenId)}
              tokenAddress={selectedCollection as `0x${string}`}
              isBatch={true}
            />
          )}
          <Button
            variant="ghost"
            onClick={handleBack}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {selectedCollectionData.nfts.map((nft) => (
          <NFTCard
            key={`nft-${nft.tokenId}`}
            nft={nft}
            selected={selectedNFTs.has(nft.tokenId)}
            onSelect={() => toggleNFTSelection(nft.tokenId)}
          />
        ))}
      </div>
    </div>
  );
}