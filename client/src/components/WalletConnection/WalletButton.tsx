
import { Button } from "@/components/ui/button";
import { Flame, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/useWallet";
import { useNetwork } from "@/lib/web3Provider";
import { useSwitchNetwork } from "wagmi";
import { networks } from "@/config/networks";

export function WalletButton() {
  const { status, address, connect, disconnect } = useWallet();
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
    const currentNetwork = networks[chain?.id || 1];
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[180px]">
            {address.slice(0, 6)}...{address.slice(-4)} {currentNetwork?.icon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.values(networks).map((network) => (
            <DropdownMenuItem
              key={network.chain.id}
              onClick={() => switchNetwork?.(network.chain.id)}
            >
              {network.icon} {network.displayName}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={disconnect}>
            Disconnect
          </DropdownMenuItem>
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
