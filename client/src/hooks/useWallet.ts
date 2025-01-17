import { useState, useCallback } from 'react';
import { mainnet } from 'viem/chains';
import { WalletState } from '@/types';
import { useToast } from './use-toast';

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    status: 'disconnected',
    address: null
  });
  const { toast } = useToast();

  const connect = useCallback(async () => {
    console.log('Attempting wallet connection...');

    if (!window.ethereum) {
      console.error('No ethereum provider found');
      setState(prev => ({
        ...prev,
        status: 'error',
        error: new Error('No wallet detected. Please install MetaMask.')
      }));

      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: "Please install MetaMask to continue"
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'connecting' }));
      console.log('Requesting accounts...');

      // Request account access
      const [address] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('Got address:', address);

      // Check network
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      console.log('Current chainId:', chainId, 'Expected:', `0x${mainnet.id.toString(16)}`);

      if (chainId !== `0x${mainnet.id.toString(16)}`) {
        console.log('Wrong network, requesting switch...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${mainnet.id.toString(16)}` }]
          });
          console.log('Network switched successfully');
        } catch (error: any) {
          console.error('Network switch failed:', error);
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Please switch to Ethereum Mainnet in your wallet"
          });
          throw error;
        }
      }

      setState({
        status: 'connected',
        address
      });

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Ethereum Mainnet"
      });

      // Setup event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

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

  const handleAccountsChanged = (accounts: string[]) => {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      disconnect();
    } else {
      setState(prev => ({
        ...prev,
        address: accounts[0]
      }));
    }
  };

  const handleChainChanged = (chainId: string) => {
    console.log('Chain changed:', chainId);
    if (chainId !== `0x${mainnet.id.toString(16)}`) {
      disconnect();
      toast({
        variant: "destructive",
        title: "Network Changed",
        description: "Please switch back to Ethereum Mainnet"
      });
    }
  };

  const disconnect = useCallback(() => {
    console.log('Disconnecting wallet...');
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }

    setState({
      status: 'disconnected',
      address: null
    });

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected"
    });
  }, [toast]);

  return {
    ...state,
    connect,
    disconnect
  };
}