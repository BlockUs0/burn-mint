import { Button } from "@/components/ui/button";
import { Flame, Loader2, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/useWallet";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { networks } from "@/config/networks";

export function WalletButton() {
  const { status, address, connect, authenticate, disconnect } = useWallet();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  if (status === 'connecting' || status === 'authenticating') {
    return (
      <Button disabled className="min-w-[180px]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {status === 'authenticating' ? 'Authenticating...' : 'Connecting...'}
      </Button>
    );
  }

  if (status === 'connected' && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {address.slice(0, 6)}...{address.slice(-4)} | {networks[chain?.id || 1].icon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.values(networks).map((network) => (
            <DropdownMenuItem
              key={network.chain.id}
              onClick={() => switchNetwork?.(network.chain.id)}
            >
              {network.displayName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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