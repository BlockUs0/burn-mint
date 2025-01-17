import { useCallback } from 'react';
import { WalletState } from '@/types';
import { useToast } from './use-toast';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function useWallet() {
  const { toast } = useToast();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();

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

  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected"
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [disconnectAsync, toast]);

  const state: WalletState = {
    status: isConnecting || isReconnecting
      ? 'connecting'
      : isConnected
      ? 'connected'
      : 'disconnected',
    address: address ?? null
  };

  return {
    ...state,
    connect,
    disconnect
  };
}