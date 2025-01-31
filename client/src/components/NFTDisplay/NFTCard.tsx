import { Card } from "@/components/ui/card";
import { NFT } from "@/types";
import { motion } from "framer-motion";
import { FireParticles } from "../animations/FireParticles";
import { Badge } from "@/components/ui/badge";

interface NFTCardProps {
  nft: NFT;
  selected: boolean;
  onSelect: () => void;
}

export function NFTCard({ nft, selected, onSelect }: NFTCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`
          relative overflow-hidden cursor-pointer
          ${selected ? "ring-2 ring-primary" : ""}
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
              e.currentTarget.src =
                "https://placehold.co/200x200/orange/white?text=NFT";
            }}
          />
          {nft.tokenType === "ERC1155" && nft.balance && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            >
              x{nft.balance}
            </Badge>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm truncate">
              {nft.name || `NFT #${nft.tokenId}`}
            </h3>
            <Badge variant="outline" className="text-xs">
              {nft.tokenType || "ERC721"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {nft.description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}