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
import { useSwitchChain } from "wagmi";
import { networks } from "@/config/networks";
import { useToast } from "@/hooks/use-toast";

export function WalletButton() {
  const { status, address, connect, disconnect } = useWallet();
  const { chain, isSupported } = useNetwork();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();

  if (status === 'connecting' || status === 'authenticating') {
    return (
      <Button disabled className="min-w-[180px]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {status === 'authenticating' ? 'Authenticating...' : 'Connecting...'}
      </Button>
    );
  }

  if (status === 'connected' && address) {
    const currentNetwork = chain?.id ? networks[chain.id] : networks[1];

    // Show warning if on unsupported network
    if (!isSupported) {
      toast({
        variant: "destructive",
        title: "Unsupported Network",
        description: "Please switch to a supported network"
      });
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`min-w-[180px] ${!isSupported ? 'border-red-500' : ''}`}
          >
            {address.slice(0, 6)}...{address.slice(-4)} {currentNetwork?.icon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.values(networks).map((network) => (
            <DropdownMenuItem
              key={network.chain.id}
              onClick={async () => {
                try {
                  if (switchChain) {
                    await switchChain({ chainId: network.chain.id });
                    toast({
                      title: "Network Changed",
                      description: `Switched to ${network.displayName}`
                    });
                  }
                } catch (error: any) {
                  console.error('Network switch failed:', error);
                  toast({
                    variant: "destructive",
                    title: "Network Switch Failed",
                    description: error.message || "Failed to switch network"
                  });
                }
              }}
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