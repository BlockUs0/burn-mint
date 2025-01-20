export interface NFT {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  tokenType?: 'ERC721' | 'ERC1155';
  balance?: string;
}

export type WalletState = {
  status: 'disconnected' | 'connecting' | 'connected' | 'authenticating' | 'error';
  address: string | null;
  error?: Error;
};

export type NFTDisplayState = {
  loading: boolean;
  error: Error | null;
  nfts: NFT[];
  selectedNFT: string | null;
};

export type BurnState = {
  status: 'idle' | 'burning' | 'completed' | 'error';
  burnCount: number;
  canMint: boolean;
};

export interface BurnRecord {
  id: string;
  tokenId: string;
  txHash: string;
  timestamp: string;
}

export interface BurnQueryDto {
  limit: number;
  page?: number;
}

export interface BurnPaginatedResponse {
  data: BurnRecord[];
  pagination: {
    limit: number;
    page: number;
    total: number;
  };
}