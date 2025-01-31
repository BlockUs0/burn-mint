export interface NFT {
  tokenId: string;
  tokenAddress: string;
  name: string;
  description: string;
  image: string;
  tokenType?: 'ERC721' | 'ERC1155';
  balance?: string;
}

export interface NFTCollection {
  address: string;
  name: string;
  nfts: NFT[];
  totalNFTs: number;
  chainId: number;
}

export type WalletState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'authenticating' | 'error';
  address: string | null;
  error?: Error;
};

export type NFTDisplayState = {
  loading: boolean;
  error: Error | null;
  collections: NFTCollection[];
  selectedCollection: string | null;
  selectedNFTs: Set<string>;
  isApprovedForAll: boolean;
};

export type BurnState = {
  status: 'idle' | 'approving' | 'burning' | 'completed' | 'error';
  burnCount: number;
  canMint: boolean;
  error?: string;
};

export interface BurnRecord {
  id: string;
  tokenId: string;
  chain: string;
  walletAddress: string;
  burnProof: {
    type: 'evm';
    txHash: string;
  };
  amount: number;
  timestamp: string;
}

export interface BurnQueryDto {
  limit: number;
  page?: number;
  walletAddress?: string;
}

export interface BurnPaginatedResponse {
  data: BurnRecord[];
  pagination: {
    limit: number;
    page: number;
    total: number;
  };
}