import { useCallback, useState } from "react";
import { WalletState } from "@/types";
import { useToast } from "./use-toast";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";
import { getWeb3Challenge, web3Login, getWalletAddress } from "@/services/auth";
import { useNetwork } from "@/lib/web3Provider";
import { useAuth } from "@/context/AuthContext";

export function useWallet() {
  const { toast } = useToast();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { chain } = useNetwork();
  const auth = useAuth();

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: "Please install MetaMask to continue",
      });
      return;
    }

    try {
      await connectAsync({ connector: injected() });

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
      });
    }
  }, [connectAsync, toast]);

  const authenticate = useCallback(async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Wallet address not found",
      });
      return;
    }

    if (!chain) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "No chain selected",
      });
      return;
    }

    try {
      setIsAuthenticating(true);

      // Get challenge
      const challenge = await getWeb3Challenge(address);

      // Sign challenge
      const signature = await signMessageAsync({
        message: JSON.stringify(challenge),
      });

      // Login with signature
      const { accessToken } = await web3Login({
        address,
        signature,
        chain: "ethereum", // Always use ethereum for web3Login
      });

      // Store tokens in localStorage for backwards compatibility
      localStorage.setItem("blockus_access_token", accessToken);
      
      // Try to parse the JWT token to get actual expiration time
      let expiryTime = 20; // Default to 20 seconds for testing
      try {
        // Split the JWT token and decode the payload (middle part)
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Token payload:', tokenPayload);
        
        if (tokenPayload.exp) {
          // Calculate seconds until expiry
          const expiryDate = new Date(tokenPayload.exp * 1000);
          const currentDate = new Date();
          expiryTime = Math.floor((expiryDate.getTime() - currentDate.getTime()) / 1000);
          console.log(`Token expires at: ${expiryDate.toLocaleString()}, seconds until expiry: ${expiryTime}`);
        }
      } catch (parseError) {
        console.warn("Could not parse JWT expiration, using default:", parseError);
      }
      
      // Use the AuthContext login (this will setup token expiration)
      auth.login(accessToken, expiryTime);
      
      // Get user ID using the current chain
      // await getWalletAddress(chain.name.toLowerCase());

      toast({
        title: "Authentication Successful",
        description: "Your wallet is now connected and authenticated",
      });
    } catch (error: any) {
      console.error("Authentication failed:", error);

      // Extract the most user-friendly error message
      const errorMessage = error.message?.includes("Authentication failed:")
        ? error.message
        : "Failed to authenticate wallet. Please try again.";

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: errorMessage,
      });

      // Clean up any partial authentication state
      auth.logout();
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, toast, chain, auth]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync();
      // Use AuthContext to handle logout which will clear tokens
      auth.logout();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast({
        variant: "destructive",
        title: "Disconnect Error",
        description: "Failed to disconnect wallet",
      });
    }
  }, [disconnectAsync, toast, auth]);

  const state: WalletState = {
    status: isAuthenticating
      ? "authenticating"
      : isConnecting || isReconnecting
        ? "connecting"
        : isConnected
          ? "connected"
          : "disconnected",
    address: address ?? null,
  };

  return {
    ...state,
    connect,
    authenticate,
    disconnect,
  };
}