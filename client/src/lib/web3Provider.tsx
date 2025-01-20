
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet, sepolia, goerli } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { injected } from 'wagmi/connectors';
import { networks } from '@/config/networks';

const chains = [mainnet, sepolia, goerli];

const config = createConfig({
  chains,
  transports: chains.reduce((acc, chain) => ({
    ...acc,
    [chain.id]: http(),
  }), {}),
  connectors: [injected()]
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}
