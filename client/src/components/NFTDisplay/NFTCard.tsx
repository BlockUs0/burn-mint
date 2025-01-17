import { Card } from "@/components/ui/card";
import { NFT } from "@/types";
import { motion } from "framer-motion";
import { FireParticles } from "../animations/FireParticles";
import { BurnButton } from "../BurnInterface/BurnButton";

interface NFTCardProps {
  nft: NFT;
  selected: boolean;
  onSelect: () => void;
}

export function NFTCard({ nft, selected, onSelect }: NFTCardProps) {
  console.log('NFTCard rendering with data:', nft);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`
          relative overflow-hidden cursor-pointer
          ${selected ? 'ring-2 ring-primary' : ''}
        `}
        onClick={onSelect}
      >
        {selected && <FireParticles />}

        <div className="aspect-square relative">
          <img 
            src={nft.image} 
            alt={nft.name}
            className="object-cover w-full h-full rounded-t-lg"
            onError={(e) => {
              console.log('Image failed to load:', nft.image);
              e.currentTarget.src = 'https://placehold.co/200x200/orange/white?text=NFT';
            }}
          />
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-sm truncate mb-1">
            {nft.name || `NFT #${nft.tokenId}`}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {nft.description}
          </p>

          <BurnButton
            tokenId={nft.tokenId}
            disabled={!selected}
          />
        </div>
      </Card>
    </motion.div>
  );
}