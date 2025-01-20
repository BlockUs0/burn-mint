import { createConfig, WagmiProvider, useConfig } from 'wagmi';
import { mainnet, sepolia, goerli } from 'viem/chains';
import { http } from 'viem';
import { injected } from 'wagmi/connectors';

const chains = [mainnet, sepolia, goerli] as const;

const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [goerli.id]: http()
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
  return {
    chain: config.state.chainId ? 
      chains.find(c => c.id === config.state.chainId) : 
      chains[0]
  };
}