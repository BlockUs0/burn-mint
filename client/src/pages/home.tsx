import { WalletButton } from "@/components/WalletConnection/WalletButton";
import { NFTLayout } from "@/components/NFTDisplay/NFTLayout";
import { BurnHistory } from "@/components/BurnHistory/BurnHistory";
import { MintInterface } from "@/components/MintInterface/MintInterface";
import { useWallet } from "@/hooks/useWallet";
import { LockIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBurns } from "@/hooks/useBurns";

export default function Home() {
  const { status: walletStatus, address } = useWallet();
  const isAuthenticated = !!localStorage.getItem("auth_token");
  const { burns } = useBurns({
    walletAddress: address as `0x${string}`,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Phoenix NFT Burning
          </h1>
          <WalletButton />
        </header>

        <main>
          {!walletStatus || walletStatus === "disconnected" ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">
                Connect Your Wallet to Start
              </h2>
              <p className="text-muted-foreground">
                Connect your wallet to access your NFTs
              </p>
            </div>
          ) : walletStatus === "connected" && !isAuthenticated ? (
            <div className="text-center py-20">
              <LockIcon className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-semibold mb-4">
                Authentication Required
              </h2>
              <p className="text-muted-foreground">
                Please sign with your Ethereum wallet to access your NFTs
              </p>
            </div>
          ) : walletStatus === "connected" && isAuthenticated ? (
            <Tabs defaultValue="nfts" className="space-y-6">
              <TabsList className="grid w-[400px] grid-cols-3">
                <TabsTrigger value="nfts">NFTs</TabsTrigger>
                <TabsTrigger value="mint">Mint</TabsTrigger>
                <TabsTrigger value="history">Burn History</TabsTrigger>
              </TabsList>

              <TabsContent value="nfts" className="space-y-6">
                <NFTLayout />
              </TabsContent>

              <TabsContent value="mint">
                <MintInterface />
              </TabsContent>

              <TabsContent value="history">
                <BurnHistory burns={burns?.items || []} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
              <p className="text-muted-foreground">
                Please wait while we connect to your wallet
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}