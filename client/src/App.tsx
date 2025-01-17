import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { injected } from 'wagmi/connectors';

// Configure wagmi for Ethereum mainnet
const config = createConfig({
  chains: [mainnet],
  client: ({ chain }) => 
    createPublicClient({
      chain,
      transport: http(),
    }),
  connectors: [injected()]
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;