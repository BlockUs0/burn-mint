import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Flame, Loader2, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletButton() {
  const { status, address, connect, authenticate, disconnect } = useWallet();

  if (status === 'connecting' || status === 'authenticating') {
    return (
      <Button disabled className="min-w-[180px]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {status === 'authenticating' ? 'Authenticating...' : 'Connecting...'}
      </Button>
    );
  }

  if (status === 'connected' && address) {
    const isAuthenticated = !!localStorage.getItem('auth_token');

    if (isAuthenticated) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline"
              className="min-w-[180px] bg-gradient-to-r from-orange-500/10 to-red-600/10 hover:from-orange-500/20 hover:to-red-600/20 border-orange-500/20"
            >
              <motion.span
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                className="truncate max-w-[150px] font-mono"
              >
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
              </motion.span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem onClick={disconnect} className="text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button 
        onClick={authenticate}
        className="min-w-[180px] bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
      >
        <Flame className="mr-2 h-4 w-4 animate-pulse" />
        Sign In
      </Button>
    );
  }

  return (
    <Button 
      onClick={connect}
      className="min-w-[180px] bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
    >
      <Flame className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}