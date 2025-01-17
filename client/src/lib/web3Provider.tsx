import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { injected } from 'wagmi/connectors';

// Configure wagmi for Ethereum mainnet with MetaMask only
const config = createConfig({
  chains: [mainnet],
  client: ({ chain }) =>
    createPublicClient({
      chain,
      transport: http(),
    }),
  connectors: [injected()]
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}