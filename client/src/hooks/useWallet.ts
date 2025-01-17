import { useState, useCallback } from 'react';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { arbitrum } from 'viem/chains';
import { WalletState } from '@/types';

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    status: 'disconnected',
    address: null
  });

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: new Error('No wallet detected')
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

      if (network !== arbitrum.id) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${arbitrum.id.toString(16)}` }]
        });
      }

      setState({
        status: 'connected',
        address
      });
    } catch (error) {
      setState({
        status: 'error',
        address: null,
        error: error as Error
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      status: 'disconnected',
      address: null
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect
  };
}
