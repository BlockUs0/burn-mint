import React, { createContext, useContext } from 'react';
import { useNFTs as useNFTsHook } from '@/hooks/useNFTs';

const NFTContext = createContext<ReturnType<typeof useNFTsHook> | null>(null);

export function NFTProvider({ children }: { children: React.ReactNode }) {
  const nftState = useNFTsHook();
  return (
    <NFTContext.Provider value={nftState}>
      {children}
    </NFTContext.Provider>
  );
}

export function useNFTs() {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFTs must be used within an NFTProvider');
  }
  return context;
}
