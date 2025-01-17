import { Button } from "@/components/ui/button";
import { useBurnState } from "@/hooks/useBurnState";
import { Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface BurnButtonProps {
  tokenId: string;
  disabled?: boolean;
}

export function BurnButton({ tokenId, disabled }: BurnButtonProps) {
  const { burn, status } = useBurnState();

  return (
    <Button
      onClick={() => burn(tokenId)}
      disabled={disabled || status === 'burning'}
      className="w-full bg-red-600 hover:bg-red-700"
    >
      {status === 'burning' ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Burning...
        </>
      ) : (
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <Flame className="mr-2 h-4 w-4" />
          Burn NFT
        </motion.div>
      )}
    </Button>
  );
}
