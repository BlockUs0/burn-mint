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
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-2">{nft.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 truncate">
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
