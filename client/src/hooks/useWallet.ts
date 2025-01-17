import { useState, useCallback, useEffect } from 'react';
import { custom } from 'viem';
import { WalletState } from '@/types';
import { useToast } from './use-toast';

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    status: 'disconnected',
    address: null
  });

  const { toast } = useToast();

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
      setState({ status: 'connecting', address: null });

      // Request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Switch to mainnet if needed
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }], // Mainnet
        });
      } catch (switchError: any) {
        console.error('Failed to switch network:', switchError);
      }

      setState({
        status: 'connected',
        address: accounts[0]
      });

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet"
      });
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      setState({
        status: 'error',
        address: null,
        error: error as Error
      });

      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet"
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    setState({
      status: 'disconnected',
      address: null
    });

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected"
    });
  }, [toast]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (state.status === 'connected' && accounts[0] !== state.address) {
        setState({
          status: 'connected',
          address: accounts[0]
        });
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [state.status, state.address, disconnect]);

  return {
    ...state,
    connect,
    disconnect
  };
}