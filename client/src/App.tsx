import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProtectedPage from "@/pages/protected";
import AuthTestPage from "@/pages/auth-test";
import { Web3Provider } from "@/lib/web3Provider";
import { NFTProvider } from "@/context/NFTContext";
import withAuth from "@/lib/withAuth";

function RouterComponent() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/protected">
        <ProtectedPage />
      </Route>
      <Route path="/auth-test">
        <AuthTestPage />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

// Apply authentication to all routes
const Router = withAuth(RouterComponent);

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