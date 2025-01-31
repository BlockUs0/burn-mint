import { useNFTs } from "@/hooks/useNFTs";
import { NFTGrid } from "./NFTGrid";
import { CollectionGrid } from "./CollectionGrid";
import { BurnProgress } from "../BurnInterface/BurnProgress";
import { useEffect } from "react";

export function NFTLayout() {
  const { showNFTGrid, selectedCollection } = useNFTs();

  useEffect(() => {
    console.log("NFTLayout re-rendering with:", {
      showNFTGrid,
      selectedCollection
    });
  }, [showNFTGrid, selectedCollection]);

  // Force re-render when showNFTGrid changes
  const content = showNFTGrid ? (
    <div className="space-y-6" key="nft-grid">
      <NFTGrid />
      <BurnProgress />
    </div>
  ) : (
    <CollectionGrid key="collection-grid" />
  );

  return content;
}