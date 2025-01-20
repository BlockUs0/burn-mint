import { BurnRecord, BurnQueryDto } from '@/types';
import { type Address } from 'viem';

const API_BASE = '/api/v1';

export async function registerBurn(data: { tokenId: string, tokenAddress: Address, txHash: string }): Promise<BurnRecord> {
  const response = await fetch(`${API_BASE}/burns/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to register burn');
  }

  return response.json();
}

export async function getBurns(query: BurnQueryDto) {
  const params = new URLSearchParams({
    limit: query.limit.toString(),
    page: (query.page || 1).toString()
  });

  const response = await fetch(`${API_BASE}/burns?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch burns');
  }

  return response.json();
}