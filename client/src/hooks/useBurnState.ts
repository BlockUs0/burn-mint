import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BurnState } from '@/types';
import nftService from '@/services/web3';
import { registerBurn } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { type Address } from 'viem';

export function useBurnState() {
  const [state, setState] = useState<BurnState>({
    status: 'idle',
    burnCount: 0,
    canMint: false
  });
  const { toast } = useToast();

  const { mutate: burn } = useMutation({
    mutationFn: async ({ tokenId, tokenAddress }: { tokenId: string; tokenAddress: Address }) => {
      setState(prev => ({ ...prev, status: 'burning' }));

      try {
        // Execute burn transaction
        const txHash = await nftService.burnNFT(tokenAddress, tokenId);

        // Register burn with backend
        await registerBurn({ tokenId, txHash, tokenAddress });

        setState(prev => ({
          status: 'completed',
          burnCount: prev.burnCount + 1,
          canMint: prev.burnCount + 1 >= 2
        }));

        toast({
          title: "NFT Burned Successfully",
          description: "Your NFT has been transformed into pure energy",
        });
      } catch (error) {
        setState(prev => ({ ...prev, status: 'error' }));
        toast({
          variant: "destructive",
          title: "Error burning NFT",
          description: (error as Error).message
        });
        throw error;
      }
    }
  });

  return {
    ...state,
    burn
  };
}