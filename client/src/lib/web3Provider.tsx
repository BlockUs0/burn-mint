
import { createConfig, WagmiProvider, useConfig } from 'wagmi';
import { mainnet, sepolia, goerli } from 'viem/chains';
import { http, createConfig as createViemConfig } from 'viem';
import { injected } from 'wagmi/connectors';

const chains = [mainnet, sepolia, goerli];

const config = createConfig({
  chains: chains,
  transports: Object.fromEntries(
    chains.map(chain => [chain.id, http()])
  ),
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
