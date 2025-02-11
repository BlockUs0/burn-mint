import { useNFTs } from "@/context/NFTContext";
import { NFTGrid } from "./NFTGrid";
import { CollectionGrid } from "./CollectionGrid";
import { BurnProgress } from "../BurnInterface/BurnProgress";
import { useEffect } from "react";

export function NFTLayout() {
  const { showNFTGrid, selectedCollection } = useNFTs();

  return (
    <div className="w-full">
      {showNFTGrid ? (
        <div className="space-y-6">
          <NFTGrid />
          <BurnProgress />
        </div>
      ) : (
        <CollectionGrid />
      )}
    </div>
  );
}
