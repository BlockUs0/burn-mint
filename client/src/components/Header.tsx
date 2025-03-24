import { WalletButton } from './WalletConnection/WalletButton';
import { SessionTimer } from './SessionTimer';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">NFT Phoenix</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated && <SessionTimer />}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}