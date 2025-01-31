import { useNFTs } from "@/hooks/useNFTs";
import { NFTGrid } from "./NFTGrid";
import { CollectionGrid } from "./CollectionGrid";
import { BurnProgress } from "../BurnInterface/BurnProgress";
import { useEffect } from "react";

export function NFTLayout() {
  const { showNFTGrid } = useNFTs();

  useEffect(() => {
    console.log("NFTLayout re-rendering with showNFTGrid:", showNFTGrid);
    return () => {
      console.log("NFTLayout cleanup");
    };
  }, [showNFTGrid]);

  if (showNFTGrid) {
    return (
      <div className="space-y-6">
        <NFTGrid />
        <BurnProgress />
      </div>
    );
  }

  return <CollectionGrid />;
}

export default NFTLayout;