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
    if (!window.ethereum) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: new Error('No wallet detected. Please install MetaMask.')
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'connecting' }));

      const [address] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const network = await window.ethereum.request({
        method: 'eth_chainId'
      });

      if (network !== `0x${mainnet.id.toString(16)}`) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${mainnet.id.toString(16)}` }]
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Please switch to Ethereum Mainnet in your wallet."
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
    } catch (error) {
      setState({
        status: 'error',
        address: null,
        error: error as Error
      });

      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: (error as Error).message
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

  return {
    ...state,
    connect,
    disconnect
  };
}