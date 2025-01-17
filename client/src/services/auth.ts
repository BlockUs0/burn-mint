import { Address, Hash } from "viem";

const API_URL = "https://api-staging.blockus.net";

export type ChallengeResponse = {
  code: string;
  expiresAt: Date;
  address: string;
};

export type LoginResponse = {
  accessToken: string;
};

export async function getWeb3Challenge(address: Address): Promise<ChallengeResponse> {
  const response = await fetch(`${API_URL}/v1/auth/challenge?type=web3`, {
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
  chain: 'base';
}): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/v1/players/login?type=web3`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PROJECT-ID': 'YiodrSuXgHaE3623ilMGacKoehVq'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate');
  }

  return response.json();
}