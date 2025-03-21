import { createConfig, WagmiProvider, useConfig } from 'wagmi';
import { mainnet, sepolia, polygon, zksync } from 'viem/chains';
import { http } from 'viem';
import { injected } from 'wagmi/connectors';
import { isChainSupported } from '@/config/networks';

const chains = [mainnet, sepolia, polygon, zksync] as const;

const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [zksync.id]: http(),
  },
  connectors: [injected()]
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}

export function useNetwork() {
  const config = useConfig();
  const chainId = config.state.chainId;

  return {
    chain: chainId && isChainSupported(chainId) ? 
      chains.find(c => c.id === chainId) : 
      chains[0],
    isSupported: chainId ? isChainSupported(chainId) : true
  };
}