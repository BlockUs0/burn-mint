import { Address, Hash } from "viem";

const API_URL = "https://api-staging.blockus.net";
const PROJECT_ID = 'YiodrSuXgHaE3623ilMGacKoehVq';

export type ChallengeResponse = {
  code: string;
  expiresAt: Date;
  address: string;
};

export type LoginResponse = {
  accessToken: string;
};

export async function getWeb3Challenge(address: Address): Promise<ChallengeResponse> {
  try {
    const response = await fetch(`${API_URL}/v1/auth/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PROJECT-ID': PROJECT_ID
      },
      body: JSON.stringify({ 
        address,
        type: 'web3'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Challenge request failed:', error);
      throw new Error(`Failed to get challenge: ${error}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error in getWeb3Challenge:', error);
    throw error;
  }
}

export async function web3Login(params: {
  address: Address;
  signature: Hash;
  chain: string;
}): Promise<LoginResponse> {
  try {
    console.log('Sending login request with params:', {
      address: params.address,
      signature: params.signature,
      chain: params.chain
    });

    const response = await fetch(`${API_URL}/v1/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PROJECT-ID': PROJECT_ID
      },
      body: JSON.stringify({
        address: params.address,
        signature: params.signature,
        chain: params.chain || 'ethereum',
        type: 'web3'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login failed:', errorText);
      throw new Error(`Authentication failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('Login response:', data);

    return data;
  } catch (error) {
    console.error('Error in web3Login:', error);
    throw error;
  }
}