import { useCallback, useState } from 'react';
import { WalletState } from '@/types';
import { useToast } from './use-toast';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { getWeb3Challenge, web3Login } from '@/services/auth';

export function useWallet() {
  const { toast } = useToast();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: "Please install MetaMask to continue"
      });
      return;
    }

    try {
      await connectAsync({ connector: injected() });

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet"
      });
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet"
      });
    }
  }, [connectAsync, toast]);

  const authenticate = useCallback(async () => {
    if (!address) return;

    try {
      setIsAuthenticating(true);
      console.log('Starting authentication for address:', address);

      // Get challenge
      const challenge = await getWeb3Challenge(address);
      console.log('Received challenge:', challenge);

      // Sign challenge
      const signature = await signMessageAsync({ 
        message: challenge.code 
      });
      console.log('Message signed:', { signature });

      // Login with signature
      const { accessToken } = await web3Login({
        address,
        signature,
        chain: 'mainnet'
      });

      // Store token
      localStorage.setItem('auth_token', accessToken);

      toast({
        title: "Authentication Successful",
        description: "Your wallet is now connected and authenticated"
      });
    } catch (error: any) {
      console.error('Authentication failed:', error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Failed to authenticate wallet"
      });
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessageAsync, toast]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync();
      localStorage.removeItem('auth_token');
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected"
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [disconnectAsync, toast]);

  const state: WalletState = {
    status: isAuthenticating
      ? 'authenticating'
      : isConnecting || isReconnecting
      ? 'connecting'
      : isConnected
      ? 'connected'
      : 'disconnected',
    address: address ?? null
  };

  return {
    ...state,
    connect,
    authenticate,
    disconnect
  };
}