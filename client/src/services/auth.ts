import { Address, Hash } from "viem";

const API_BASE = '/api/v1';

export type ChallengeResponse = {
  code: string;
  expiresAt: Date;
  address: string;
};

export type LoginResponse = {
  accessToken: string;
};

export async function getWeb3Challenge(address: Address): Promise<ChallengeResponse> {
  const response = await fetch(`${API_BASE}/auth/challenge?type=web3`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address })
  });

  if (!response.ok) {
    throw new Error('Failed to get challenge');
  }

  return response.json();
}

export async function web3Login(params: {
  address: Address;
  signature: Hash;
}): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login?type=web3`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...params,
      chain: 'mainnet'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate');
  }

  return response.json();
}
