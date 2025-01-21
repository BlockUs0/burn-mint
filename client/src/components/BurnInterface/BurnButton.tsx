import { Button } from "@/components/ui/button";
import { useBurnState } from "@/hooks/useBurnState";
import { useWallet } from "@/hooks/useWallet";
import { Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { type Address } from "viem";

interface BurnButtonProps {
  tokenId: string;
  tokenAddress: Address;
  disabled?: boolean;
}

export function BurnButton({
  tokenId,
  tokenAddress,
  disabled,
}: BurnButtonProps) {
  const { burn, status } = useBurnState();
  const { address } = useWallet();

  const handleBurn = () => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    burn({ tokenId, tokenAddress, walletAddress: address as Address });
  };

  return (
    <Button
      onClick={handleBurn}
      disabled={disabled || status === "burning" || !address}
      className="w-full bg-red-600 hover:bg-red-700"
    >
      {status === "burning" ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Burning...
        </>
      ) : (
        <motion.div className="flex items-center" whileHover={{ scale: 1.05 }}>
          <Flame className="mr-2 h-4 w-4" />
          Burn NFT
        </motion.div>
      )}
    </Button>
  );
}
