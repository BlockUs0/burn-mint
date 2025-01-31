import { Button } from "@/components/ui/button";
import { useBurnState } from "@/hooks/useBurnState";
import { useWallet } from "@/hooks/useWallet";
import { useBurns } from "@/hooks/useBurns";
import { Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { type Address } from "viem";
import { useEffect } from "react";

interface BurnButtonProps {
  tokenIds: string | string[];
  tokenAddress: Address;
  disabled?: boolean;
  isBatch?: boolean;
}

export function BurnButton({
  tokenIds,
  tokenAddress,
  disabled,
  isBatch = false,
}: BurnButtonProps) {
  const { burn, status } = useBurnState();
  const { address } = useWallet();
  const { burns, isLoading } = useBurns({
    walletAddress: address as Address,
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    if (address && burns && !isLoading) {
      console.log("Current burn history for wallet:", burns);
    }
  }, [address, burns, isLoading]);

  const handleBurn = () => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    if (isBatch && Array.isArray(tokenIds)) {
      // Handle batch burn
      burn({
        tokenIds,
        tokenAddress,
        walletAddress: address as Address,
        isBatch: true,
      });
    } else if (!Array.isArray(tokenIds)) {
      // Handle single burn
      burn({
        tokenIds: [tokenIds],
        tokenAddress,
        walletAddress: address as Address,
        isBatch: false,
      });
    }
  };

  const buttonText = isBatch
    ? `Burn ${Array.isArray(tokenIds) ? tokenIds.length : 0} NFTs`
    : "Burn NFT";

  return (
    <Button
      onClick={handleBurn}
      disabled={disabled || status === "burning" || !address}
      className="bg-red-600 hover:bg-red-700"
    >
      {status === "burning" ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isBatch ? "Burning NFTs..." : "Burning..."}
        </>
      ) : (
        <motion.div className="flex items-center" whileHover={{ scale: 1.05 }}>
          <Flame className="mr-2 h-4 w-4" />
          {buttonText}
        </motion.div>
      )}
    </Button>
  );
}