import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function WalletButton() {
  const { status, address, connect, disconnect } = useWallet();

  if (status === 'connecting') {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (status === 'connected' && address) {
    return (
      <Button 
        variant="outline"
        onClick={disconnect}
        className="group"
      >
        <motion.span
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
          className="truncate max-w-[150px]"
        >
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </motion.span>
      </Button>
    );
  }

  if (status === 'error') {
    return (
      <Button 
        variant="destructive"
        onClick={connect}
      >
        Retry Connection
      </Button>
    );
  }

  return (
    <Button 
      onClick={connect}
      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
    >
      <Flame className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}