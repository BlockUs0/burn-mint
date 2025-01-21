import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BurnHistory from "@/pages/burn-history";
import { Web3Provider } from "@/lib/web3Provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/burn-history" component={BurnHistory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </Web3Provider>
  );
}

export default App;