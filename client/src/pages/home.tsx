import { WalletButton } from "@/components/WalletConnection/WalletButton";
import { NFTGrid } from "@/components/NFTDisplay/NFTGrid";
import { BurnProgress } from "@/components/BurnInterface/BurnProgress";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const { status: walletStatus } = useWallet();

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
          {walletStatus === 'connected' ? (
            <>
              <NFTGrid />
              <BurnProgress />
            </>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet to Start</h2>
              <p className="text-muted-foreground">
                Connect your wallet to view and burn your NFTs
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
