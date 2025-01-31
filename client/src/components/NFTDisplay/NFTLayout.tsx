import { useNFTs } from "@/hooks/useNFTs";
import { NFTGrid } from "./NFTGrid";
import { CollectionGrid } from "./CollectionGrid";
import { BurnProgress } from "../BurnInterface/BurnProgress";

export function NFTLayout() {
  const { showNFTGrid } = useNFTs();

  console.log("NFTLayout rendering, showNFTGrid:", showNFTGrid);
  
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
