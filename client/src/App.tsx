import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { Web3Provider } from "@/lib/web3Provider";
import { NFTProvider } from "@/context/NFTContext";

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
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <NFTProvider>
          <Router />
          <Toaster />
        </NFTProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;