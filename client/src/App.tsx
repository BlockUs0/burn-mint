import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { Web3Provider } from "@/lib/web3Provider";
import { NFTProvider } from "@/context/NFTContext";
import { AuthProvider } from "@/context/AuthContext";

import { Header } from "@/components/Header";

function Router() {
  return (
    <>
      <Header />
      <main className="container py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <AuthProvider>
          <NFTProvider>
            <Router />
            <Toaster />
          </NFTProvider>
        </AuthProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;