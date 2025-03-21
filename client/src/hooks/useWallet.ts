import { useCallback, useState } from "react";
import { WalletState } from "@/types";
import { useToast } from "./use-toast";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";
import { getWeb3Challenge, web3Login, getWalletAddress } from "@/services/auth";
import { useNetwork } from "@/lib/web3Provider";

export function useWallet() {
  const { toast } = useToast();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { chain } = useNetwork();

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

      // Store the access token first
      localStorage.setItem("blockus_access_token", accessToken);
      // Also store auth_token for backward compatibility
      localStorage.setItem("auth_token", accessToken);

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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("blockus_access_token");
      localStorage.removeItem("blockus_user_id");
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, toast, chain]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync();
      localStorage.removeItem("auth_token");
      localStorage.removeItem("blockus_access_token");
      localStorage.removeItem("blockus_user_id");
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
  }, [disconnectAsync, toast]);

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