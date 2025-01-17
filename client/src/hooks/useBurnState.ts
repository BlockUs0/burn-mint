import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BurnState } from '@/types';
import { burnNFT } from '@/services/web3';
import { registerBurn } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export function useBurnState() {
  const [state, setState] = useState<BurnState>({
    status: 'idle',
    burnCount: 0,
    canMint: false
  });
  const { toast } = useToast();

  const { mutate: burn } = useMutation({
    mutationFn: async (tokenId: string) => {
      setState(prev => ({ ...prev, status: 'burning' }));
      
      // Execute burn transaction
      const txHash = await burnNFT(tokenId);
      
      // Register burn with backend
      await registerBurn({ tokenId, txHash });
      
      setState(prev => ({
        status: 'completed',
        burnCount: prev.burnCount + 1,
        canMint: prev.burnCount + 1 >= 2
      }));
    },
    onError: (error) => {
      setState(prev => ({ ...prev, status: 'error' }));
      toast({
        variant: "destructive",
        title: "Error burning NFT",
        description: (error as Error).message
      });
    }
  });

  return {
    ...state,
    burn
  };
}
